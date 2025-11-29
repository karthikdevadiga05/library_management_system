<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $query = "SELECT u.*, l.library_id, l.library_name 
              FROM users u 
              LEFT JOIN libraries l ON u.user_id = l.user_id 
              WHERE u.username = :username AND u.status = 'active'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":username", $data->username);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->password, $row['password'])) {
            unset($row['password']);
            
            http_response_code(200);
            echo json_encode(array(
                "message" => "Login successful",
                "user" => $row
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid credentials"));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid credentials"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>