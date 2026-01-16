(function () {
  var form = document.getElementById("registerForm");
  var toggle = document.getElementById("togglePw");
  var toggleConfirm = document.getElementById("toggleConfirm");
  var password = document.getElementById("password");
  var confirm = document.getElementById("confirm");
  var message = document.getElementById("formMessage");
  var confirmError = document.getElementById("confirmError");

  // Ensure passwords are hidden by default and when page is shown
  function hidePasswords() {
    if (password) password.type = "password";
    if (confirm) confirm.type = "password";
    if (toggle) toggle.textContent = "Show";
    if (toggleConfirm) toggleConfirm.textContent = "Show";
  }
  hidePasswords();
  window.addEventListener("pageshow", hidePasswords);

  // If a session already exists, redirect to home
  try {
    var currentSession = (window.DB && DB.session && DB.session.current) ? DB.session.current() : null;
    if (currentSession) {
      window.location.replace('index.html');
    }
  } catch (e) { /* ignore */ }

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

  toggleConfirm &&
    toggleConfirm.addEventListener("click", function () {
      if (confirm.type === "password") {
        confirm.type = "text";
        toggleConfirm.textContent = "Hide";
      } else {
        confirm.type = "password";
        toggleConfirm.textContent = "Show";
      }
    });
  // Live password-match validation (shows error only after submit attempt)
  function validateMatch() {
    if (!password || !confirm) return;
    var match = confirm.value === password.value;
    try {
      confirm.setCustomValidity(match ? "" : "Passwords do not match");
    } catch (e) {}

    // Show inline message only after user attempted to submit
    if (
      !match &&
      form &&
      form.classList &&
      form.classList.contains("submitted")
    ) {
      confirmError.style.display = "block";
      try {
        confirm.reportValidity();
      } catch (e) {}
    } else {
      confirmError.style.display = "none";
    }
  }
  // attach live listeners so the error clears while typing (but don't show until submitted)
  password && password.addEventListener("input", validateMatch);
  confirm && confirm.addEventListener("input", validateMatch);
  // Basic submit with password match check
  form &&
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // mark that user attempted to submit so validation messages appear
      form.classList.add("submitted"); // ensure passwords are hidden before proceeding
      hidePasswords();
      confirmError.style.display = "none";

      // validate match and show inline error if needed
      validateMatch();

      if (!form.checkValidity()) {
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid)
          try {
            firstInvalid.focus();
          } catch (e) {}
        return;
      }

      // Simulate successful registration
      message.textContent = "Account created. Redirecting to sign in...";
      message.style.color = "var(--success-color)";

      // Build user object and call DB.users.register()
      try {
        var userObj = {
          name: (document.getElementById("name").value || "").trim(),
          email: (document.getElementById("email").value || "").trim(),
          password: document.getElementById("password").value,
          role: "student",
          wishlist: [],
          enrolledCourses: [],
        };

        if (!window.DB || !DB.users) {
          message.textContent = "Internal error: DB not available.";
          message.style.color = "var(--danger-color)";
          return;
        }

        var res = DB.users.register(userObj);
        if (!res.success) {
          message.textContent = res.error || "Registration failed.";
          message.style.color = "var(--danger-color)";
          return;
        }

        // Save last email for convenience (remember option on login)
        try {
          localStorage.setItem("promised_last_email", userObj.email);
        } catch (e) {}
      } catch (err) {
        // fallback error
        message.textContent = "Registration failed.";
        message.style.color = "var(--danger-color)";
        return;
      }

      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    });
})();
