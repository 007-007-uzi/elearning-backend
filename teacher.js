import { auth, db, uploadToCloudinary } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, serverTimestamp, onSnapshot, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// DOM Elements
const teacherName = document.getElementById("teacherName");
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

// Forms
const courseForm = document.getElementById("courseForm");
const assignmentForm = document.getElementById("assignmentForm");
const quizForm = document.getElementById("quizForm");

// Tables
const courseTableBody = document.getElementById("courseTableBody");
const submissionTableBody = document.getElementById("submissionTableBody");

// Dropdowns
const assignmentCourseSelect = document.getElementById("assignmentCourse");
const quizCourseSelect = document.getElementById("quizCourse");

let currentUserData = null;
let myCourses = [];

// 1. Check Auth
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "index.html"; return; }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "teacher") {
        currentUserData = userDoc.data();
        const name = currentUserData.displayName || "Teacher";
        teacherName.textContent = name;
        welcomeText.textContent = `Welcome, ${name}!`;
        
        loadCourses(); 
        loadSubmissions();
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

// 2. Add New Course
courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("addCourseBtn");
    btn.disabled = true; btn.textContent = "Adding...";

    const title = document.getElementById("courseTitle").value;
    const desc = document.getElementById("courseDescription").value;

    try {
        await addDoc(collection(db, "subjects"), {
            title: title,
            description: desc,
            teacherId: auth.currentUser.uid,
            teacherName: currentUserData.displayName,
            createdAt: serverTimestamp()
        });
        alert("Course Added!");
        courseForm.reset();
        loadCourses();
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false; btn.textContent = "Add Course";
    }
});

// 3. Load Courses (And populate dropdowns)
async function loadCourses() {
    try {
        const q = query(collection(db, "subjects"), where("teacherId", "==", auth.currentUser.uid));
        const snapshot = await getDocs(q);
        
        courseTableBody.innerHTML = "";
        assignmentCourseSelect.innerHTML = '<option value="">Select Course</option>';
        quizCourseSelect.innerHTML = '<option value="">Select Course</option>';
        myCourses = [];

        if (snapshot.empty) {
            courseTableBody.innerHTML = "<tr><td colspan='3'>No courses created yet.</td></tr>";
            return;
        }

        snapshot.forEach(docSnap => {
            const c = docSnap.data();
            myCourses.push({ id: docSnap.id, ...c });

            courseTableBody.innerHTML += `
                <tr>
                    <td>${c.title}</td>
                    <td>${c.description || "-"}</td>
                    <td>0</td>
                </tr>`;

            assignmentCourseSelect.innerHTML += `<option value="${docSnap.id}">${c.title}</option>`;
            quizCourseSelect.innerHTML += `<option value="${docSnap.id}">${c.title}</option>`;
        });
    } catch (error) {
        console.error(error);
    }
}

// 4. Add Assignment (With Cloudinary Upload)
assignmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("addAssignmentBtn");
    const file = document.getElementById("assignmentFile").files[0];
    const courseId = assignmentCourseSelect.value;
    const title = document.getElementById("assignmentTitle").value;
    
    if (!courseId || !title) return alert("Select course and enter title");
    if (!file) return alert("Please upload a file");

    btn.disabled = true; btn.textContent = "Uploading...";

    try {
        // Upload to Cloudinary
        const fileData = await uploadToCloudinary(file, "assignments");

        // Save to Firestore
        await addDoc(collection(db, "assignments"), {
            courseId: courseId,
            teacherId: auth.currentUser.uid,
            title: title,
            description: document.getElementById("assignmentDescription").value,
            dueDate: document.getElementById("assignmentDueDate").value,
            fileUrl: fileData.url,
            createdAt: serverTimestamp()
        });

        alert("Assignment Added Successfully!");
        assignmentForm.reset();
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false; btn.textContent = "Add Assignment";
    }
});

