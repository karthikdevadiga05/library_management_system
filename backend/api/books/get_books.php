<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$library_id = isset($_GET['library_id']) ? $_GET['library_id'] : null;

try {
    if ($library_id) {
        $query = "SELECT * FROM books WHERE library_id = :library_id AND status = 'active' ORDER BY title";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":library_id", $library_id);
    } else {
        $query = "SELECT b.*, l.library_name, u.city 
                  FROM books b 
                  JOIN libraries l ON b.library_id = l.library_id 
                  JOIN users u ON l.user_id = u.user_id 
                  WHERE b.status = 'active' 
                  ORDER BY b.title";
        $stmt = $db->prepare($query);
    }
    
    $stmt->execute();
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($books);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>