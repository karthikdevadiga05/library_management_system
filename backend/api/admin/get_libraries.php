<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT l.*, u.email, u.phone, u.address, u.city, u.state, u.status, u.user_id, u.username
              FROM libraries l
              JOIN users u ON l.user_id = u.user_id
              ORDER BY l.library_name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $libraries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($libraries);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>