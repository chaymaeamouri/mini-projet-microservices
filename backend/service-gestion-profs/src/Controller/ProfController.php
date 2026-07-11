<?php

namespace App\Controller;

use App\Entity\Prof;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/profs')]
class ProfController extends AbstractController
{
    // -------------------------------------------------------
    // GET /api/profs — Lister tous les professeurs
    // -------------------------------------------------------
    #[Route('', name: 'api_profs_list', methods: ['GET'])]
    public function list(EntityManagerInterface $entityManager): JsonResponse
    {
        $profs = $entityManager->getRepository(Prof::class)->findAll();
        $data = array_map(fn(Prof $prof) => $this->serialize($prof), $profs);

        return new JsonResponse($data);
    }

    // -------------------------------------------------------
    // GET /api/profs/{id} — Afficher un seul professeur
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_profs_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $prof = $entityManager->getRepository(Prof::class)->find($id);

        if (!$prof) {
            return new JsonResponse(['error' => 'Professeur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($this->serialize($prof));
    }

    // -------------------------------------------------------
    // POST /api/profs — Créer un professeur
    // -------------------------------------------------------
    #[Route('', name: 'api_profs_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nom']) || empty($data['prenom']) || empty($data['email']) || empty($data['departement'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants : nom, prenom, email, departement'], Response::HTTP_BAD_REQUEST);
        }

        $existing = $entityManager->getRepository(Prof::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return new JsonResponse(['error' => 'Un professeur avec cet email existe déjà.'], Response::HTTP_CONFLICT);
        }

        $prof = new Prof();
        $prof->setNom($data['nom']);
        $prof->setPrenom($data['prenom']);
        $prof->setEmail($data['email']);
        $prof->setDepartement($data['departement']);

        if (!empty($data['date_naissance'])) {
            try {
                $prof->setDateNaissance(new \DateTime($data['date_naissance']));
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date invalide (attendu : YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
            }
        }

        $entityManager->persist($prof);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Professeur créé avec succès', 'id' => $prof->getId()], Response::HTTP_CREATED);
    }

    // -------------------------------------------------------
    // PUT /api/profs/{id} — Modifier un professeur (remplacement complet)
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_profs_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $prof = $entityManager->getRepository(Prof::class)->find($id);

        if (!$prof) {
            return new JsonResponse(['error' => 'Professeur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['nom']) || empty($data['prenom']) || empty($data['email']) || empty($data['departement'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants : nom, prenom, email, departement'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si le nouvel email est déjà pris par un AUTRE professeur
        $existing = $entityManager->getRepository(Prof::class)->findOneBy(['email' => $data['email']]);
        if ($existing && $existing->getId() !== $prof->getId()) {
            return new JsonResponse(['error' => 'Cet email est déjà utilisé par un autre professeur.'], Response::HTTP_CONFLICT);
        }

        $prof->setNom($data['nom']);
        $prof->setPrenom($data['prenom']);
        $prof->setEmail($data['email']);
        $prof->setDepartement($data['departement']);

        if (array_key_exists('date_naissance', $data)) {
            if (!empty($data['date_naissance'])) {
                try {
                    $prof->setDateNaissance(new \DateTime($data['date_naissance']));
                } catch (\Exception $e) {
                    return new JsonResponse(['error' => 'Format de date invalide (attendu : YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
                }
            } else {
                $prof->setDateNaissance(null);
            }
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'Professeur mis à jour avec succès', 'prof' => $this->serialize($prof)]);
    }

    // -------------------------------------------------------
    // PATCH /api/profs/{id} — Modifier partiellement un professeur
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_profs_patch', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function patch(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $prof = $entityManager->getRepository(Prof::class)->find($id);

        if (!$prof) {
            return new JsonResponse(['error' => 'Professeur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) {
            $prof->setNom($data['nom']);
        }

        if (isset($data['prenom'])) {
            $prof->setPrenom($data['prenom']);
        }

        if (isset($data['email'])) {
            $existing = $entityManager->getRepository(Prof::class)->findOneBy(['email' => $data['email']]);
            if ($existing && $existing->getId() !== $prof->getId()) {
                return new JsonResponse(['error' => 'Cet email est déjà utilisé par un autre professeur.'], Response::HTTP_CONFLICT);
            }
            $prof->setEmail($data['email']);
        }

        if (isset($data['departement'])) {
            $prof->setDepartement($data['departement']);
        }

        if (array_key_exists('date_naissance', $data)) {
            if (!empty($data['date_naissance'])) {
                try {
                    $prof->setDateNaissance(new \DateTime($data['date_naissance']));
                } catch (\Exception $e) {
                    return new JsonResponse(['error' => 'Format de date invalide (attendu : YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
                }
            } else {
                $prof->setDateNaissance(null);
            }
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'Professeur mis à jour avec succès', 'prof' => $this->serialize($prof)]);
    }

    // -------------------------------------------------------
    // DELETE /api/profs/{id} — Supprimer un professeur
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_profs_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $prof = $entityManager->getRepository(Prof::class)->find($id);

        if (!$prof) {
            return new JsonResponse(['error' => 'Professeur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($prof);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Professeur supprimé avec succès.'], Response::HTTP_OK);
    }

    // -------------------------------------------------------
    // Méthode privée de sérialisation
    // -------------------------------------------------------
    private function serialize(Prof $prof): array
    {
        return [
            'id'             => $prof->getId(),
            'nom'            => $prof->getNom(),
            'prenom'         => $prof->getPrenom(),
            'email'          => $prof->getEmail(),
            'departement'    => $prof->getDepartement(),
            'date_naissance' => $prof->getDateNaissance()?->format('Y-m-d'),
        ];
    }
}
