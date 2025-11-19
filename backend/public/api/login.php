<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$response = [
    'success' => true,
    'message' => 'Login successful',
    'data' => [
        'user' => [
            'id' => 1,
            'name' => 'Admin User',
            'email' => 'admin@hospital.com',
            'role' => 'admin',
            'permissions' => [],
            'roles' => ['admin']
        ],
        'token' => 'test-token-123',
        'refresh_token' => 'refresh-token-123'
    ]
];

echo json_encode($response);
?>
