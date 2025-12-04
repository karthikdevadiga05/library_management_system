<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$library_id = isset($_GET['library_id']) ? $_GET['library_id'] : null;

if (!$library_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Library ID required"));
    exit();
}

try {
    // Get total books
    $books_query = "SELECT COUNT(*) as total_books, SUM(available_copies) as available_books 
                    FROM books WHERE library_id = :library_id AND status = 'active'";
    $books_stmt = $db->prepare($books_query);
    $books_stmt->bindParam(":library_id", $library_id);
    $books_stmt->execute();
    $book_stats = $books_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get active loans
    $loans_query = "SELECT COUNT(*) as active_loans FROM transactions 
                    WHERE library_id = :library_id 
                    AND transaction_type = 'borrow' 
                    AND status = 'active'";
    $loans_stmt = $db->prepare($loans_query);
    $loans_stmt->bindParam(":library_id", $library_id);
    $loans_stmt->execute();
    $loan_stats = $loans_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get pending requests
    $pending_query = "SELECT COUNT(*) as pending_requests FROM transactions 
                      WHERE library_id = :library_id AND status = 'pending'";
    $pending_stmt = $db->prepare($pending_query);
    $pending_stmt->bindParam(":library_id", $library_id);
    $pending_stmt->execute();
    $pending_stats = $pending_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get total revenue
    $revenue_query = "SELECT SUM(price) as total_revenue FROM transactions 
                      WHERE library_id = :library_id 
                      AND transaction_type = 'purchase' 
                      AND status = 'completed'";
    $revenue_stmt = $db->prepare($revenue_query);
    $revenue_stmt->bindParam(":library_id", $library_id);
    $revenue_stmt->execute();
    $revenue_stats = $revenue_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get overdue books
    $overdue_query = "SELECT COUNT(*) as overdue_books FROM transactions 
                      WHERE library_id = :library_id 
                      AND transaction_type = 'borrow' 
                      AND status = 'active' 
                      AND due_date < NOW()";
    $overdue_stmt = $db->prepare($overdue_query);
    $overdue_stmt->bindParam(":library_id", $library_id);
    $overdue_stmt->execute();
    $overdue_stats = $overdue_stmt->fetch(PDO::FETCH_ASSOC);
    
    $stats = array(
        'total_books' => (int)$book_stats['total_books'],
        'available_books' => (int)$book_stats['available_books'],
        'active_loans' => (int)$loan_stats['active_loans'],
        'pending_requests' => (int)$pending_stats['pending_requests'],
        'total_revenue' => (float)($revenue_stats['total_revenue'] ?? 0),
        'overdue_books' => (int)$overdue_stats['overdue_books']
    );
    
    http_response_code(200);
    echo json_encode($stats);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>