import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const selectedRole = document.getElementById("role").value;

  message.classList.remove("d-none", "alert-danger", "alert-success");
  message.textContent = "Logging in...";

  if (email === "" || password.length < 6) {
    message.classList.add("alert-danger");
    message.textContent = "Please enter your email and a password of at least 6 characters.";
    return;
  }

  try {
    // 1. Firebase Auth se login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Firestore se role check
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const actualRole = userData.role;

      if (actualRole !== selectedRole) {
        message.classList.add("alert-danger");
        message.textContent = `Access Denied! You are registered as a ${actualRole}. Please select the correct role.`;
        return;
      }

      message.classList.add("alert-success");
      message.textContent = "Login successful! Redirecting...";
      
      setTimeout(() => {
        window.location.href = actualRole + ".html"; 
      }, 1000);

    } else {
      message.classList.add("alert-danger");
      message.textContent = "User data not found in database.";
    }

  } catch (error) {
    message.classList.add("alert-danger");
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      message.textContent = "Invalid email or password.";
    } else {
      message.textContent = "Error: " + error.message;
    }
  }
});