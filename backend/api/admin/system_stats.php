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
    // Total users
    $users_query = "SELECT COUNT(*) as total FROM users WHERE user_type = 'user' AND status = 'active'";
    $users_stmt = $db->prepare($users_query);
    $users_stmt->execute();
    $totalUsers = $users_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total libraries
    $libraries_query = "SELECT COUNT(*) as total FROM users WHERE user_type = 'library' AND status = 'active'";
    $libraries_stmt = $db->prepare($libraries_query);
    $libraries_stmt->execute();
    $totalLibraries = $libraries_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total books
    $books_query = "SELECT COUNT(*) as total FROM books WHERE status = 'active'";
    $books_stmt = $db->prepare($books_query);
    $books_stmt->execute();
    $totalBooks = $books_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Active loans
    $loans_query = "SELECT COUNT(*) as total FROM transactions WHERE transaction_type = 'borrow' AND status = 'active'";
    $loans_stmt = $db->prepare($loans_query);
    $loans_stmt->execute();
    $activeLoans = $loans_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Pending transactions
    $pending_query = "SELECT COUNT(*) as total FROM transactions WHERE status = 'pending'";
    $pending_stmt = $db->prepare($pending_query);
    $pending_stmt->execute();
    $pendingTransactions = $pending_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total revenue
    $revenue_query = "SELECT COALESCE(SUM(price), 0) as total FROM transactions WHERE transaction_type = 'purchase' AND status = 'completed'";
    $revenue_stmt = $db->prepare($revenue_query);
    $revenue_stmt->execute();
    $totalRevenue = $revenue_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $stats = array(
        'totalUsers' => (int)$totalUsers,
        'totalLibraries' => (int)$totalLibraries,
        'totalBooks' => (int)$totalBooks,
        'activeLoans' => (int)$activeLoans,
        'pendingTransactions' => (int)$pendingTransactions,
        'totalRevenue' => (float)$totalRevenue
    );
    
    http_response_code(200);
    echo json_encode(array('stats' => $stats));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>