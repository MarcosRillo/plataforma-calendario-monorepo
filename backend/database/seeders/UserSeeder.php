<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get role IDs
        $platformAdminRole = UserRole::where('role_code', 'platform_admin')->first();
        $entityAdminRole = UserRole::where('role_code', 'entity_admin')->first();
        $organizerAdminRole = UserRole::where('role_code', 'organizer_admin')->first();
        $entityStaffRole = UserRole::where('role_code', 'entity_staff')->first();

        // Create Platform Admin
        $platformAdmin = User::create([
            'name' => 'Marcos Rillo Cabanne',
            'email' => 'marcos@plataforma.com',
            'role_id' => $platformAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Get organizations for associating users
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $secretariaCultura = Organization::where('slug', 'secretaria-cultura')->first();
        $sheraton = Organization::where('slug', 'sheraton-tucuman')->first();
        $laRural = Organization::where('slug', 'la-rural-tucuman')->first();
        $centroVirla = Organization::where('slug', 'centro-cultural-virla')->first();
        $teatroSanMartin = Organization::where('slug', 'teatro-san-martin')->first();

        // Create Entity Admins
        $entityAdminTurismo = User::create([
            'name' => 'Ana García',
            'email' => 'ana.garcia@enteturismo.gov.ar',
            'role_id' => $entityAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityAdminTurismo->organizations()->attach($enteDeturismo->id);

        $entityAdminCultura = User::create([
            'name' => 'Carlos Mendoza',
            'email' => 'carlos.mendoza@cultura.gov.ar',
            'role_id' => $entityAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityAdminCultura->organizations()->attach($secretariaCultura->id);

        // Create Organizer Admins
        $organizerSheraton = User::create([
            'name' => 'María Rodriguez',
            'email' => 'maria.rodriguez@sheraton.com',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerSheraton->organizations()->attach($sheraton->id);

        $organizerLaRural = User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan.perez@larural.com.ar',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerLaRural->organizations()->attach($laRural->id);

        $organizerVirla = User::create([
            'name' => 'Laura Fernández',
            'email' => 'laura.fernandez@centrovirla.gov.ar',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerVirla->organizations()->attach($centroVirla->id);

        $organizerTeatro = User::create([
            'name' => 'Roberto Silva',
            'email' => 'roberto.silva@teatrosanmartin.gov.ar',
            'role_id' => $organizerAdminRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $organizerTeatro->organizations()->attach($teatroSanMartin->id);

        // Create some Entity Staff members
        $entityStaffTurismo = User::create([
            'name' => 'Patricia López',
            'email' => 'patricia.lopez@enteturismo.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityStaffTurismo->organizations()->attach($enteDeturismo->id);

        $entityStaffCultura = User::create([
            'name' => 'Diego Martinez',
            'email' => 'diego.martinez@cultura.gov.ar',
            'role_id' => $entityStaffRole->id,
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $entityStaffCultura->organizations()->attach($secretariaCultura->id);

        $this->command->info('Users created successfully!');
        $this->command->info('- 1 Platform Admin created');
        $this->command->info('- 2 Entity Admins created');
        $this->command->info('- 4 Organizer Admins created');
        $this->command->info('- 2 Entity Staff created');
        $this->command->info('- All users have password: password123');
    }
}
