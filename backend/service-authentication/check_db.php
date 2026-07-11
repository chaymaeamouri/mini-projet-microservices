<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=db_authentication;charset=utf8mb4', 'root', '');
    $rows = $pdo->query('SELECT id, email, roles, LEFT(password, 60) AS pwd FROM user')->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
} catch (Exception $e) {
    echo 'DB ERROR: ' . $e->getMessage() . PHP_EOL;
}
