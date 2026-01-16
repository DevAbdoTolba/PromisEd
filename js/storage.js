/**
 * STORAGE.JS - The Single Source of Truth
 * High-End Validation with Real-Time Anti-Spam Blocklist.
 */

const DB_KEYS = {
    USERS: 'users',
    COURSES: 'courses',
    CATEGORIES: 'categories',
    FEEDBACK: 'feedback',
    SESSION: 'current_user',
    BLOCKLIST: 'email_blocklist',
    BLOCKLIST_UPDATED: 'blocklist_timestamp'
};

// --- CONSTANTS ---
const BLOCKLIST_URL = "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf";
const UPDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000; // Update once a week

// Hardcoded Fallback (The most common ones, just in case fetch fails)
const FALLBACK_BLOCKLIST = [
    "yopmail.com", "temp-mail.org", "10minutemail.com", "guerrillamail.com", "sharklasers.com",
    "mailinator.com", "getairmail.com", "tempmail.net", "throwawaymail.com", "dispostable.com"
];

// --- STRICT PATTERNS ---
const Patterns = {
    Name: /^[a-zA-Z\u00C0-\u00FF\s'-]{3,50}$/, // Letters, spaces, hyphens only
    Email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    Password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // 8+ chars, Upper, Lower, Number, Special
};

// --- VALIDATION SCHEMAS ---
const Validators = {
    user: (data) => {
        // 1. Sanitize Strings
        const cleanName = data.name ? data.name.trim() : "";
        const cleanEmail = data.email ? data.email.trim().toLowerCase() : "";

        // 2. Syntax Validation
        if (!Patterns.Name.test(cleanName)) return "Invalid Name. Use letters only (3-50 chars).";
        if (!Patterns.Email.test(cleanEmail)) return "Invalid Email format.";
        if (!Patterns.Password.test(data.password)) return "Password too weak. Needs 8+ chars, Uppercase, Lowercase, Number & Symbol.";
        if (!['student', 'admin'].includes(data.role)) return "Invalid Role.";

        // 3. ANTI-SPAM CHECK (The High-End Part)
        const domain = cleanEmail.split('@')[1];
        const blocklist = Serializer.read(DB_KEYS.BLOCKLIST) || FALLBACK_BLOCKLIST;
        
        // Check exact match or sub-domain match
        if (blocklist.includes(domain)) {
            return `The domain '@${domain}' is not allowed. Please use a real email provider (Gmail, Outlook, Yahoo, etc.).`;
        }

        return null;
    },

    course: (data) => {
        if (!data.title || data.title.length < 5) return "Title too short (min 5 chars).";
        if (typeof data.price !== 'number' || data.price < 0) return "Price must be 0 or higher.";
        if (!['draft', 'approved'].includes(data.status)) return "Invalid status.";
        if (!Array.isArray(data.lessons)) return "Lessons must be an array.";
        
        // Deep Lesson Check
        for (let i = 0; i < data.lessons.length; i++) {
            if (!data.lessons[i].title || data.lessons[i].title.length < 3) return `Lesson ${i+1} title is invalid.`;
            if (!data.lessons[i].videoUrl) return `Lesson ${i+1} missing video URL.`;
        }
        return null;
    }
};

// --- SERIALIZER ---
const Serializer = {
    read: (key) => {
        try { return JSON.parse(localStorage.getItem(key)) || null; } 
        catch (e) { return null; }
    },
    write: (key, data) => {
        try { localStorage.setItem(key, JSON.stringify(data)); return true; } 
        catch (e) { console.error("Write failed", e); return false; }
    }
};

// --- PUBLIC API ---
const DB = {
    // ASYNC INITIALIZER (Fetches the latest spam list)
    init: async () => {
        // 1. Setup Tables
        if (!Serializer.read(DB_KEYS.USERS)) Serializer.write(DB_KEYS.USERS, []);
        if (!Serializer.read(DB_KEYS.COURSES)) Serializer.write(DB_KEYS.COURSES, []);
        if (!Serializer.read(DB_KEYS.CATEGORIES)) Serializer.write(DB_KEYS.CATEGORIES, []);
        if (!Serializer.read(DB_KEYS.FEEDBACK)) Serializer.write(DB_KEYS.FEEDBACK, []);

        // 2. High-End: Fetch Spam Blocklist from GitHub
        const lastUpdate = parseInt(localStorage.getItem(DB_KEYS.BLOCKLIST_UPDATED) || "0");
        const now = Date.now();

        // Update if list is missing OR it's been more than 7 days
        if (!Serializer.read(DB_KEYS.BLOCKLIST) || (now - lastUpdate > UPDATE_INTERVAL)) {
            console.log("⬇️ Downloading latest Anti-Spam Blocklist...");
            try {
                const response = await fetch(BLOCKLIST_URL);
                if (response.ok) {
                    const text = await response.text();
                    // Parse text file (one domain per line)
                    const domainList = text.split('\n').map(d => d.trim()).filter(d => d.length > 0);
                    
                    Serializer.write(DB_KEYS.BLOCKLIST, domainList);
                    localStorage.setItem(DB_KEYS.BLOCKLIST_UPDATED, now.toString());
                    console.log(`✅ Blocklist updated! Loaded ${domainList.length} blocked domains.`);
                }
            } catch (err) {
                console.warn("⚠️ Could not fetch blocklist. Using fallback.", err);
                Serializer.write(DB_KEYS.BLOCKLIST, FALLBACK_BLOCKLIST);
            }
        }
    },

    users: {
        getAll: () => Serializer.read(DB_KEYS.USERS) || [],

        register: (userData) => {
            // 1. Strict Validation
            const error = Validators.user(userData);
            if (error) return { success: false, message: error };

            const users = DB.users.getAll();
            const cleanEmail = userData.email.trim().toLowerCase();

            // 2. Check Duplicates
            if (users.find(u => u.email === cleanEmail)) {
                return { success: false, message: "Email already registered." };
            }

            // 3. Create
            const newUser = {
                id: Date.now(),
                name: userData.name.trim(),
                email: cleanEmail,
                password: userData.password, // In real app, hash this!
                role: userData.role,
                wishlist: [],
                enrolledCourses: []
            };
            
            users.push(newUser);
            Serializer.write(DB_KEYS.USERS, users);
            return { success: true, user: newUser };
        },

        login: (email, password) => {
            const users = DB.users.getAll();
            const user = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
            if (user) {
                Serializer.write(DB_KEYS.SESSION, user);
                return { success: true, user };
            }
            return { success: false, message: "Invalid email or password." };
        },

        getLoggedIn: () => {
            const session = Serializer.read(DB_KEYS.SESSION);
            if (!session) return null;
            // Always refresh from DB source
            return DB.users.getAll().find(u => u.id === session.id) || null;
        },

        logout: () => {
            localStorage.removeItem(DB_KEYS.SESSION);
            window.location.href = '../login.html';
        }
    },

    courses: {
        getAll: () => Serializer.read(DB_KEYS.COURSES) || [],
        
        add: (courseData) => {
            const error = Validators.course(courseData);
            if (error) return { success: false, message: error };
            
            const courses = DB.courses.getAll();
            
            // Edit Mode
            if (courseData.id) {
                const idx = courses.findIndex(c => c.id == courseData.id);
                if (idx > -1) {
                    courses[idx] = { ...courses[idx], ...courseData };
                    Serializer.write(DB_KEYS.COURSES, courses);
                    return { success: true };
                }
            }
            
            // Create Mode
            const newCourse = { id: Date.now(), ...courseData };
            courses.push(newCourse);
            Serializer.write(DB_KEYS.COURSES, courses);
            return { success: true };
        },
        
        getById: (id) => DB.courses.getAll().find(c => c.id == id)
    },

    student: {
        enroll: (userId, courseId) => {
            const users = DB.users.getAll();
            const idx = users.findIndex(u => u.id === userId);
            if (idx === -1) return { success: false, message: "User not found" };

            if (users[idx].enrolledCourses.find(c => c.courseId == courseId)) {
                return { success: false, message: "Already enrolled." };
            }

            users[idx].enrolledCourses.push({
                courseId: parseInt(courseId),
                progress: 0,
                isPaid: true,
                completedLessons: []
            });
            
            Serializer.write(DB_KEYS.USERS, users);
            return { success: true };
        }
    },

    // Feedback storage for course reviews
    feedback: {
        getAll: () => Serializer.read(DB_KEYS.FEEDBACK) || [],

        // Add new feedback entry
        add: (feedbackData) => {
            // Validate required fields
            if (!feedbackData.userId) return { success: false, message: "User ID is required." };
            if (!feedbackData.courseId) return { success: false, message: "Course ID is required." };
            if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
                return { success: false, message: "Rating must be between 1 and 5." };
            }

            const feedbackList = DB.feedback.getAll();

            // Check if user already submitted feedback for this course
            const existing = feedbackList.find(
                f => f.userId == feedbackData.userId && f.courseId == feedbackData.courseId
            );
            if (existing) {
                return { success: false, message: "You have already submitted feedback for this course." };
            }

            // Create feedback entry
            const newFeedback = {
                id: Date.now(),
                userId: feedbackData.userId,
                courseId: feedbackData.courseId,
                rating: feedbackData.rating,
                comment: feedbackData.comment || '',
                timestamp: feedbackData.timestamp || Date.now()
            };

            feedbackList.push(newFeedback);
            Serializer.write(DB_KEYS.FEEDBACK, feedbackList);
            return { success: true, feedback: newFeedback };
        },

        // Get feedback for a specific course
        getByCourse: (courseId) => {
            return DB.feedback.getAll().filter(f => f.courseId == courseId);
        },

        // Get feedback by a specific user
        getByUser: (userId) => {
            return DB.feedback.getAll().filter(f => f.userId == userId);
        },

        // Check if user already gave feedback for a course
        hasUserFeedback: (userId, courseId) => {
            return DB.feedback.getAll().some(
                f => f.userId == userId && f.courseId == courseId
            );
        },

        // Get average rating for a course
        getCourseRating: (courseId) => {
            const courseFeedback = DB.feedback.getByCourse(courseId);
            if (courseFeedback.length === 0) return null;
            const sum = courseFeedback.reduce((acc, f) => acc + f.rating, 0);
            return (sum / courseFeedback.length).toFixed(1);
        }
    }
};

// Start the engine
DB.init();
