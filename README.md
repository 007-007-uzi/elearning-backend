#  E-Learning Platform - Backend

Firebase + Cloudinary based backend for E-Learning Platform.

---

##  Project Info

| Item | Value |
|------|-------|
| **Firebase Project ID** | `e-learning-platform-dde92` |
| **Firestore Location** | `asia-south1` (Mumbai) |
| **Cloudinary Cloud** | `fwlslok8` |
| **Upload Preset** | `elearning_uploads` (Unsigned) |
| **Hosting URL** | `https://e-learning-platform-dde92.web.app` |
| **Plan** | Spark (Free) |

---

##  Services

| Service | Purpose |
|---------|---------|
| **Firebase Auth** | Login / Signup |
| **Cloud Firestore** | Database |
| **Firebase Hosting** | Website hosting |
| **Cloudinary** | File uploads |

---

##  Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management |
| **Teacher** | Manage courses, assignments, quizzes, lectures |
| **Student** | View courses, submit assignments, take quizzes |

---

##  Database Collections

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles with roles |
| `courses` | Course listings |
| `assignments` | Course assignments |
| `submissions` | Student submissions |
| `quizzes` | Quizzes with questions |
| `lectures` | YouTube lecture links |

---

##  Files

| File | Purpose |
|------|---------|
| `firestore.rules` | Firestore security rules |
| `firebase-config.js` | Firebase + Cloudinary config + upload function |
| `README.md` | Documentation |

---

##  Config Summary

### Firebase
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCSXeCmCG-muzxyNUCHTrU2k2vEB3qnjc8",
  authDomain: "e-learning-platform-dde92.firebaseapp.com",
  projectId: "e-learning-platform-dde92",
  storageBucket: "e-learning-platform-dde92.firebasestorage.app",
  messagingSenderId: "664030736751",
  appId: "1:664030736751:web:a728ab4b3863fee990389a"
};

### cloudinary config

const cloudinaryConfig = {
  cloudName: "fwlslok8",
  uploadPreset: "elearning_uploads",
  uploadUrl: "https://api.cloudinary.com/v1_1/fwlslok8/auto/upload"
};