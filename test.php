<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in Page</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="" crossorigin="anonymous">
  <link href="login.css" rel="stylesheet">
</head>
<body class="bg-light">

  <main class="d-flex align-items-center justify-content-center min-vh-100">
    <div class="auth-card shadow-sm">
      <div class="text-center mb-4">
        <br>
        <h1 class="h5 mb-1">Sign in to "Church App Name"</h1>
      </div>

      <form id="loginForm" class="px-4 pb-3" action="testing.php" method="POST">
        <div class="mb-3">
          <label for="username" class="form-label visually-hidden">Username or Email</label>
          <input type="text" id="username" name="username" class="form-control form-control-lg" placeholder="Phone, email, or username" required>
        </div>

        <div class="mb-3 position-relative">
          <label for="loginPassword" class="form-label visually-hidden">Password</label>
          <input type="password" id="loginPassword" name="password" class="form-control form-control-lg" placeholder="Password" required>
        </div>

        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary btn-lg">Sign in</button>
        </div>

        <div class="text-center">
          <a href="#" id="forgotLink" class="small">Forgot password?</a>
        </div>
      </form>

      <div class="border-top mt-3 pt-3 text-center px-4 pb-4">
        <span class="small text-muted">New User?</span>
        <a href="register.html" class="btn btn-outline-primary btn-sm ms-2">Create account</a>
      </div>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="" crossorigin="anonymous"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>

<?php
    $_POST["username"];
    $_POST["password"];
?>