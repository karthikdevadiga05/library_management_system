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
    
    while ($row = $stmt->fetch(