<?php

namespace App\Controller;

use App\Entity\Student;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/students')]
class StudentController extends AbstractController
{
    #[Route('', name: 'api_students_list', methods: ['GET'])]
    public function list(EntityManagerInterface $entityManager): JsonResponse
    {
        $students = $entityManager->getRepository(Student::class)->findAll();
        $data = array_map(fn(Student $s) => [
            'id' => $s->getId(),
            'matricule' => $s->getMatricule(),
            'nom' => $s->getNom(),
            'prenom' => $s->getPrenom(),
            'email' => $s->getEmail(),
            'filiere' => $s->getFiliere(),
            'date_naissance' => $s->getDateNaissance() ? $s->getDateNaissance()->format('Y-m-d') : null,
            'created_at' => $s->getCreatedAt()->format('Y-m-d H:i:s')
        ], $students);

        return new JsonResponse($data);
    }

    #[Route('/{id}', name: 'api_students_show', methods: ['GET'])]
    public function show(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $student = $entityManager->getRepository(Student::class)->find($id);

        if (!$student) {
            return new JsonResponse(['error' => 'Étudiant non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $student->getId(),
            'matricule' => $student->getMatricule(),
            'nom' => $student->getNom(),
            'prenom' => $student->getPrenom(),
            'email' => $student->getEmail(),
            'filiere' => $student->getFiliere(),
            'date_naissance' => $student->getDateNaissance() ? $student->getDateNaissance()->format('Y-m-d') : null,
        ]);
    }

    #[Route('', name: 'api_students_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nom']) || empty($data['prenom']) || empty($data['email']) || empty($data['filiere'])) {
            return new JsonResponse(['error' => 'Données incomplètes'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'email existe déjà
        $existing = $entityManager->getRepository(Student::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return new JsonResponse(['error' => 'Un étudiant avec cet email existe déjà.'], Response::HTTP_CONFLICT);
        }

        $student = new Student();
        $student->setNom($data['nom']);
        $student->setPrenom($data['prenom']);
        $student->setEmail($data['email']);
        $student->setFiliere($data['filiere']);

        if (!empty($data['date_naissance'])) {
            try {
                $student->setDateNaissance(new \DateTime($data['date_naissance']));
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }

        $entityManager->persist($student);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Étudiant créé avec succès',
            'id' => $student->getId(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_students_update', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $student = $entityManager->getRepository(Student::class)->find($id);

        if (!$student) {
            return new JsonResponse(['error' => 'Étudiant non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) $student->setNom($data['nom']);
        if (isset($data['prenom'])) $student->setPrenom($data['prenom']);
        if (isset($data['email'])) {
            // Check uniqueness
            $existing = $entityManager->getRepository(Student::class)->findOneBy(['email' => $data['email']]);
            if ($existing && $existing->getId() !== $id) {
                return new JsonResponse(['error' => 'Un étudiant avec cet email existe déjà.'], Response::HTTP_CONFLICT);
            }
            $student->setEmail($data['email']);
        }
        if (isset($data['filiere'])) $student->setFiliere($data['filiere']);
        if (isset($data['date_naissance'])) {
            try {
                $student->setDateNaissance(new \DateTime($data['date_naissance']));
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'Étudiant mis à jour avec succès']);
    }

    #[Route('/{id}', name: 'api_students_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $student = $entityManager->getRepository(Student::class)->find($id);

        if (!$student) {
            return new JsonResponse(['error' => 'Étudiant non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($student);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Étudiant supprimé avec succès']);
    }
}
