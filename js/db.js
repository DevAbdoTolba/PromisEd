(function () {
  var STORAGE_KEY = "promised_users";
  var SESSION_KEY = "promised_current_user";
  // expose DB namespace
  var DB = (window.DB = window.DB || {});

  DB.users = {
    _load: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },
    _save: function (users) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      } catch (e) {}
    },
    getByEmail: function (email) {
      if (!email) return null;
      var users = this._load();
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) return users[i];
      }
      return null;
    },
    register: function (user) {
      if (!user || !user.email)
        return { success: false, error: "Invalid user data" };
      var existing = this.getByEmail(user.email);
      if (existing) return { success: false, error: "Email already exists" };

      // Ensure required schema
      var toSave = {
        name: user.name || "",
        email: user.email,
        password: user.password || "",
        role: user.role || "student",
        wishlist: user.wishlist || [],
        enrolledCourses: user.enrolledCourses || [],
      };

      var users = this._load();
      users.push(toSave);
      this._save(users);
      return { success: true, user: toSave };
    },
    login: function (email, password) {
      var user = this.getByEmail(email);
      if (!user) return { success: false, error: "No account" };
      if (user.password !== password)
        return { success: false, error: "Incorrect password" };
      return { success: true, user: user };
    },
    all: function () {
      return this._load();
    },
  };

  DB.session = {
    create: function (user) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } catch (e) {}
    },
    current: function () {
      try {
        var s = localStorage.getItem(SESSION_KEY);
        return s ? JSON.parse(s) : null;
      } catch (e) {
        return null;
      }
    },
    clear: function () {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}
    },
  };
})();
