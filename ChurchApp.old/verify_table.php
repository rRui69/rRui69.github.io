<?php
require "my_auth/db.php";

$query = "DESCRIBE users";
$result = mysqli_query($conn, $query);

if ($result) {
    echo "Table structure:\n";
    while ($row = mysqli_fetch_assoc($result)) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
} else {
    echo "Error: " . mysqli_error($conn);
}
?>
