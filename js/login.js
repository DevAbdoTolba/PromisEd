// Small client-side behavior for login form
(function () {
  var form = document.getElementById("loginForm");
  var toggle = document.getElementById("togglePw");
  var password = document.getElementById("password");
  var message = document.getElementById("formMessage");

  // helper to escape user input when injecting into HTML
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Prefill email if user chose "remember" previously
  var savedEmail = localStorage.getItem("promised_last_email");
  if (savedEmail && document.getElementById("email")) {
    document.getElementById("email").value = savedEmail;
  }

  // If a session already exists, redirect to home
  var current = (window.DB && DB.session) ? DB.session.current() : null;
  if (current) window.location.replace('index.html');

  // Ensure password is hidden by default and when page is shown
  function hidePassword() {
    if (password) password.type = "password";
    if (toggle) toggle.textContent = "Show";
  }
  // hide on load
  hidePassword();
  // hide when navigating back to page
  window.addEventListener("pageshow", hidePassword);

  // Toggle password visibility
  toggle &&
    toggle.addEventListener("click", function () {
      if (password.type === "password") {
        password.type = "text";
        toggle.textContent = "Hide";
      } else {
        password.type = "password";
        toggle.textContent = "Show";
      }
    });

  // Simple submit handler to demonstrate feedback (no real auth)
  form &&
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // mark that user attempted to submit so validation messages appear
      form.classList.add("submitted"); // ensure password is hidden before proceeding
      hidePassword();
      // rely on browser validation
      if (!form.checkValidity()) {
        message.textContent = "Please fix the fields above.";
        message.style.color = "var(--danger-color)";
        return;
      }

      // Check credentials using DB.users.login()
      var inputEmail = (document.getElementById("email").value || "").trim();
      var inputPassword = document.getElementById("password").value;

      if (!window.DB || !DB.users) {
        message.textContent = "Internal error: DB not available.";
        message.style.color = "var(--danger-color)";
        return;
      }

      var res = DB.users.login(inputEmail, inputPassword);
      if (!res.success) {
        if (res.error === "No account") {
          message.innerHTML =
            "No account found for <strong>" +
            escapeHtml(inputEmail) +
            '</strong>. <a href="register.html">Create an account</a>.';
          message.style.color = "var(--danger-color)";
          return;
        }
        if (res.error === "Incorrect password") {
          message.textContent = "Incorrect password.";
          message.style.color = "var(--danger-color)";
          return;
        }
        message.textContent = "Sign in failed.";
        message.style.color = "var(--danger-color)";
        return;
      }

      // successful login -> create session
      DB.session.create(res.user);
      // Fake sign-in success
      var email = document.getElementById("email").value;
      if (document.getElementById("remember").checked) {
        localStorage.setItem("promised_last_email", email);
      }

      message.textContent = "Signed in successfully. Redirecting...";
      message.style.color = "var(--success-color)";

      // simulate redirect after a short delay (use replace so user cannot go back to login)
      setTimeout(function () {
        window.location.replace("index.html");
      }, 900);
    });
})();
