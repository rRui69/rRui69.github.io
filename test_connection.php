<?php
require "my_auth/db.php";

if ($conn) {
    echo "MySQL connection successful!";
} else {
    echo "MySQL connection failed: " . mysqli_connect_error();
}
?>
