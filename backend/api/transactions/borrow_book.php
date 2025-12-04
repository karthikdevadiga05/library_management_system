<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->user_id) &&
    !empty($data->library_id) &&
    !empty($data->book_id)
) {
    try {
        // Check if user already has this book borrowed in last 15 days
        $check_query = "SELECT transaction_id 
                        FROM transactions 
                        WHERE user_id = :user_id 
                        AND book_id = :book_id 
                        AND transaction_type = 'borrow'
                        AND status IN ('pending', 'active')
                        AND created_at > DATE_SUB(NOW(), INTERVAL 15 DAY)";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":user_id", $data->user_id);
        $check_stmt->bindParam(":book_id", $data->book_id);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array(
                "message" => "You already have this book borrowed. You can borrow it again after returning it and waiting 15 days."
            ));
            exit();
        }
        
        // Check if book is available
        $book_query = "SELECT available_copies FROM books WHERE book_id = :book_id";
        $book_stmt = $db->prepare($book_query);
        $book_stmt->bindParam(":book_id", $data->book_id);
        $book_stmt->execute();
        $book = $book_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($book['available_copies'] > 0) {
            // Get borrow duration from settings
            $settings_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'borrow_duration_days'";
            $settings_stmt = $db->prepare($settings_query);
            $settings_stmt->execute();
            $borrow_days = $settings_stmt->fetch(PDO::FETCH_ASSOC)['setting_value'];
            
            $due_date = date('Y-m-d H:i:s', strtotime("+{$borrow_days} days"));
            
            // Create transaction
            $query = "INSERT INTO transactions (user_id, library_id, book_id, transaction_type, status, due_date) 
                      VALUES (:user_id, :library_id, :book_id, 'borrow', 'pending', :due_date)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_id", $data->user_id);
            $stmt->bindParam(":library_id", $data->library_id);
            $stmt->bindParam(":book_id", $data->book_id);
            $stmt->bindParam(":due_date", $due_date);
            
            if ($stmt->execute()) {
                // Decrease available copies
                $update_query = "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = :book_id";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(":book_id", $data->book_id);
                $update_stmt->execute();
                
                // Create notification
                $notif_query = "INSERT INTO notifications (user_id, title, message, notification_type) 
                                VALUES (:user_id, 'Book Borrowed', 'Please visit the library within 24 hours to confirm your booking', 'warning')";
                $notif_stmt = $db->prepare($notif_query);
                $notif_stmt->bindParam(":user_id", $data->user_id);
                $notif_stmt->execute();
                
                http_response_code(201);
                echo json_encode(array(
                    "message" => "Book borrowed successfully. Visit library within 24 hours",
                    "transaction_id" => $db->lastInsertId(),
                    "due_date" => $due_date
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create transaction"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Book not available"));
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