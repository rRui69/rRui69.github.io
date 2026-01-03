# TODO: Modify login.php for Database Integration

- [x] Start a PHP session at the beginning of login.php
- [x] Check if the request method is POST
- [x] Sanitize and retrieve 'username' and 'password' from POST data
- [x] Prepare and execute a PDO query to find the user by username or email in the 'users' table
- [x] Verify the password using password_verify against the hashed password from the database
- [x] On successful login, set session variables (e.g., user_id, username) and redirect to 'homepage.html'
- [x] On login failure, redirect back to the login form (e.g., test.php or login.html) with an error message
- [x] Handle database connection errors and other exceptions securely
- [ ] Test the login functionality with a PHP server (e.g., XAMPP) and ensure database 'my_auth_db' has 'users' table with sample data
