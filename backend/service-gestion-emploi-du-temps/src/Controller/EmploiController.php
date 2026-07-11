<?php

namespace App\Controller;

use App\Entity\Emploi;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/emploi')]
class EmploiController extends AbstractController
{
    // -------------------------------------------------------
    // GET /api/emploi — Lister toutes les séances
    // -------------------------------------------------------
    #[Route('', name: 'api_emploi_list', methods: ['GET'])]
    public function list(EntityManagerInterface $entityManager): JsonResponse
    {
        $emplois = $entityManager->getRepository(Emploi::class)->findAll();
        $data = array_map(fn(Emploi $emploi) => $this->serialize($emploi), $emplois);

        return new JsonResponse($data);
    }

    // -------------------------------------------------------
    // GET /api/emploi/{id} — Afficher une séance précise
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_emploi_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $emploi = $entityManager->getRepository(Emploi::class)->find($id);

        if (!$emploi) {
            return new JsonResponse(['error' => 'Séance non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($this->serialize($emploi));
    }

    // -------------------------------------------------------
    // POST /api/emploi — Créer une séance
    // -------------------------------------------------------
    #[Route('', name: 'api_emploi_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['titre']) || empty($data['debut']) || empty($data['fin']) || empty($data['salle'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants : titre, debut, fin, salle'], Response::HTTP_BAD_REQUEST);
        }

        $emploi = new Emploi();
        $emploi->setTitre($data['titre']);
        $emploi->setDescription($data['description'] ?? null);
        $emploi->setSalle($data['salle']);

        try {
            $debut = new \DateTime($data['debut']);
            $fin   = new \DateTime($data['fin']);

            if ($fin <= $debut) {
                return new JsonResponse(['error' => 'La date de fin doit être après la date de début.'], Response::HTTP_BAD_REQUEST);
            }

            $emploi->setDebut($debut);
            $emploi->setFin($fin);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Format de date invalide (attendu : YYYY-MM-DD HH:MM:SS)'], Response::HTTP_BAD_REQUEST);
        }

        $entityManager->persist($emploi);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Séance créée avec succès', 'id' => $emploi->getId()], Response::HTTP_CREATED);
    }

    // -------------------------------------------------------
    // PUT /api/emploi/{id} — Modifier une séance (remplacement complet)
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_emploi_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $emploi = $entityManager->getRepository(Emploi::class)->find($id);

        if (!$emploi) {
            return new JsonResponse(['error' => 'Séance non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['titre']) || empty($data['debut']) || empty($data['fin']) || empty($data['salle'])) {
            return new JsonResponse(['error' => 'Champs obligatoires manquants : titre, debut, fin, salle'], Response::HTTP_BAD_REQUEST);
        }

        $emploi->setTitre($data['titre']);
        $emploi->setDescription($data['description'] ?? null);
        $emploi->setSalle($data['salle']);

        try {
            $debut = new \DateTime($data['debut']);
            $fin   = new \DateTime($data['fin']);

            if ($fin <= $debut) {
                return new JsonResponse(['error' => 'La date de fin doit être après la date de début.'], Response::HTTP_BAD_REQUEST);
            }

            $emploi->setDebut($debut);
            $emploi->setFin($fin);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Format de date invalide (attendu : YYYY-MM-DD HH:MM:SS)'], Response::HTTP_BAD_REQUEST);
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'Séance mise à jour avec succès', 'emploi' => $this->serialize($emploi)]);
    }

    // -------------------------------------------------------
    // PATCH /api/emploi/{id} — Modifier partiellement une séance
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_emploi_patch', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function patch(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $emploi = $entityManager->getRepository(Emploi::class)->find($id);

        if (!$emploi) {
            return new JsonResponse(['error' => 'Séance non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['titre'])) {
            $emploi->setTitre($data['titre']);
        }

        if (array_key_exists('description', $data)) {
            $emploi->setDescription($data['description']);
        }

        if (isset($data['salle'])) {
            $emploi->setSalle($data['salle']);
        }

        // Traitement des dates : on les gère ensemble pour pouvoir valider début < fin
        $debut = $emploi->getDebut();
        $fin   = $emploi->getFin();
        $datesChanged = false;

        if (isset($data['debut'])) {
            try {
                $debut = new \DateTime($data['debut']);
                $datesChanged = true;
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date de début invalide'], Response::HTTP_BAD_REQUEST);
            }
        }

        if (isset($data['fin'])) {
            try {
                $fin = new \DateTime($data['fin']);
                $datesChanged = true;
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date de fin invalide'], Response::HTTP_BAD_REQUEST);
            }
        }

        if ($datesChanged) {
            if ($fin <= $debut) {
                return new JsonResponse(['error' => 'La date de fin doit être après la date de début.'], Response::HTTP_BAD_REQUEST);
            }
            $emploi->setDebut($debut);
            $emploi->setFin($fin);
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'Séance mise à jour avec succès', 'emploi' => $this->serialize($emploi)]);
    }

    // -------------------------------------------------------
    // DELETE /api/emploi/{id} — Supprimer une séance
    // -------------------------------------------------------
    #[Route('/{id}', name: 'api_emploi_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $emploi = $entityManager->getRepository(Emploi::class)->find($id);

        if (!$emploi) {
            return new JsonResponse(['error' => 'Séance non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($emploi);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Séance supprimée avec succès.'], Response::HTTP_OK);
    }

    // -------------------------------------------------------
    // Méthode privée de sérialisation
    // -------------------------------------------------------
    private function serialize(Emploi $emploi): array
    {
        return [
            'id'          => $emploi->getId(),
            'titre'       => $emploi->getTitre(),
            'description' => $emploi->getDescription(),
            'debut'       => $emploi->getDebut()->format('Y-m-d H:i:s'),
            'fin'         => $emploi->getFin()->format('Y-m-d H:i:s'),
            'salle'       => $emploi->getSalle(),
        ];
    }
}
