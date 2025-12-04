<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->book_id)) {
    try {
        $query = "UPDATE books SET 
                  title = :title,
                  author = :author,
                  isbn = :isbn,
                  publisher = :publisher,
                  publication_year = :publication_year,
                  category = :category,
                  language = :language,
                  price = :price,
                  total_copies = :total_copies,
                  description = :description,
                  status = :status
                  WHERE book_id = :book_id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":book_id", $data->book_id);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":author", $data->author);
        $stmt->bindParam(":isbn", $data->isbn);
        $stmt->bindParam(":publisher", $data->publisher);
        $stmt->bindParam(":publication_year", $data->publication_year);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":language", $data->language);
        $stmt->bindParam(":price", $data->price);
        $stmt->bindParam(":total_copies", $data->total_copies);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":status", $data->status);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Book updated successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update book"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Book ID required"));
}
?>