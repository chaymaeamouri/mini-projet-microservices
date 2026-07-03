<?php
$config = ['private_key_type' => OPENSSL_KEYTYPE_RSA, 'private_key_bits' => 4096];
$res = openssl_pkey_new($config);
openssl_pkey_export($res, $privateKey);
$publicKey = openssl_pkey_get_details($res)['key'];
if (!is_dir('config/jwt')) { mkdir('config/jwt', 0755, true); }
file_put_contents('config/jwt/private.pem', $privateKey);
file_put_contents('config/jwt/public.pem', $publicKey);
echo 'Clés JWT générées avec succès !' . PHP_EOL;
