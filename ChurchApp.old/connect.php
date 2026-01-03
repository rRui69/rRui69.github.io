<?php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'my_auth_db';      // CHANGE THIS to the database you create
$DB_USER = 'root';            // XAMPP default
$DB_PASS = '';                // XAMPP default is empty password

$DSN = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";

$conn=new mysqli($DB_HOST,$DB_NAME,$DB_USER,$DB_PASS,$DSN);

if($conn->connect_error){
    echo"Connection Failed to DB : ".$conn->connect_error;
}

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($DSN, $DB_USER, $DB_PASS, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB connection error: ' . $e->getMessage()]);
    exit;
}
?>