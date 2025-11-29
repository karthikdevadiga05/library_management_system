<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->user_id) &&
    !empty($data->library_id) &&
    !empty($data->book_id) &&
    !empty($data->price)
) {
    try {
        $query = "INSERT INTO transactions (user_id, library_id, book_id, transaction_type, status, price) 
                  VALUES (:user_id, :library_id, :book_id, 'purchase', 'pending', :price)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $data->user_id);
        $stmt->bindParam(":library_id", $data->library_id);
        $stmt->bindParam(":book_id", $data->book_id);
        $stmt->bindParam(":price", $data->price);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Purchase request sent", "transaction_id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create purchase request"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>