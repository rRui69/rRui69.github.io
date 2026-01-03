<?php
session_start();
require "db.php";

if (empty($_POST['username']) || empty($_POST['password'])) {
    header("Location: login.php?error=Fields are required");
    exit();
}

$username = mysqli_real_escape_string($conn, $_POST['username']);
$password = $_POST['password'];

$query = "SELECT * FROM users WHERE username='$username' LIMIT 1";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) === 1) {
    $user = mysqli_fetch_assoc($result);

    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        header("Location: dashboard.php");
        exit();
    } else {
        header("Location: login.php?error=Invalid credentials");
        exit();
    }
} else {
    header("Location: login.php?error=User not found");
    exit();
}
