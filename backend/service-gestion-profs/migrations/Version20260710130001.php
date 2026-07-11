<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260710130001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create prof table for gestion-profs service';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE prof (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, email VARCHAR(180) NOT NULL, departement VARCHAR(100) NOT NULL, date_naissance DATE DEFAULT NULL, PRIMARY KEY(id), UNIQUE INDEX UNIQ_6F5A81B33A5FBB5B (email)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE prof');
    }
}
