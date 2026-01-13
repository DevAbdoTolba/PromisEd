# 🗺️ Site Map

## 🔒 Authentication (Public)
* `/` - Landing Page (Entry)
* `/login` - Login Form
* `/register` - Registration Form

## 🎓 Student Area
* `/student/dashboard` - **Dashboard** (Tabs: Enrolled, Browse, Wishlist)
* `/student/courses` - **My Enrolled Courses**
    * `/student/courses/{id}/learn` - **Course Player** (Video/Content)
    * `/student/courses/{id}/feedback` - Course Feedback Survey
    * `/student/courses/{id}/certificate` - Certificate View/Download
* `/student/catalog` - **Browse Catalog** (Search & Filter)
    * `/student/catalog/{id}` - Course Details (Preview)
    * `/student/checkout/{id}` - Payment / Checkout Page
* `/student/wishlist` - Saved Courses

## 🛡️ Admin Area
* `/admin/dashboard` - **Admin Dashboard** (Insights & Quick Actions)
* `/admin/categories` - **Category Management**
    * `?action=add` - Add Category Popup
    * `?action=edit&id={id}` - Edit Category Popup
* `/admin/students` - **Student List**
    * `/admin/students/{id}` - **Student Profile**
        * `/admin/students/{id}/progress` - Student Progress Report
        * `/admin/students/{id}/certificates` - Student Certificates
* `/admin/courses` - **Course Management**
    * `/admin/courses/new` - Add New Course Wizard
    * `/admin/courses/{id}` - Approved Course Details (Edit/Unpublish)
    * `/admin/courses/approval/{id}` - Draft Course Review (Approve/Reject)
