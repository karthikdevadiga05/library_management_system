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
    $libQuery = "SELECT COUNT(*) as count FROM libraries l 
                 JOIN users u ON l.user_id = u.user_id 
                 WHERE u.status = 'active'";
    $libStmt = $db->prepare($libQuery);
    $libStmt->execute();
    $totalLibraries = $libStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get total books
    $bookQuery = "SELECT COALESCE(SUM(total_copies), 0) as count FROM books WHERE status = 'active'";
    $bookStmt = $db->prepare($bookQuery);
    $bookStmt->execute();
    $totalBooks = $bookStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get active loans
    $loanQuery = "SELECT COUNT(*) as count FROM transactions 
                  WHERE transaction_type = 'borrow' AND status = 'active'";
    $loanStmt = $db->prepare($loanQuery);
    $loanStmt->execute();
    $activeLoans = $loanStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get pending transactions
    $pendingQuery = "SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'";
    $pendingStmt = $db->prepare($pendingQuery);
    $pendingStmt->execute();
    $pendingTransactions = $pendingStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get total revenue
    $revenueQuery = "SELECT COALESCE(SUM(price), 0) as total 
                     FROM transactions 
                     WHERE transaction_type = 'purchase' AND status = 'completed'";
    $revenueStmt = $db->prepare($revenueQuery);
    $revenueStmt->execute();
    $totalRevenue = $revenueStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get recent activity (last 10 transactions)
    $activityQuery = "SELECT t.transaction_id, t.transaction_type, t.status, t.created_at,
                      u.full_name as user_name, b.title as book_title, l.library_name
                      FROM transactions t
                      JOIN users u ON t.user_id = u.user_id
                      JOIN books b ON t.book_id = b.book_id
                      JOIN libraries l ON t.library_id = l.library_id
                      ORDER BY t.created_at DESC
                      LIMIT 10";
    $activityStmt = $db->prepare($activityQuery);
    $activityStmt->execute();
    $recentActivity = $activityStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stats = array(
        'totalUsers' => (int)$totalUsers,
        'totalLibraries' => (int)$totalLibraries,
        'totalBooks' => (int)$totalBooks,
        'activeLoans' => (int)$activeLoans,
        'pendingTransactions' => (int)$pendingTransactions,
        'totalRevenue' => (float)$totalRevenue
    );
    
    $formattedActivity = array();
    foreach ($recentActivity as $activity) {
        $formattedActivity[] = array(
            'description' => ucfirst($activity['transaction_type']) . ': ' . $activity['user_name'] . ' - ' . $activity['book_title'] . ' at ' . $activity['library_name'],
            'timestamp' => date('M d, Y H:i', strtotime($activity['created_at'])),
            'status' => $activity['status']
        );
    }
    
    http_response_code(200);
    echo json_encode(array(
        'stats' => $stats,
        'recentActivity' => $formattedActivity
    ));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>