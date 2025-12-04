<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->book_id) && !empty($data->quantity)) {
    try {
        // Get current book info
        $check_query = "SELECT total_copies, available_copies FROM books WHERE book_id = :book_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":book_id", $data->book_id);
        $check_stmt->execute();
        $book = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        $borrowed = $book['total_copies'] - $book['available_copies'];
        $new_total = intval($data->quantity);
        $new_available = $new_total - $borrowed;
        
        if ($new_available < 0) {
            http_response_code(400);
            echo json_encode(array(
                "message" => "Cannot set quantity lower than borrowed copies",
                "borrowed_copies" => $borrowed,
                "minimum_required" => $borrowed
            ));
            exit();
        }
        
        // Update book quantity
        $query = "UPDATE books 
                  SET total_copies = :total_copies,
                      available_copies = :available_copies
                  WHERE book_id = :book_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":book_id", $data->book_id);
        $stmt->bindParam(":total_copies", $new_total);
        $stmt->bindParam(":available_copies", $new_available);
        
        if ($stmt->execute()) {
            // Update library total books count
            $library_query = "UPDATE libraries l 
                              SET total_books = (
                                  SELECT SUM(total_copies) 
                                  FROM books b 
                                  WHERE b.library_id = l.library_id
                              )
                              WHERE l.library_id = (
                                  SELECT library_id FROM books WHERE book_id = :book_id
                              )";
            $library_stmt = $db->prepare($library_query);
            $library_stmt->bindParam(":book_id", $data->book_id);
            $library_stmt->execute();
            
            http_response_code(200);
            echo json_encode(array(
                "message" => "Book quantity updated successfully",
                "total_copies" => $new_total,
                "available_copies" => $new_available
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update quantity"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Book ID and quantity required"));
}
?>