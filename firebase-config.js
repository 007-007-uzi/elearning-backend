
// FIREBASE SDK IMPORTS

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";


//  firebase config

const firebaseConfig = {
  apiKey: "AIzaSyCSXeCmCG-muzxyNUCHTrU2k2vEB3qnjc8",
  authDomain: "e-learning-platform-dde92.firebaseapp.com",
  projectId: "e-learning-platform-dde92",
  storageBucket: "e-learning-platform-dde92.firebasestorage.app",
  messagingSenderId: "664030736751",
  appId: "1:664030736751:web:a728ab4b3863fee990389a"
};


//  CLOUDINARY CONFIG


const cloudinaryConfig = {
  cloudName: "fwlslok8",
  apiKey: "123776767341242",
  uploadPreset: "elearning_uploads",
  uploadUrl: "https://api.cloudinary.com/v1_1/fwlslok8/auto/upload"
};


// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


//  UPLOAD function


async function uploadToCloudinary(file, folder = "elearning") {
  if (!file) {
    throw new Error("No file provided");
  }

  // File size check (max 20 MB)
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("File size exceeds 20 MB limit");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  formData.append("folder", folder);

  try {
    const response = await fetch(cloudinaryConfig.uploadUrl, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}


//  HELPER FUNCTIONS



async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) return null;
  
  return {
    uid: user.uid,
    ...userDoc.data()
  };
}


function redirectByRole(role) {
  if (role === "admin") window.location.href = "admin.html";
  else if (role === "teacher") window.location.href = "teacher.html";
  else window.location.href = "student.html";
}




export {
  // Firebase core
  app, auth, db,
  
  // Configs
  firebaseConfig,
  cloudinaryConfig,
  
  // Auth functions
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  
  // Firestore functions
  doc, setDoc, getDoc,
  collection, addDoc, getDocs,
  query, where, deleteDoc, updateDoc,
  serverTimestamp, orderBy, limit,
  
  // Cloudinary
  uploadToCloudinary,
  
  // Helpers
  getCurrentUserData,
  redirectByRole
};