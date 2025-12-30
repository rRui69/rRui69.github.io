<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php?error=Please login first");
    exit();
}
?>

<h2>Welcome, <?php echo $_SESSION['username']; ?>!</h2>
<a href="logout.php">Logout</a>
