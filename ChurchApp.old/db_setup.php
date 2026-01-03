<?php
// Database setup script for MySQL connection

$DB_HOST = '127.0.0.1';
$DB_USER = 'root';
$DB_PASS = '';

try {
    // Connect to MySQL without specifying a database to create it
    $pdo = new PDO("mysql:host=$DB_HOST", $DB_USER, $DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create the database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS my_auth_db");

    // Select the database
    $pdo->exec("USE my_auth_db");

    // Create the users table
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            gender ENUM('Male', 'Female', 'Prefer not to say') NOT NULL,
            date_registered DATE DEFAULT (CURRENT_DATE),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ";
    $pdo->exec($createTableSQL);

    echo "Database 'my_auth_db' and table 'users' created successfully.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
