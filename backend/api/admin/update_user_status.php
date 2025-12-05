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

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode(array("message" => "User ID and status required"));
    exit();
}

$valid_statuses = ['active', 'inactive', 'suspended'];
if (!in_array($data->status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid status"));
    exit();
}

try {
    $query = "UPDATE users SET status = :status WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":status", $data->status);
    $stmt->bindParam(":user_id", $data->user_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "User status updated successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to update status"));
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>