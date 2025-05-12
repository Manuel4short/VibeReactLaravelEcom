<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Schema\AbstractSchemaManager;
use Illuminate\Support\Facades\Schema as LaravelSchema;

class CompareSchema extends Command
{
    protected $signature = 'db:compare-schema';
    protected $description = 'Compare Laravel migrations to the actual database schema';

    public function handle()
    {
        // DB connection config
        $connection = DriverManager::getConnection([
            'dbname'   => env('DB_DATABASE'),
            'user'     => env('DB_USERNAME'),
            'password' => env('DB_PASSWORD'),
            'host'     => env('DB_HOST'),
            'port'     => env('DB_PORT'),
            'driver'   => 'pdo_mysql',
        ]);

        /** @var AbstractSchemaManager $schemaManager */
        $schemaManager = $connection->getSchemaManager();

        $dbTables = [];
        foreach ($schemaManager->listTables() as $table) {
            $dbTables[$table->getName()] = $table;
        }

        $laravelSchemaManager = LaravelSchema::getConnection()->getDoctrineSchemaManager();

        $laravelTables = [];
        foreach ($laravelSchemaManager->listTables() as $table) {
            $laravelTables[$table->getName()] = $table;
        }

        $this->info('Comparing database schema...');

        $this->compareTables($dbTables, $laravelTables);

        $this->info('Schema comparison completed!');
    }

    private function compareTables(array $dbTables, array $laravelTables)
    {
        foreach ($dbTables as $tableName => $dbTable) {
            if (isset($laravelTables[$tableName])) {
                $this->info("✅ Table '$tableName' exists in both DB and Laravel schema.");
                $this->compareColumns($dbTable, $laravelTables[$tableName]);
            } else {
                $this->error("❌ Table '$tableName' exists in DB but not in Laravel schema.");
            }
        }

        foreach ($laravelTables as $tableName => $laravelTable) {
            if (!isset($dbTables[$tableName])) {
                $this->error("❌ Table '$tableName' exists in Laravel schema but not in DB.");
            }
        }
    }

    private function compareColumns($dbTable, $laravelTable)
    {
        $dbColumns = $dbTable->getColumns();
        $laravelColumns = $laravelTable->getColumns();

        foreach ($dbColumns as $columnName => $dbColumn) {
            if (isset($laravelColumns[$columnName])) {
                $this->line("   ➖ Column '$columnName' matches.");
            } else {
                $this->error("   ❌ Column '$columnName' exists in DB but not in Laravel schema.");
            }
        }

        foreach ($laravelColumns as $columnName => $laravelColumn) {
            if (!isset($dbColumns[$columnName])) {
                $this->error("   ❌ Column '$columnName' exists in Laravel schema but not in DB.");
            }
        }
    }
}
