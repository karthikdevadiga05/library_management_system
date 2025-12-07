<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $db->beginTransaction();
    
    // Get visit confirmation hours from settings (with fallback)
    $confirmation_hours = 24; // Default fallback
    
    try {
        $settings_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'visit_confirmation_hours'";
        $settings_stmt = $db->prepare($settings_query);
        $settings_stmt->execute();
        $settings_result = $settings_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($settings_result) {
            $confirmation_hours = (int)$settings_result['setting_value'];
        }
    } catch (PDOException $e) {
        // If system_settings doesn't exist or has error, use default
        $confirmation_hours = 24;
    }
    
    // Calculate expiry time
    $expiry_time = date('Y-m-d H:i:s', strtotime("-{$confirmation_hours} hours"));
    
    // Find expired pending borrows that were not confirmed
    $query = "SELECT t.transaction_id, t.book_id, t.created_at, b.title
              FROM transactions t
              JOIN books b ON t.book_id = b.book_id
              WHERE t.transaction_type = 'borrow' 
              AND t.status = 'pending' 
              AND (t.visit_confirmed = FALSE OR t.visit_confirmed IS NULL)
              AND t.created_at < :expiry_time";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":expiry_time", $expiry_time);
    $stmt->execute();
    
    $expired_transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $expired_count = 0;
    
    foreach ($expired_transactions as $row) {
        // Update transaction status to expired
        $update_query = "UPDATE transactions 
                        SET status = 'expired',
                            notes = CONCAT(COALESCE(notes, ''), ' Expired on ', NOW(), ' - User did not visit library within 24 hours')
                        WHERE transaction_id = :transaction_id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(":transaction_id", $row['transaction_id']);
        $update_stmt->execute();
        
        // Return book to available inventory
        $book_query = "UPDATE books 
                      SET available_copies = available_copies + 1 
                      WHERE book_id = :book_id";
        $book_stmt = $db->prepare($book_query);
        $book_stmt->bindParam(":book_id", $row['book_id']);
        $book_stmt->execute();
        
        $expired_count++;
    }
    
    $db->commit();
    
    http_response_code(200);
    echo json_encode(array(
        "message" => "Checked expired transactions",
        "expired_count" => $expired_count,
        "expiry_time" => $expiry_time,
        "confirmation_hours" => $confirmation_hours
    ));
    
} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>