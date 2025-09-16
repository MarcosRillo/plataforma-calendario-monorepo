<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting database seeding...');
        $this->command->info('📋 Creating complete test dataset with modular seeders');
        $this->command->newLine();

        // Run seeders in correct order (respecting foreign key dependencies)
        $this->call([
            // 1. Lookup tables first (no dependencies)
            UserRolesSeeder::class,
            OrganizationStatusesSeeder::class,
            OrganizationTypesSeeder::class,
            EventStatusesSeeder::class,
            EventTypesSeeder::class,
            
            // 2. Main tables with foreign key dependencies
            OrganizationSeeder::class,  // Uses org statuses and types
            UserSeeder::class,          // Uses user roles and organizations
            CategorySeeder::class,      // Uses organizations
            LocationSeeder::class,      // Uses organizations
            EventSeeder::class,         // Uses all previous tables
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('📊 Complete dataset created with consistent relationships');
        $this->command->newLine();
        
        $this->command->info('🔑 LOGIN CREDENTIALS:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('Platform Admin: marcos@plataforma.com / password123');
        $this->command->info('Entity Admin (Turismo): ana.garcia@enteturismo.gov.ar / password123');
        $this->command->info('Entity Admin (Cultura): carlos.mendoza@cultura.gov.ar / password123');
        $this->command->info('All other users also have password: password123');
        $this->command->newLine();
        
        $this->command->info('📈 DATASET SUMMARY:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('• 2 Primary Entities + 4 Event Organizers');
        $this->command->info('• 7 Users with different roles and permissions');
        $this->command->info('• 5 Categories (3 Tourism + 2 Culture)');
        $this->command->info('• 5 Locations (3 Tourism + 2 Culture)');
        $this->command->info('• 5 Events with varied statuses for testing workflows');
        $this->command->info('• Complete entity-tenant isolation for multi-tenant testing');
        $this->command->newLine();
    }
}
