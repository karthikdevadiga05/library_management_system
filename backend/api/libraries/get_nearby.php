<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';
include_once '../../utils/distance.php';

$database = new Database();
$db = $database->getConnection();

$user_lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$user_lon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;

try {
    // Query to get libraries with book counts
    $query = "SELECT 
                l.library_id,
                l.library_name,
                l.registration_number,
                l.established_year,
                l.website,
                l.description,
                l.opening_hours,
                l.facilities,
                u.city, 
                u.address, 
                u.latitude, 
                u.longitude, 
                u.phone, 
                u.email,
                COUNT(b.book_id) as total_books,
                COALESCE(SUM(b.available_copies), 0) as available_copies
              FROM libraries l
              INNER JOIN users u ON l.user_id = u.user_id
              LEFT JOIN books b ON l.library_id = b.library_id AND b.status = 'active'
              WHERE u.status = 'active'
              GROUP BY l.library_id, l.library_name, l.registration_number, 
                       l.established_year, l.website, l.description, 
                       l.opening_hours, l.facilities,
                       u.city, u.address, u.latitude, u.longitude, 
                       u.phone, u.email";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $libraries = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculate distance if user coordinates are provided
        if ($user_lat && $user_lon) {
            $distance = calculateDistance(
                $user_lat, 
                $user_lon, 
                floatval($row['latitude']), 
                floatval($row['longitude'])
            );
            $row['distance'] = round($distance, 2);
        } else {
            $row['distance'] = null;
        }
        
        // Convert to proper types
        $row['library_id'] = (int)$row['library_id'];
        $row['total_books'] = (int)$row['total_books'];
        $row['available_copies'] = (int)$row['available_copies'];
        $row['established_year'] = $row['established_year'] ? (int)$row['established_year'] : null;
        
        $libraries[] = $row;
    }
    
    // Sort by distance if available
    if ($user_lat && $user_lon) {
        usort($libraries, function($a, $b) {
            if ($a['distance'] === null) return 1;
            if ($b['distance'] === null) return -1;
            return $a['distance'] <=> $b['distance'];
        });
    }
    
    http_response_code(200);
    echo json_encode($libraries);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Database error",
        "error" => $e->getMessage()
    ));
}
?>