<?php
$hash = '$2y$13$ndnWOEt.9iP4CiE8zbaCyuvqlu0A8z.DVFvTfXyAEn/UlOhzAjYd.';
$candidates = ['password', 'Password', 'admin', '123456', 'test'];
foreach ($candidates as $p) {
    echo $p . ': ' . (password_verify($p, $hash) ? 'OK' : 'NO') . PHP_EOL;
}
