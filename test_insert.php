<?php
require "my_auth/db.php";

$full_name = 'Test User';
$email = 'test@example.com';
$username = 'testuser';
$password = password_hash('password', PASSWORD_DEFAULT);
$gender = 'Male';
$date_registered = date('Y-m-d');

$query = "INSERT INTO users (username, email, password, full_name, gender, date_registered) VALUES ('$username', '$email', '$password', '$full_name', '$gender', '$date_registered')";

if (mysqli_query($conn, $query)) {
    echo "Insert successful.";
} else {
    echo "Insert failed: " . mysqli_error($conn);
}
?>
