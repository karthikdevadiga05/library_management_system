<?php
include_once '../../utils/cors.php';
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->library_id) &&
    !empty($data->title) &&
    !empty($data->author) &&
    !empty($data->price) &&
    !empty($data->total_copies)
) {
    try {
        $query = "INSERT INTO books (library_id, isbn, title, author, publisher, publication_year, category, language, price, total_copies, available_copies, description) 
                  VALUES (:library_id, :isbn, :title, :author, :publisher, :publication_year, :category, :language, :price, :total_copies, :available_copies, :description)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":library_id", $data->library_id);
        $stmt->bindParam(":isbn", $data->isbn);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":author", $data->author);
        $stmt->bindParam(":publisher", $data->publisher);
        $stmt->bindParam(":publication_year", $data->publication_year);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":language", $data->language);
        $stmt->bindParam(":price", $data->price);
        $stmt->bindParam(":total_copies", $data->total_copies);
        $stmt->bindParam(":available_copies", $data->total_copies);
        $stmt->bindParam(":description", $data->description);
        
        if ($stmt->execute()) {
            // Update total books count in library
            $update_query = "UPDATE libraries SET total_books = total_books + :copies WHERE library_id = :library_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(":copies", $data->total_copies);
            $update_stmt->bindParam(":library_id", $data->library_id);
            $update_stmt->execute();
            
            http_response_code(201);
            echo json_encode(array("message" => "Book added successfully", "book_id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to add book"));
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