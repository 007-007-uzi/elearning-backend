const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (email === "" || password.length < 6) {
    errorMessage.textContent = "Email dalo aur password kam az kam 6 characters ka rakho.";
    errorMessage.classList.remove("d-none");
    return;
  }

  if (role === "student") {
    window.location.href = "student.html";
  } else if (role === "teacher") {
    window.location.href = "teacher.html";
  } else if (role === "admin") {
    window.location.href = "admin.html";
  }
});