<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Organization;
use App\Models\Location;
use App\Models\Category;
use App\Models\Event;
use Illuminate\Support\Facades\Hash;

class CompleteTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Crear organizaciones si no existen
        $org1 = Organization::firstOrCreate([
            'name' => 'Universidad Ejemplo'
        ], [
            'description' => 'Universidad de ejemplo para pruebas',
            'website' => 'https://universidad-ejemplo.edu',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $org2 = Organization::firstOrCreate([
            'name' => 'Instituto Tecnológico'
        ], [
            'description' => 'Instituto tecnológico para pruebas',
            'website' => 'https://instituto-tech.edu',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Crear usuario de prueba si no existe
        $user = User::firstOrCreate([
            'email' => 'admin@test.com'
        ], [
            'name' => 'Admin Usuario',
            'password' => Hash::make('password'),
            'role_id' => 1, // platform_admin
            'email_verified_at' => now(),
        ]);

        // 3. Asociar usuario con organización
        if (!$user->organizations()->where('organization_id', $org1->id)->exists()) {
            $user->organizations()->attach($org1->id);
        }

        // 4. Crear ubicaciones para la organización
        $locations = [
            [
                'name' => 'Aula Magna',
                'address' => 'Campus Principal, Edificio A',
                'capacity' => 500,
                'entity_id' => $org1->id,
            ],
            [
                'name' => 'Laboratorio de Computación',
                'address' => 'Campus Principal, Edificio B',
                'capacity' => 30,
                'entity_id' => $org1->id,
            ],
            [
                'name' => 'Auditorio Central',
                'address' => 'Campus Principal, Edificio C',
                'capacity' => 200,
                'entity_id' => $org1->id,
            ],
        ];

        foreach ($locations as $locationData) {
            Location::firstOrCreate([
                'name' => $locationData['name'],
                'entity_id' => $locationData['entity_id']
            ], $locationData);
        }

        // 5. Crear categorías para la organización
        $categories = [
            [
                'name' => 'Conferencias',
                'description' => 'Conferencias académicas y profesionales',
                'entity_id' => $org1->id,
            ],
            [
                'name' => 'Talleres',
                'description' => 'Talleres prácticos y workshops',
                'entity_id' => $org1->id,
            ],
            [
                'name' => 'Seminarios',
                'description' => 'Seminarios especializados',
                'entity_id' => $org1->id,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate([
                'name' => $categoryData['name'],
                'entity_id' => $categoryData['entity_id']
            ], $categoryData);
        }

        $this->command->info('✅ Datos de prueba creados exitosamente:');
        $this->command->info('- Organizaciones: ' . Organization::count());
        $this->command->info('- Usuarios: ' . User::count());
        $this->command->info('- Ubicaciones: ' . Location::count());
        $this->command->info('- Categorías: ' . Category::count());
        $this->command->info('- Usuario admin@test.com asociado a organización: ' . $user->organizations()->count());
    }
}
