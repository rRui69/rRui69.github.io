<?php
session_start();
require "db.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = mysqli_real_escape_string($conn, $_POST['full_name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $gender = mysqli_real_escape_string($conn, $_POST['gender']);
    $date_registered = date('Y-m-d');

    $query = "INSERT INTO users (username, email, password, full_name, gender, date_registered) VALUES ('$username', '$email', '$password', '$full_name', '$gender', '$date_registered')";

    if (mysqli_query($conn, $query)) {
        header("Location: login.php?success=Registration successful");
        exit();
    } else {
        header("Location: register.php?error=Registration failed: " . mysqli_error($conn));
        exit();
    }
} else {
    header("Location: register.php");
    exit();
}
?>
