<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Organization;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear una organización de prueba
        $organization = Organization::firstOrCreate(
            ['name' => 'Organización de Prueba'],
            [
                'description' => 'Organización creada para pruebas del sistema',
                'email' => 'test@organization.com',
                'phone' => '+1234567890',
                'website' => 'https://test-org.com',
                'address' => 'Calle Prueba 123',
                'city' => 'Ciudad Prueba',
                'state' => 'Estado Prueba',
                'country' => 'País Prueba',
                'postal_code' => '12345',
                'is_active' => true,
            ]
        );

        // Crear un usuario de prueba
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Usuario de Prueba',
                'password' => Hash::make('password'),
                'role_id' => 2, // entity_admin
                'email_verified_at' => now(),
            ]
        );

        // Asociar el usuario con la organización
        if (!$user->organizations()->where('organization_id', $organization->id)->exists()) {
            $user->organizations()->attach($organization->id);
        }

        // Crear categorías de prueba
        $categories = [
            ['name' => 'Conferencias', 'description' => 'Eventos de conferencias y charlas'],
            ['name' => 'Talleres', 'description' => 'Talleres prácticos y educativos'],
            ['name' => 'Reuniones', 'description' => 'Reuniones corporativas y de equipo'],
            ['name' => 'Eventos Sociales', 'description' => 'Eventos sociales y de networking'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                [
                    'name' => $categoryData['name'],
                    'entity_id' => $organization->id
                ],
                [
                    'description' => $categoryData['description'],
                    'color' => '#' . substr(md5($categoryData['name']), 0, 6),
                    'is_active' => true,
                ]
            );
        }

        // Crear ubicaciones de prueba
        $locations = [
            [
                'name' => 'Sala de Conferencias Principal',
                'address' => 'Av. Principal 100',
                'city' => 'Ciudad Prueba',
                'description' => 'Sala principal para conferencias y eventos grandes',
            ],
            [
                'name' => 'Aula de Capacitación',
                'address' => 'Calle Secundaria 50',
                'city' => 'Ciudad Prueba',
                'description' => 'Aula equipada para talleres y capacitaciones',
            ],
            [
                'name' => 'Salón de Reuniones',
                'address' => 'Plaza Central 25',
                'city' => 'Ciudad Prueba',
                'description' => 'Salón íntimo para reuniones ejecutivas',
            ],
        ];

        foreach ($locations as $locationData) {
            Location::firstOrCreate(
                [
                    'name' => $locationData['name'],
                    'entity_id' => $organization->id
                ],
                [
                    'address' => $locationData['address'],
                    'city' => $locationData['city'],
                    'state' => 'Estado Prueba',
                    'country' => 'País Prueba',
                    'postal_code' => '12345',
                    'description' => $locationData['description'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Test data seeded successfully!');
        $this->command->info("User: test@example.com / password");
        $this->command->info("Organization: {$organization->name} (ID: {$organization->id})");
        $this->command->info("Categories created: " . Category::where('entity_id', $organization->id)->count());
        $this->command->info("Locations created: " . Location::where('entity_id', $organization->id)->count());
    }
}
