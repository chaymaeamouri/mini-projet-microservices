<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ApiController extends AbstractController
{
    #[Route('/api/status', name: 'api_status', methods: ['GET'])]
    public function getStatus(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'OK',
            'service' => 'Service Authentication',
            'message' => 'Hello from microservice 1!',
            'timestamp' => time(),
        ]);
    }
}
