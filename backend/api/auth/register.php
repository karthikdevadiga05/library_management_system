<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->username) &&
    !empty($data->password) &&
    !empty($data->full_name) &&
    !empty($data->email) &&
    !empty($data->user_type)
) {
    try {
        // Check if username or email already exists
        $check_query = "SELECT user_id FROM users WHERE username = :username OR email = :email";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":username", $data->username);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "Username or email already exists"));
            exit();
        }

        // Insert user
        $query = "INSERT INTO users (username, password, full_name, email, phone, address, city, state, pincode, latitude, longitude, user_type) 
                  VALUES (:username, :password, :full_name, :email, :phone, :address, :city, :state, :pincode, :latitude, :longitude, :user_type)";
        
        $stmt = $db->prepare($query);
        
        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":full_name", $data->full_name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":address", $data->address);
        $stmt->bindParam(":city", $data->city);
        $stmt->bindParam(":state", $data->state);
        $stmt->bindParam(":pincode", $data->pincode);
        $stmt->bindParam(":latitude", $data->latitude);
        $stmt->bindParam(":longitude", $data->longitude);
        $stmt->bindParam(":user_type", $data->user_type);
        
        if ($stmt->execute()) {
            $user_id = $db->lastInsertId();
            
            // If library, insert into libraries table
            if ($data->user_type === 'library') {
                $lib_query = "INSERT INTO libraries (user_id, library_name, registration_number, established_year, description, opening_hours) 
                              VALUES (:user_id, :library_name, :registration_number, :established_year, :description, :opening_hours)";
                $lib_stmt = $db->prepare($lib_query);
                
                $lib_stmt->bindParam(":user_id", $user_id);
                $lib_stmt->bindParam(":library_name", $data->library_name);
                $lib_stmt->bindParam(":registration_number", $data->registration_number);
                $lib_stmt->bindParam(":established_year", $data->established_year);
                $lib_stmt->bindParam(":description", $data->description);
                $lib_stmt->bindParam(":opening_hours", $data->opening_hours);
                
                $lib_stmt->execute();
            }
            
            http_response_code(201);
            echo json_encode(array("message" => "Registration successful", "user_id" => $user_id));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to register user"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>