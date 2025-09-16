<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'role_code' => 'platform_admin',
                'role_name' => 'Platform Administrator',
                'description' => 'Full access to platform configuration and all organizations',
                'permissions' => json_encode([
                    'manage_platform',
                    'manage_organizations',
                    'manage_users',
                    'view_all_events'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'role_code' => 'entity_admin',
                'role_name' => 'Entity Administrator',
                'description' => 'Administrator of a primary entity (government, municipality)',
                'permissions' => json_encode([
                    'manage_entity_events',
                    'approve_events',
                    'manage_entity_users',
                    'view_analytics'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'role_code' => 'entity_staff',
                'role_name' => 'Entity Staff',
                'description' => 'Staff member of a primary entity with limited permissions',
                'permissions' => json_encode([
                    'create_events',
                    'edit_own_events',
                    'view_entity_events'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'role_code' => 'organizer_admin',
                'role_name' => 'Event Organizer',
                'description' => 'External organizer who can create and manage their own events',
                'permissions' => json_encode([
                    'create_events',
                    'manage_own_events',
                    'view_own_analytics'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('user_roles')->insert($roles);
    }
}
