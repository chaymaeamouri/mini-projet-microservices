<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260710130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create emploi table for gestion-emploi-du-temps service';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE emploi (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(150) NOT NULL, description LONGTEXT DEFAULT NULL, debut DATETIME NOT NULL, fin DATETIME NOT NULL, salle VARCHAR(50) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE emploi');
    }
}
