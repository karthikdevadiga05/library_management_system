<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->status)) {
    try {
        $query = "UPDATE users SET status = :status WHERE user_id = :user_id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":user_id", $data->user_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "User status updated successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update user status"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "User ID and status required"));
}
?>