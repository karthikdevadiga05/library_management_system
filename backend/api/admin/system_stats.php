<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get total users
    $userQuery = "SELECT COUNT(*) as count FROM users WHERE user_type = 'user' AND status = 'active'";
    $userStmt = $db->prepare($userQuery);
    $userStmt->execute();
    $totalUsers = $userStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get total libraries
    $libQuery = "SELECT COUNT(*) as count FROM libraries l JOIN users u ON l.user_id = u.user_id WHERE u.status = 'active'";
    $libStmt = $db->prepare($libQuery);
    $libStmt->execute();
    $totalLibraries = $libStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get total UNIQUE books (different titles/ISBNs)
    $bookQuery = "SELECT COUNT(DISTINCT b.book_id) as count FROM books b WHERE b.status = 'active'";
    $bookStmt = $db->prepare($bookQuery);
    $bookStmt->execute();
    $totalBooks = $bookStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get total copies (physical books)
    $copiesQuery = "SELECT COALESCE(SUM(total_copies), 0) as count FROM books WHERE status = 'active'";
    $copiesStmt = $db->prepare($copiesQuery);
    $copiesStmt->execute();
    $totalCopies = $copiesStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get active loans
    $loanQuery = "SELECT COUNT(*) as count FROM transactions WHERE transaction_type = 'borrow' AND status = 'active'";
    $loanStmt = $db->prepare($loanQuery);
    $loanStmt->execute();
    $activeLoans = $loanStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get pending transactions
    $pendingQuery = "SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'";
    $pendingStmt = $db->prepare($pendingQuery);
    $pendingStmt->execute();
    $pendingTransactions = $pendingStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get total revenue
    $revenueQuery = "SELECT COALESCE(SUM(price), 0) as total FROM transactions WHERE transaction_type = 'purchase' AND status = 'completed'";
    $revenueStmt = $db->prepare($revenueQuery);
    $revenueStmt->execute();
    $totalRevenue = $revenueStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total fines collected
    $finesQuery = "SELECT COALESCE(SUM(fine_amount), 0) as total FROM transactions WHERE payment_status = 'paid' AND fine_amount > 0";
    $finesStmt = $db->prepare($finesQuery);
    $finesStmt->execute();
    $totalFines = $finesStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $stats = array(
        'totalUsers' => (int)$totalUsers,
        'totalLibraries' => (int)$totalLibraries,
        'totalBooks' => (int)$totalBooks,  // Unique book titles
        'totalCopies' => (int)$totalCopies,  // Total physical copies
        'activeLoans' => (int)$activeLoans,
        'pendingTransactions' => (int)$pendingTransactions,
        'totalRevenue' => (float)$totalRevenue,
        'totalFines' => (float)$totalFines
    );
    
    http_response_code(200);
    echo json_encode(array('stats' => $stats, 'recentActivity' => []));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>