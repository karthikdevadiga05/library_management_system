<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->transaction_id)) {
    try {
        $query = "UPDATE transactions 
                  SET status = 'active', 
                      visit_confirmed = TRUE, 
                      visit_confirmed_at = CURRENT_TIMESTAMP,
                      borrow_date = CURRENT_TIMESTAMP 
                  WHERE transaction_id = :transaction_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":transaction_id", $data->transaction_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Visit confirmed, book issued"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to confirm visit"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Transaction ID required"));
}
?>