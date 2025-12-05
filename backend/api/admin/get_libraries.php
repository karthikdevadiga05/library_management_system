<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

session_start();

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                l.library_id,
                l.library_name,
                l.registration_number,
                l.established_year,
                l.website,
                l.description,
                l.opening_hours,
                u.user_id,
                u.email,
                u.phone,
                u.address,
                u.city,
                u.status,
                COUNT(b.book_id) as total_books
              FROM libraries l
              INNER JOIN users u ON l.user_id = u.user_id
              LEFT JOIN books b ON l.library_id = b.library_id AND b.status = 'active'
              WHERE u.user_type = 'library'
              GROUP BY l.library_id, l.library_name, l.registration_number, 
                       l.established_year, l.website, l.description, l.opening_hours,
                       u.user_id, u.email, u.phone, u.address, u.city, u.status
              ORDER BY l.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $libraries = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['total_books'] = (int)$row['total_books'];
        $libraries[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($libraries);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>