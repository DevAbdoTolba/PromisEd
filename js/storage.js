const DB_KEYS = {
    USERS: 'users',
    COURSES: 'courses',
    CATEGORIES: 'categories',
    SESSION: 'current_user'
};

// --- VALIDATION SCHEMAS (The Gatekeepers) ---
const Validators = {
    user: (data) => {
        if (!data.name || typeof data.name !== 'string') return "Invalid Name";
        if (!data.email || !data.email.includes('@')) return "Invalid Email";
        if (!data.password || data.password.length < 3) return "Password too short";
        if (!['student', 'admin'].includes(data.role)) return "Invalid Role";
        return null; // No errors
    },
    course: (data) => {
        if (!data.title) return "Course needs a title";
        if (typeof data.price !== 'number') return "Price must be a number";
        if (!['draft', 'approved'].includes(data.status)) return "Invalid Status";
        if (!Array.isArray(data.lessons)) return "Lessons must be an array";
        return null;
    }
};

// --- CORE SERIALIZER LOGIC ---
const Serializer = {
    // Read from Storage (Deserialize)
    read: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    // Write to Storage (Serialize)
    write: (key, data) => {
        // 1. Verify Data Integrity (Basic check)
        if (data === undefined || data === null) {
            console.error(`Attempted to save null data to ${key}`);
            return false;
        }
        // 2. Stringify and Save
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }
};

// --- PUBLIC API (The functions Abdallah and Jo will use) ---
const DB = {
    // INITIALIZE DB (Run this once on app load)
    init: () => {
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            // Seed initial data if empty
            Serializer.write(DB_KEYS.USERS, []);
            Serializer.write(DB_KEYS.COURSES, []);
            Serializer.write(DB_KEYS.CATEGORIES, []);
            console.log("Database Initialized with empty tables.");
        }
    },

    users: {
        getAll: () => Serializer.read(DB_KEYS.USERS),

        register: (userData) => {
            // 1. Validate
            const error = Validators.user(userData);
            if (error) return { success: false, message: error };

            // 2. Check Duplicates
            const users = DB.users.getAll();
            if (users.find(u => u.email === userData.email)) {
                return { success: false, message: "Email already exists" };
            }

            // 3. Create & Save
            const newUser = {
                id: Date.now(), // Simple ID generation
                ...userData,
                wishlist: [],
                enrolledCourses: []
            };
            users.push(newUser);
            Serializer.write(DB_KEYS.USERS, users);
            return { success: true, user: newUser };
        },

        login: (email, password) => {
            const users = DB.users.getAll();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                Serializer.write(DB_KEYS.SESSION, user); // Save session
                return { success: true, user };
            }
            return { success: false, message: "Invalid Credentials" };
        },

        getLoggedIn: () => {
            // Always fetch fresh data for the logged-in user
            const session = Serializer.read(DB_KEYS.SESSION);
            if (!session) return null;

            // Re-fetch from main DB to ensure we have latest progress
            const allUsers = DB.users.getAll();
            return allUsers.find(u => u.id === session.id);
        },

        logout: () => {
            localStorage.removeItem(DB_KEYS.SESSION);
            window.location.href = '../login.html';
        }
    },

    courses: {
        getAll: () => Serializer.read(DB_KEYS.COURSES),

        getById: (id) => {
            const courses = DB.courses.getAll();
            return courses.find(c => c.id == id);
        },

        add: (courseData) => {
            const error = Validators.course(courseData);
            if (error) return { success: false, message: error };

            const courses = DB.courses.getAll();
            const newCourse = { id: Date.now(), ...courseData };
            courses.push(newCourse);
            Serializer.write(DB_KEYS.COURSES, courses);
            return { success: true };
        }
    },

    student: {
        enroll: (userId, courseId) => {
            const users = DB.users.getAll();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) return { success: false, message: "User not found" };

            // Check if already enrolled
            const alreadyEnrolled = users[userIndex].enrolledCourses.find(c => c.courseId == courseId);
            if (alreadyEnrolled) return { success: false, message: "Already enrolled" };

            users[userIndex].enrolledCourses.push({
                courseId: courseId,
                progress: 0,
                isPaid: false, // Default to unpaid unless logic changes
                isCompleted: false,
                completedLessons: []
            });

            Serializer.write(DB_KEYS.USERS, users);
            return { success: true };
        }
    }
};

// Auto-initialize on load
DB.init();