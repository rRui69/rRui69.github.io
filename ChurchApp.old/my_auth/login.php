<?php session_start(); ?>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>

<form method="POST" action="login_process.php">
    <input type="text" name="username" placeholder="Username" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <button type="submit">Login</button>
</form>

<?php
if (isset($_GET['error'])) {
    echo "<p style='color:red;'>".$_GET['error']."</p>";
}
?>

</body>
</html>
