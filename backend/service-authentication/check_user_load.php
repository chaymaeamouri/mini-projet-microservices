<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=db_authentication;charset=utf8mb4', 'root', '');
$row = $pdo->query('SELECT id, email, roles, password FROM user WHERE email = "admin@test.com"')->fetch(PDO::FETCH_ASSOC);
var_export($row);
echo PHP_EOL;

// Test Symfony user load
require __DIR__ . '/vendor/autoload.php';
use Symfony\Component\Dotenv\Dotenv;
(new Dotenv())->bootEnv(__DIR__ . '/.env');

$kernel = new App\Kernel('dev', true);
$kernel->boot();
$em = $kernel->getContainer()->get('doctrine')->getManager();
$user = $em->getRepository(App\Entity\User::class)->findOneBy(['email' => 'admin@test.com']);
if ($user) {
    echo 'User loaded: ' . $user->getEmail() . PHP_EOL;
    echo 'Roles: ' . json_encode($user->getRoles()) . PHP_EOL;
    echo 'Password hash prefix: ' . substr($user->getPassword(), 0, 30) . PHP_EOL;
} else {
    echo "User NOT loaded from Doctrine\n";
}
