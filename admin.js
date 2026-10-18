import { auth, db, firebaseConfig } from "./firebase-config.js";import { onAuthStateChanged, signOut, getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

// DOM Elements
const adminName = document.getElementById("adminName");
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");
const userTableBody = document.getElementById("userTableBody");
const allCoursesTableBody = document.getElementById("allCoursesTableBody");
const addUserForm = document.getElementById("addUserForm");

// 1. Check Auth & Role
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html"; // Not logged in
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
        const name = userDoc.data().displayName || "Admin";
        adminName.textContent = name;
        welcomeText.textContent = `Welcome, ${name}!`;
        
        loadUsers();
        loadCourses();
    } else {
        alert("Access Denied. You are not an Admin.");
        window.location.href = "index.html";
    }
});

// Logout
logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});

// 2. Load Users Table
async function loadUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        userTableBody.innerHTML = ""; 

        if (querySnapshot.empty) {
            userTableBody.innerHTML = "<tr><td colspan='4'>No users found.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const u = docSnap.data();
            // Admin ko delete karne ka button na dikhayein
            const actionBtn = (u.role === 'admin') 
                ? '<span class="text-muted">-</span>' 
                : `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${docSnap.id}')">Delete</button>`;

            userTableBody.innerHTML += `
                <tr>
                    <td>${u.displayName || "N/A"}</td>
                    <td>${u.email || "N/A"}</td>
                    <td><span class="badge bg-secondary text-capitalize">${u.role || "N/A"}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    } catch (error) {
        userTableBody.innerHTML = "<tr><td colspan='4'>Error loading users.</td></tr>";
    }
}

// 3. Load Courses Table
async function loadCourses() {
    try {
        const querySnapshot = await getDocs(collection(db, "subjects")); // Aapke DB mein subjects hain
        allCoursesTableBody.innerHTML = ""; 

        if (querySnapshot.empty) {
            allCoursesTableBody.innerHTML = "<tr><td colspan='4'>No subjects found.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const s = docSnap.data();
            allCoursesTableBody.innerHTML += `
                <tr>
                    <td>${s.title || "N/A"}</td>
                    <td>${s.teacherName || "Unassigned"}</td>
                    <td>0</td> <!-- Students count baad mein add karenge -->
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse('${docSnap.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        allCoursesTableBody.innerHTML = "<tr><td colspan='4'>Error loading courses.</td></tr>";
    }
}

// 4. Add User (Secondary App Method)
addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("addUserBtn");
    btn.disabled = true;
    btn.textContent = "Adding...";

    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const password = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value;

    try {
    
        
        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);

        // Naya user banao
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const newUser = userCredential.user;

        // Firestore mein save karo
        await setDoc(doc(db, "users", newUser.uid), {
            displayName: name,
            email: email,
            role: role,
            createdAt: new Date()
        });

        // Secondary app se logout kar do
        await signOut(secondaryAuth);

        alert("User added successfully!");
        addUserForm.reset();
        loadUsers();

    } catch (error) {
        alert("Error adding user: " + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Add User";
    }
});

// 5. Delete Functions
window.deleteUser = async (uid) => {
    if(confirm("Are you sure you want to delete this user?")) {
        await deleteDoc(doc(db, "users", uid));
        loadUsers();
    }
};

window.deleteCourse = async (id) => {
    if(confirm("Are you sure you want to delete this course/subject?")) {
        await deleteDoc(doc(db, "subjects", id));
        loadCourses();
    }
};