// 5. Add Quiz
quizForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("addQuizBtn");
    btn.disabled = true; btn.textContent = "Saving...";

    try {
        await addDoc(collection(db, "quizzes"), {
            courseId: quizCourseSelect.value,
            teacherId: auth.currentUser.uid,
            title: document.getElementById("quizTitle").value,
            question: document.getElementById("quizQuestion").value,
            options: {
                A: document.getElementById("optionA").value,
                B: document.getElementById("optionB").value,
                C: document.getElementById("optionC").value,
                D: document.getElementById("optionD").value
            },
            correctAnswer: document.getElementById("correctAnswer").value,
            createdAt: serverTimestamp()
        });
        alert("Quiz Added!");
        quizForm.reset();
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false; btn.textContent = "Add Quiz";
    }
});

// 6. Load Student Submissions
async function loadSubmissions() {
    try {
        // Find assignments created by this teacher
        const myAssignmentsSnap = await getDocs(query(collection(db, "assignments"), where("teacherId", "==", auth.currentUser.uid)));
        const myAssignIds = myAssignmentsSnap.docs.map(d => d.id);

        if (myAssignIds.length === 0) {
            submissionTableBody.innerHTML = "<tr><td colspan='4'>No submissions yet.</td></tr>";
            return;
        }

        const subsSnap = await getDocs(collection(db, "submissions"));
        submissionTableBody.innerHTML = ""; 

        subsSnap.forEach(docSnap => {
            const sub = docSnap.data();
            // Check if this submission belongs to one of my assignments
            if (myAssignIds.includes(sub.assignmentId)) {
                
                // Find assignment title
                const assignDoc = myAssignIds.find(id => id === sub.assignmentId);
                const assignTitle = myAssignmentsSnap.docs.find(d => d.id === sub.assignmentId)?.data().title;

                submissionTableBody.innerHTML += `
                    <tr>
                        <td>${sub.studentName}</td>
                        <td>${assignTitle || "Assignment"}</td>
                        <td><a href="${sub.fileUrl}" target="_blank" class="btn btn-sm btn-outline-info">View</a></td>
                        <td>
                            <div class="input-group input-group-sm">
                                <input type="number" class="form-control" id="grade_${docSnap.id}" value="${sub.grade || ''}" placeholder="Marks">
                                <button class="btn btn-success" onclick="saveGrade('${docSnap.id}')">Save</button>
                            </div>
                        </td>
                    </tr>`;
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// 7. Save Grade (Global function for onclick)
window.saveGrade = async (submissionId) => {
    const marks = document.getElementById(`grade_${submissionId}`).value;
    if (marks === "") return alert("Enter marks");
    
    try {
        await updateDoc(doc(db, "submissions", submissionId), {
            grade: marks
        });
        alert("Marks Saved!");
    } catch (error) {
        alert("Error saving marks: " + error.message);
    }
};

// GOOGLE SEARCH INTEGRATION

const GOOGLE_API_KEY = "AIzaSyC6g4fvjyf5XejBDJcnKNxHf-7eOGw5VKA"; 
const SEARCH_ENGINE_ID = "f175f99d8403b4a8f"; 

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
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

        if (data.items && data.items.length > 0) {
            searchResults.innerHTML = "";
            
            data.items.forEach(item => {
                searchResults.innerHTML += `
                    <div class="card mb-3 shadow-sm">
                        <div class="card-body">
                            <a href="${item.link}" target="_blank" class="text-decoration-none fs-5 fw-bold">${item.title}</a>
                            <p class="text-muted small mb-1">${item.displayLink}</p>
                            <p class="mb-0">${item.snippet}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            searchResults.innerHTML = '<p class="text-center text-muted">No results found. Try different keywords.</p>';
        }
    } catch (error) {
        searchResults.innerHTML = '<p class="text-center text-danger">Error connecting to search. Please try again later.</p>';
    }
}

// CHAT SYSTEM LOGIC

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