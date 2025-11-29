<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';
include_once '../../utils/distance.php';

$database = new Database();
$db = $database->getConnection();

$search = isset($_GET['q']) ? $_GET['q'] : '';
$user_lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$user_lon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;

if (!empty($search)) {
    $query = "SELECT b.*, l.library_id, l.library_name, u.latitude, u.longitude, u.city, u.address 
              FROM books b 
              JOIN libraries l ON b.library_id = l.library_id 
              JOIN users u ON l.user_id = u.user_id 
              WHERE (b.title LIKE :search OR b.author LIKE :search OR b.category LIKE :search) 
              AND b.status = 'active' AND b.available_copies > 0
              ORDER BY b.title";
    
    $stmt = $db->prepare($query);
    $search_param = "%{$search}%";
    $stmt->bindParam(":search", $search_param);
    $stmt->execute();
    
    $books = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculate distance if user location provided
        if ($user_lat && $user_lon) {
            $row['distance'] = calculateDistance($user_lat, $user_lon, $row['latitude'], $row['longitude']);
        } else {
            $row['distance'] = null;
        }
        
        $books[] = $row;
    }
    
    // Sort by distance if available
    if ($user_lat && $user_lon) {
        usort($books, function($a, $b) {
            return $a['distance'] <=> $b['distance'];
        });
    }
    
    http_response_code(200);
    echo json_encode($books);
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Search query required"));
}
?>