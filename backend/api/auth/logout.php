<?php
include_once '../../utils/cors.php';

// Clear session if you're using sessions
session_start();
session_destroy();

http_response_code(200);
echo json_encode(array("message" => "Logged out successfully"));
?>