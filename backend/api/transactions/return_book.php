<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->transaction_id)) {
    try {
        $db->beginTransaction();
        
        // Get transaction details
        $query = "SELECT t.*, b.book_id, b.library_id 
                  FROM transactions t 
                  JOIN books b ON t.book_id = b.book_id 
                  WHERE t.transaction_id = :transaction_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":transaction_id", $data->transaction_id);
        $stmt->execute();
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$transaction) {
            http_response_code(404);
            echo json_encode(array("message" => "Transaction not found"));
            $db->rollBack();
            exit();
        }
        
        // Calculate final fine if overdue
        $fine = 0;
        if ($transaction['due_date']) {
            $due_timestamp = strtotime($transaction['due_date']);
            $current_timestamp = time();
            
            if ($current_timestamp > $due_timestamp) {
                // Get fine per day from settings
                $settings_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'fine_per_day'";
                $settings_stmt = $db->prepare($settings_query);
                $settings_stmt->execute();
                $fine_per_day = floatval($settings_stmt->fetch(PDO::FETCH_ASSOC)['setting_value']);
                
                $days_late = ceil(($current_timestamp - $due_timestamp) / 86400);
                $fine = $days_late * $fine_per_day;
            }
        }
        
        // Update transaction
        $update_query = "UPDATE transactions 
                         SET status = 'completed', 
                             return_date = CURRENT_TIMESTAMP,
                             fine_amount = :fine,
                             payment_status = :payment_status
                         WHERE transaction_id = :transaction_id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(":transaction_id", $data->transaction_id);
        $update_stmt->bindParam(":fine", $fine);
        
        // If fine is paid, mark as paid, otherwise pending
        $payment_status = ($fine > 0 && isset($data->fine_paid) && $data->fine_paid) ? 'paid' : 'pending';
        $update_stmt->bindParam(":payment_status", $payment_status);
        $update_stmt->execute();
        
        // Return book to inventory
        $book_query = "UPDATE books SET available_copies = available_copies + 1 WHERE book_id = :book_id";
        $book_stmt = $db->prepare($book_query);
        $book_stmt->bindParam(":book_id", $transaction['book_id']);
        $book_stmt->execute();
        
        $db->commit();
        
        http_response_code(200);
        echo json_encode(array(
            "message" => "Book returned successfully",
            "fine" => $fine,
            "payment_status" => $payment_status
        ));
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Transaction ID required"));
}
?>