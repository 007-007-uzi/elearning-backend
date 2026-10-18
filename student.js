import { auth, db, uploadToCloudinary } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp, onSnapshot, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
// DOM Elements
const studentName = document.getElementById("studentName");
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");
const courseList = document.getElementById("courseList");
const assignmentList = document.getElementById("assignmentList");
const assignmentSelect = document.getElementById("assignmentSelect");
const submissionForm = document.getElementById("submissionForm");
const submitBtn = document.getElementById("submitBtn");

let currentUserData = null;

// 1. Check Auth & Load Data
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html"; 
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists() && userDoc.data().role === "student") {
        currentUserData = userDoc.data();
        const name = currentUserData.displayName || "Student";
        
        studentName.textContent = name;
        welcomeText.textContent = `Welcome, ${name}!`; // Semester/Dept hata diya
        
        loadCourses();
        loadAssignments();
         loadChat();
    } else {
        alert("Access Denied.");
        window.location.href = "index.html";
    }
});

// Logout
logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => window.location.href = "index.html");
});

// 2. Load ALL Courses/Subjects (Bina kisi filter ke)
async function loadCourses() {
    try {
        // Saare subjects uthao, bina kisi condition ke
        const querySnapshot = await getDocs(collection(db, "subjects"));
        courseList.innerHTML = ""; 

        if (querySnapshot.empty) {
            courseList.innerHTML = "<p class='text-muted'>No courses found.</p>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const s = docSnap.data();
            courseList.innerHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h6 class="card-title">${s.title}</h6>
                            <p class="card-text text-muted mb-1"><small>Code: ${s.code}</small></p>
                            <p class="card-text text-muted"><small>Teacher: ${s.teacherName || "TBA"}</small></p>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        courseList.innerHTML = "<p class='text-danger'>Error loading courses.</p>";
    }
}

// 3. Load Assignments
async function loadAssignments() {
    try {
        const querySnapshot = await getDocs(collection(db, "assignments"));
        assignmentList.innerHTML = ""; 
        assignmentSelect.innerHTML = '<option value="">-- Select Assignment --</option>';

        if (querySnapshot.empty) {
            assignmentList.innerHTML = "<li class='list-group-item text-muted'>No assignments posted yet.</li>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const a = docSnap.data();

            assignmentList.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${a.title}</strong><br>
                        <a href="${a.fileUrl}" target="_blank" class="text-decoration-none">📎 View File</a>
                    </div>
                </li>
            `;
            
            assignmentSelect.innerHTML += `<option value="${docSnap.id}">${a.title}</option>`;
        });
    } catch (error) {
        assignmentList.innerHTML = "<li class='list-group-item text-danger'>Error loading assignments.</li>";
    }
}

// 4. Submit Assignment
submissionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const assignmentId = assignmentSelect.value;
    const file = document.getElementById("submissionFile").files[0];

    if (!assignmentId || !file) {
        alert("Please select an assignment and upload a file.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
        const fileData = await uploadToCloudinary(file, "submissions");

        await addDoc(collection(db, "submissions"), {
            assignmentId: assignmentId,
            studentId: auth.currentUser.uid,
            studentName: currentUserData.displayName,
            fileUrl: fileData.url,
            submittedAt: serverTimestamp(),
            grade: "Pending"
        });

        alert("Assignment submitted successfully!");
        submissionForm.reset();
    } catch (error) {
        alert("Error submitting assignment: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    }
});
// ═══════════════════════════════════════════════════════════
// CHAT SYSTEM LOGIC
// ═══════════════════════════════════════════════════════════
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatPopup = document.getElementById("chatPopup");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// Toggle Open/Close
chatToggleBtn.addEventListener("click", () => {
    chatPopup.classList.toggle("show");
});

// Close
closeChatBtn.addEventListener("click", () => {
    chatPopup.classList.remove("show");
});

// Listen for messages
function loadChat() {
    // orderBy("timestamp", "asc") zaroori hai taake purane message pehle aur naye baad mein aayen
    const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    
    onSnapshot(q, (snapshot) => {
        chatBox.innerHTML = ""; // Clear old messages
        
        if (snapshot.empty) {
            chatBox.innerHTML = '<div class="text-center text-muted mt-5 small">No messages yet. Say hello!</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMe = msg.senderId === auth.currentUser.uid;
            const msgClass = isMe ? "my-msg" : "other-msg";
            
            chatBox.innerHTML += `
                <div class="chat-message ${msgClass}">
                    <span class="chat-sender"><strong>${msg.senderName}</strong> (${msg.senderRole})</span>
                    <div>${msg.message}</div>
                </div>
            `;
        });
        // Auto scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Send Message
sendChatBtn.addEventListener("click", async () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    chatInput.value = ""; // Clear input
    
    try {
        await addDoc(collection(db, "chats"), {
            senderId: auth.currentUser.uid,
            senderName: currentUserData.displayName, 
            senderRole: currentUserData.role,        
            message: text,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        alert("Failed to send: " + error.message);
    }
});

// Enter key dabane par send
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendChatBtn.click();
    }
});

// GOOGLE SEARCH INTEGRATION (Internet Search)

const GOOGLE_API_KEY = "AIzaSyC6g4fvjyf5XejBDJcnKNxHf-7eOGw5VKA"; 
const SEARCH_ENGINE_ID = "f175f99d8403b4a8f"; 

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

// Agar search button page par mojood hai (Student Dashboard)
if (searchBtn) {
    // Click karne par search chale
    searchBtn.addEventListener("click", performSearch);
    
    // Enter dabane par search chale
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") performSearch();
    });
}

async function performSearch() {
    const queryText = searchInput.value.trim();
    if (!queryText) return;

    searchResults.innerHTML = '<p class="text-center text-primary">Searching the web...</p>';

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(queryText)}`;
        
        const response = await fetch(url);
        const data = await response.json();

        // AGAR ERROR AAYE TOH YAHAN DIKHEGA
        if (data.error) {
            searchResults.innerHTML = `<p class="text-center text-danger">Google API Error: ${data.error.message}</p>`;
            return;
        }

        if (data.items && data.items.length > 0) {
            searchResults.innerHTML = "";
            data.items.forEach(item => {
                searchResults.innerHTML += `
                    <div class="card mb-3 shadow-sm">
                        <div class="card-body">
                            <a href="${item.link}" target="_blank" class="text-decoration-none fs-5 fw-bold text-primary">${item.title}</a>
                            <p class="text-success small mb-1">${item.displayLink}</p>
                            <p class="mb-0 text-dark">${item.snippet}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            searchResults.innerHTML = '<p class="text-center text-muted">No results found. Try different keywords.</p>';
        }
    } catch (error) {
        searchResults.innerHTML = `<p class="text-center text-danger">Network Error: ${error.message}</p>`;
    }
}