<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                l.*, 
                u.email, 
                u.phone, 
                u.address, 
                u.city, 
                u.status, 
                u.user_id,
                COUNT(DISTINCT b.book_id) as unique_books,
                COALESCE(SUM(b.total_copies), 0) as total_copies
              FROM libraries l
              JOIN users u ON l.user_id = u.user_id
              LEFT JOIN books b ON l.library_id = b.library_id AND b.status = 'active'
              GROUP BY l.library_id
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