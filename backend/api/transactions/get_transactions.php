<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$library_id = isset($_GET['library_id']) ? $_GET['library_id'] : null;

try {
    $query = "SELECT t.*, b.title as book_title, b.author, b.price as book_price,
              u.full_name as user_name, u.email as user_email, u.phone as user_phone,
              l.library_name
              FROM transactions t
              JOIN books b ON t.book_id = b.book_id
              JOIN users u ON t.user_id = u.user_id
              JOIN libraries l ON t.library_id = l.library_id
              WHERE 1=1";
    
    if ($user_id) {
        $query .= " AND t.user_id = :user_id";
    }
    
    if ($library_id) {
        $query .= " AND t.library_id = :library_id";
    }
    
    $query .= " ORDER BY t.created_at DESC";
    
    $stmt = $db->prepare($query);
    
    if ($user_id) {
        $stmt->bindParam(":user_id", $user_id);
    }
    
    if ($library_id) {
        $stmt->bindParam(":library_id", $library_id);
    }
    
    $stmt->execute();
    
    $transactions = array();
    
    // Get fine per day from settings
    $settings_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'fine_per_day'";
    $settings_stmt = $db->prepare($settings_query);
    $settings_stmt->execute();
    $fine_per_day = floatval($settings_stmt->fetch(PDO::FETCH_ASSOC)['setting_value']);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculate fine for active borrows
        if ($row['transaction_type'] == 'borrow' && $row['status'] == 'active' && $row['due_date']) {
            $due_timestamp = strtotime($row['due_date']);
            $current_timestamp = time();
            
            if ($current_timestamp > $due_timestamp) {
                $days_late = ceil(($current_timestamp - $due_timestamp) / 86400);
                $row['calculated_fine'] = $days_late * $fine_per_day;
            } else {
                $row['calculated_fine'] = 0;
            }
        } else {
            $row['calculated_fine'] = 0;
        }
        
        $transactions[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($transactions);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>