<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

session_start();

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                user_id, 
                username, 
                full_name, 
                email, 
                phone, 
                city, 
                user_type, 
                status,
                created_at
              FROM users 
              WHERE user_type = 'user'
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($users);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>