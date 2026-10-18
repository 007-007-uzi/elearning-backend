# 🎓 E-Learning Platform

Ek complete aur modern E-Learning Platform jahan Admin, Teachers, aur Students apna alag alag dashboard use kar sakte hain. Yeh project **Firebase** (Backend & Auth) aur **Cloudinary** (File Uploads) par based hai.

---

## 🚀 Features (Jo Abhi Tak Complete Hain)

### 1. 🔐 Authentication & Role Management
- **Secure Login:** Email aur Password ke zariye login.
- **Role Verification:** Login karte waqt code check karta hai ke user Admin hai, Teacher hai, ya Student. Agar koi Student Admin ka role select karega, toh usay "Access Denied" mil jayega.
- **Admin User Creation:** Admin dashboard se naye Teachers aur Students ke account bana sakta hai (bina logout hue).

### 2. 👑 Admin Dashboard
- **Manage Users:** Saare users ki list dekhna aur unhe delete karna.
- **Courses/Subjects:** Naye subjects banayein aur unhe kisi Teacher ko assign karein.
- **Announcements:** (Coming Soon)

### 3. 👨‍🏫 Teacher Dashboard
- **My Courses:** Sirf apne assigned subjects dekhna.
- **Add Assignments:** Naya assignment banayein, PDF/Image upload karein (Cloudinary) aur Due Date set karein.
- **Student Submissions:** Students ki upload ki hui files dekhna aur unhe Marks (Grade) dena.
- **Add Quizzes:** MCQ quizzes banayein.

### 4. 🎒 Student Dashboard
- **View Courses:** Apne department aur semester ke subjects dekhna.
- **Assignments:** Teacher ke diye hue assignments dekhna aur apni file Cloudinary par upload karke submit karna.
- **Global Chat:** Student aur Teacher aapas mein real-time baat kar sakte hain.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **Firebase Authentication** | User Login, Signup, aur Role Management |
| **Cloud Firestore** | NoSQL Database (Users, Subjects, Assignments, Chats) |
| **Cloudinary** | PDF/Image files upload karne ke liye |
| **Bootstrap 5** | Responsive aur attractive UI Design |
| **Vanilla JavaScript** | Frontend logic aur Firebase connection |
| **Firebase Hosting** | Website ko live karne ke liye |

---

## 📊 Database Collections (Firestore)

Yeh project Firestore mein in collections ka use karta hai:

1. `users` - Saare users ka data (role: admin, teacher, student).
2. `subjects` - Courses/Subjects ka data.
3. `assignments` - Teacher ke upload kiye hue assignments.
4. `submissions` - Students ki submit ki hui assignments aur unke marks.
5. `quizzes` - Teacher ke banaye hue quizzes.
6. `chats` - Global chat ke messages.

---

## 📁 Folder Structure

```text
elearning-backend/frontend
│
├── index.html           # Landing Page (Login)
├── login.js             # Login Logic (Firebase Auth)
├── firebase-config.js   # Firebase aur Cloudinary ki keys
│
├── admin.html           # Admin Dashboard
├── admin.js             # Admin Logic (Add/Delete users, subjects)
│
├── teacher.html         # Teacher Dashboard
├── teacher.js           # Teacher Logic (Add assignments, Grade, Quizzes)
│
├── student.html         # Student Dashboard
├── student.js           # Student Logic (Submit assignments, Chat)
│
├── style.css            # Custom CSS (Buttons, Chat Box, etc.)
├── firestore.rules      # Database Security Rules
└── README.md