<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get visit confirmation hours from settings
    $settings_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'visit_confirmation_hours'";
    $settings_stmt = $db->prepare($settings_query);
    $settings_stmt->execute();
    $confirmation_hours = $settings_stmt->fetch(PDO::FETCH_ASSOC)['setting_value'];
    
    $expiry_time = date('Y-m-d H:i:s', strtotime("-{$confirmation_hours} hours"));
    
    // Find expired pending borrows
    $query = "SELECT transaction_id, book_id FROM transactions 
              WHERE transaction_type = 'borrow' 
              AND status = 'pending' 
              AND visit_confirmed = FALSE 
              AND created_at < :expiry_time";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":expiry_time", $expiry_time);
    $stmt->execute();
    
    $expired_count = 0;
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Update transaction status
        $update_query = "UPDATE transactions SET status = 'expired' WHERE transaction_id = :transaction_id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(":transaction_id", $row['transaction_id']);
        $update_stmt->execute();
        
        // Return book to available
        $book_query = "UPDATE books SET available_copies = available_copies + 1 WHERE book_id = :book_id";
        $book_stmt = $db->prepare($book_query);
        $book_stmt->bindParam(":book_id", $row['book_id']);
        $book_stmt->execute();
        
        $expired_count++;
    }
    
    http_response_code(200);
    echo json_encode(array("message" => "Checked expired transactions", "expired_count" => $expired_count));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>







