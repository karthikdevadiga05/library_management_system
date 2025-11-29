<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->transaction_id)) {
    try {
        // Get transaction details
        $get_query = "SELECT book_id FROM transactions WHERE transaction_id = :transaction_id";
        $get_stmt = $db->prepare($get_query);
        $get_stmt->bindParam(":transaction_id", $data->transaction_id);
        $get_stmt->execute();
        $transaction = $get_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Update transaction
        $query = "UPDATE transactions SET status = 'completed', payment_status = 'paid' WHERE transaction_id = :transaction_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":transaction_id", $data->transaction_id);
        
        if ($stmt->execute()) {
            // Decrease available copies
            $update_query = "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = :book_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(":book_id", $transaction['book_id']);
            $update_stmt->execute();
            
            http_response_code(200);
            echo json_encode(array("message" => "Purchase approved"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to approve purchase"));
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