# 🗺️ Site Map (Static Structure)

## 📂 Root (Public)
* `index.html` - Landing Page
* `login.html` - Login Form
* `register.html` - Registration Form

## 📂 /student/ Directory
* `student/dashboard.html` - **Dashboard** (Handles Enrolled, Browse, Wishlist tabs via JS)
* `student/course_player.html` - **Course Content Player**
    * *URL Param:* `?courseId=123` (Loads specific course content)
    * *URL Param:* `?materialId=456` (Optional: Deep link to specific video/lesson)
* `student/feedback.html` - **Course Feedback**
    * *URL Param:* `?courseId=123`
* `student/certificate.html` - **Certificate Display**
    * *URL Param:* `?courseId=123`
* `student/course_details.html` - **Course Info (Preview)**
    * *URL Param:* `?courseId=123`
* `student/checkout.html` - **Payment Page**
    * *URL Param:* `?courseId=123`

## 📂 /admin/ Directory
* `admin/dashboard.html` - **Admin Dashboard**
* `admin/categories.html` - **Category Management**
    * *Note:* Add/Edit Popups are handled by JS on this same page.
* `admin/students.html` - **Student List**
* `admin/student_details.html` - **Student Profile**
    * *URL Param:* `?studentId=789`
* `admin/student_progress.html` - **Specific Student Progress**
    * *URL Param:* `?studentId=789`
* `admin/student_certs.html` - **Specific Student Certificates**
    * *URL Param:* `?studentId=789`
* `admin/courses.html` - **Course Management List**
* `admin/course_editor.html` - **Add/Edit Course Page**
    * *URL Param:* `?mode=new` (For creating a new course)
    * *URL Param:* `?mode=edit&courseId=123` (For editing existing)
    * *URL Param:* `?mode=approve&courseId=123` (For reviewing drafts)
