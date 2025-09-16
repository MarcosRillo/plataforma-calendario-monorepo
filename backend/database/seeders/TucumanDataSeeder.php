<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Organization;
use App\Models\OrganizationType;
use App\Models\OrganizationStatus;
use App\Models\Category;
use App\Models\Location;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;

class TucumanDataSeeder extends Seeder
{
    /**
     * Seed realistic Tucumán tourism data for comprehensive 3NF structure testing.
     */
    public function run(): void
    {
        $this->command->info('🚀 Creating realistic Tucumán tourism data...');
        
        // Get required foreign keys
        $roles = $this->getRoles();
        $orgTypes = $this->getOrganizationTypes();
        $orgStatuses = $this->getOrganizationStatuses();
        $eventStatuses = $this->getEventStatuses();
        $eventTypes = $this->getEventTypes();
        
        // 1. Create Ente de Turismo de Tucumán (Primary Entity)
        $this->command->info('1️⃣ Creating Ente de Turismo de Tucumán...');
        $enteTurismo = $this->createEnteTurismo($orgTypes, $orgStatuses);
        
        // 2. Create realistic users with proper role hierarchy
        $this->command->info('2️⃣ Creating users with role hierarchy...');
        $users = $this->createUsers($roles, $enteTurismo);
        
        // 3. Create event organizer organizations
        $this->command->info('3️⃣ Creating event organizer organizations...');
        $organizers = $this->createEventOrganizers($orgTypes, $orgStatuses);
        
        // 4. Create Tucumán tourism categories
        $this->command->info('4️⃣ Creating tourism categories...');
        $categories = $this->createTourismCategories($enteTurismo);
        
        // 5. Create iconic Tucumán locations
        $this->command->info('5️⃣ Creating iconic locations...');
        $locations = $this->createIconicLocations($enteTurismo, $organizers);
        
        // 6. Create demo events with complete workflow
        $this->command->info('6️⃣ Creating demo events with workflow...');
        $this->createDemoEvents($enteTurismo, $users, $categories, $locations, $eventStatuses, $eventTypes);
        
        $this->showSummary($enteTurismo);
    }
    
    private function getRoles(): array
    {
        return [
            'platform_admin' => UserRole::where('role_code', 'platform_admin')->first(),
            'entity_admin' => UserRole::where('role_code', 'entity_admin')->first(),
            'entity_staff' => UserRole::where('role_code', 'entity_staff')->first(),
            'organizer_admin' => UserRole::where('role_code', 'organizer_admin')->first(),
        ];
    }
    
    private function getOrganizationTypes(): array
    {
        return [
            'primary_entity' => OrganizationType::where('type_code', 'primary_entity')->first(),
            'event_organizer' => OrganizationType::where('type_code', 'event_organizer')->first(),
        ];
    }
    
    private function getOrganizationStatuses(): array
    {
        return [
            'active' => OrganizationStatus::where('status_code', 'active')->first(),
        ];
    }
    
    private function getEventStatuses(): array
    {
        return [
            'draft' => EventStatus::where('status_code', 'draft')->first(),
            'pending_internal_approval' => EventStatus::where('status_code', 'pending_internal_approval')->first(),
            'approved_internal' => EventStatus::where('status_code', 'approved_internal')->first(),
            'pending_public_approval' => EventStatus::where('status_code', 'pending_public_approval')->first(),
            'published' => EventStatus::where('status_code', 'published')->first(),
        ];
    }
    
    private function getEventTypes(): array
    {
        return [
            'sede_unica' => EventType::where('type_code', 'sede_unica')->first(),
            'multi_sede' => EventType::where('type_code', 'multi_sede')->first(),
        ];
    }
    
    private function createEnteTurismo($orgTypes, $orgStatuses): Organization
    {
        return Organization::firstOrCreate([
            'name' => 'Ente de Turismo de Tucumán'
        ], [
            'slug' => 'ente-turismo-tucuman',
            'description' => 'Ente Autárquico Tucumán Turismo - Organismo oficial encargado de promover y desarrollar el turismo en la provincia de Tucumán',
            'cuit' => '30-99999999-9',
            'email' => 'info@tucumanturismo.gob.ar',
            'phone' => '+54 381 422-3199',
            'website' => 'https://www.tucumanturismo.gob.ar',
            'address' => '24 de Septiembre 484',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'type_id' => $orgTypes['primary_entity']->id,
            'status_id' => $orgStatuses['active']->id,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
    
    private function createUsers($roles, $enteTurismo): array
    {
        $users = [];
        
        // Platform Admin del Ente
        $users['platform_admin'] = User::firstOrCreate([
            'email' => 'admin@tucumanturismo.gob.ar'
        ], [
            'name' => 'María Elena Rodríguez',
            'password' => Hash::make('TucumanTurismo2025!'),
            'role_id' => $roles['platform_admin']->id,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Entity Admin del Ente
        $users['entity_admin'] = User::firstOrCreate([
            'email' => 'director@tucumanturismo.gob.ar'
        ], [
            'name' => 'Carlos Alberto Mansilla',
            'password' => Hash::make('DirectorTurismo2025!'),
            'role_id' => $roles['entity_admin']->id,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Entity Staff del Ente
        $users['entity_staff'] = User::firstOrCreate([
            'email' => 'eventos@tucumanturismo.gob.ar'
        ], [
            'name' => 'Ana Sofía Herrera',
            'password' => Hash::make('EventosTurismo2025!'),
            'role_id' => $roles['entity_staff']->id,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Organizer Admin (Hotel Sheraton)
        $users['organizer_admin'] = User::firstOrCreate([
            'email' => 'eventos@sheraton-tucuman.com'
        ], [
            'name' => 'Roberto Fernández',
            'password' => Hash::make('SheratonEventos2025!'),
            'role_id' => $roles['organizer_admin']->id,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Associate all users with Ente de Turismo
        foreach ($users as $user) {
            if (!$user->organizations()->where('organization_id', $enteTurismo->id)->exists()) {
                $user->organizations()->attach($enteTurismo->id);
            }
        }
        
        return $users;
    }
    
    private function createEventOrganizers($orgTypes, $orgStatuses): array
    {
        $organizers = [];
        
        // Sheraton Tucumán Hotel
        $organizers['sheraton'] = Organization::firstOrCreate([
            'name' => 'Sheraton Tucumán Hotel'
        ], [
            'slug' => 'sheraton-tucuman-hotel',
            'description' => 'Hotel 5 estrellas en el corazón de San Miguel de Tucumán, ideal para eventos corporativos y sociales',
            'cuit' => '30-12345678-9',
            'email' => 'eventos@sheraton-tucuman.com',
            'phone' => '+54 381 310-5000',
            'website' => 'https://www.marriott.com/hotels/travel/tuctw-sheraton-tucuman-hotel',
            'address' => 'Soldati 380',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'type_id' => $orgTypes['event_organizer']->id,
            'status_id' => $orgStatuses['active']->id,
            'is_active' => true,
        ]);
        
        // Teatro San Martín
        $organizers['teatro'] = Organization::firstOrCreate([
            'name' => 'Teatro San Martín Tucumán'
        ], [
            'slug' => 'teatro-san-martin-tucuman',
            'description' => 'Teatro histórico de Tucumán, escenario de los más importantes espectáculos culturales de la provincia',
            'cuit' => '30-87654321-9',
            'email' => 'info@teatrosanmartin.gob.ar',
            'phone' => '+54 381 424-7824',
            'website' => 'https://www.teatrosanmartin.gob.ar',
            'address' => 'Av. Sarmiento 450',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'type_id' => $orgTypes['event_organizer']->id,
            'status_id' => $orgStatuses['active']->id,
            'is_active' => true,
        ]);
        
        // Museo Casa Histórica
        $organizers['museo'] = Organization::firstOrCreate([
            'name' => 'Museo Casa Histórica de la Independencia'
        ], [
            'slug' => 'museo-casa-historica',
            'description' => 'Casa donde se declaró la Independencia Argentina en 1816, sede de eventos históricos y culturales',
            'cuit' => '30-11223344-9',
            'email' => 'museo@casahistorica.gob.ar',
            'phone' => '+54 381 431-0826',
            'website' => 'https://www.casahistorica.gob.ar',
            'address' => 'Congreso de Tucumán 151',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'type_id' => $orgTypes['event_organizer']->id,
            'status_id' => $orgStatuses['active']->id,
            'is_active' => true,
        ]);
        
        return $organizers;
    }
    
    private function createTourismCategories($enteTurismo): array
    {
        $categories = [
            [
                'name' => 'Gastronomía Tucumana',
                'slug' => 'gastronomia-tucumana',
                'description' => 'Eventos gastronómicos que destacan la rica tradición culinaria de Tucumán, incluyendo empanadas, locro, humita y dulces regionales',
                'color' => '#FF6B35',
            ],
            [
                'name' => 'Cultura y Tradiciones',
                'slug' => 'cultura-tradiciones',
                'description' => 'Celebraciones culturales, festivales folclóricos, exposiciones artísticas y eventos que preservan las tradiciones tucumanas',
                'color' => '#4ECDC4',
            ],
            [
                'name' => 'Turismo Aventura',
                'slug' => 'turismo-aventura',
                'description' => 'Actividades de turismo aventura en los cerros, quebradas y yungas de Tucumán, incluyendo trekking, rappel y tirolesa',
                'color' => '#95E1D3',
            ],
            [
                'name' => 'Eventos Corporativos',
                'slug' => 'eventos-corporativos',
                'description' => 'Congresos, seminarios, capacitaciones y eventos empresariales en la provincia de Tucumán',
                'color' => '#45B7D1',
            ],
            [
                'name' => 'Folclore y Música',
                'slug' => 'folclore-musica',
                'description' => 'Peñas folclóricas, festivales de música tradicional y eventos que celebran el patrimonio musical de Tucumán',
                'color' => '#F9CA24',
            ],
        ];
        
        $createdCategories = [];
        foreach ($categories as $categoryData) {
            $createdCategories[$categoryData['slug']] = Category::firstOrCreate([
                'name' => $categoryData['name'],
                'entity_id' => $enteTurismo->id
            ], array_merge($categoryData, [
                'entity_id' => $enteTurismo->id,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
        
        return $createdCategories;
    }
    
    private function createIconicLocations($enteTurismo, $organizers): array
    {
        $locations = [];
        
        // Plaza Independencia
        $locations['plaza'] = Location::firstOrCreate([
            'name' => 'Plaza Independencia',
            'entity_id' => $enteTurismo->id
        ], [
            'address' => 'Plaza Independencia',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'description' => 'Plaza principal de San Miguel de Tucumán, corazón histórico y social de la ciudad',
            'capacity' => 2000,
            'latitude' => -26.8241,
            'longitude' => -65.2226,
            'is_active' => true,
        ]);
        
        // Casa de Gobierno
        $locations['casa_gobierno'] = Location::firstOrCreate([
            'name' => 'Casa de Gobierno de Tucumán',
            'entity_id' => $enteTurismo->id
        ], [
            'address' => '25 de Mayo 90',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'description' => 'Sede del gobierno provincial, edificio histórico para eventos institucionales',
            'capacity' => 300,
            'latitude' => -26.8241,
            'longitude' => -65.2226,
            'is_active' => true,
        ]);
        
        // Teatro San Martín
        $locations['teatro'] = Location::firstOrCreate([
            'name' => 'Teatro San Martín',
            'entity_id' => $enteTurismo->id
        ], [
            'address' => 'Av. Sarmiento 450',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'description' => 'Teatro histórico de Tucumán, principal escenario cultural de la provincia',
            'capacity' => 800,
            'latitude' => -26.8241,
            'longitude' => -65.2226,
            'is_active' => true,
        ]);
        
        // Hotel Sheraton
        $locations['sheraton'] = Location::firstOrCreate([
            'name' => 'Sheraton Tucumán Hotel',
            'entity_id' => $enteTurismo->id
        ], [
            'address' => 'Soldati 380',
            'city' => 'San Miguel de Tucumán',
            'state' => 'Tucumán',
            'country' => 'Argentina',
            'postal_code' => 'T4000',
            'description' => 'Hotel 5 estrellas con modernas instalaciones para eventos corporativos y sociales',
            'capacity' => 500,
            'latitude' => -26.8241,
            'longitude' => -65.2226,
            'is_active' => true,
        ]);
        
        return $locations;
    }
    
    private function createDemoEvents($enteTurismo, $users, $categories, $locations, $eventStatuses, $eventTypes): void
    {
        // 1. Festival de la Empanada Tucumana (PUBLISHED)
        $evento1 = Event::create([
            'title' => 'Festival de la Empanada Tucumana 2025',
            'description' => 'El festival gastronómico más importante de Tucumán celebra la empanada, patrimonio culinario de la provincia. Durante tres días, los mejores empanaderías y restaurantes tucumanos ofrecerán degustaciones, talleres de preparación y concursos. Habrá espectáculos de folclore en vivo, artesanías regionales y actividades para toda la familia. Una celebración imperdible de nuestra identidad gastronómica.',
            'start_date' => Carbon::now()->addDays(45)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(47)->setHour(23)->setMinute(0),
            'status_id' => $eventStatuses['published']->id,
            'type_id' => $eventTypes['multi_sede']->id,
            'cta_link' => 'https://www.tucumanturismo.gob.ar/festival-empanada-2025',
            'cta_text' => 'Más Información',
            'featured_image' => 'https://example.com/images/festival-empanada.jpg',
            'is_featured' => true,
            'max_attendees' => 8000,
            'category_id' => $categories['gastronomia-tucumana']->id,
            'entity_id' => $enteTurismo->id,
            'created_by' => $users['entity_admin']->id,
            'approved_by' => $users['platform_admin']->id,
            'approved_at' => now(),
            'approval_comments' => 'Evento aprobado para promoción turística provincial',
        ]);
        
        // Associate multiple locations
        $evento1->locations()->attach([
            $locations['plaza']->id => ['location_specific_notes' => 'Escenario principal y stands gastronómicos'],
            $locations['casa_gobierno']->id => ['location_specific_notes' => 'Ceremonia inaugural oficial'],
        ]);
        
        // 2. Noche de los Museos (PENDING_PUBLIC_APPROVAL)
        $evento2 = Event::create([
            'title' => 'Noche de los Museos Tucumán 2025',
            'description' => 'Una noche mágica donde los principales museos de la ciudad abren sus puertas gratuitamente con actividades especiales. Los visitantes podrán recorrer exposiciones únicas, participar en talleres interactivos, disfrutar de espectáculos artísticos y conocer la rica historia y cultura tucumana. Incluye transporte gratuito entre museos y guías especializados.',
            'start_date' => Carbon::now()->addDays(30)->setHour(19)->setMinute(0),
            'end_date' => Carbon::now()->addDays(31)->setHour(2)->setMinute(0),
            'status_id' => $eventStatuses['pending_public_approval']->id,
            'type_id' => $eventTypes['multi_sede']->id,
            'virtual_link' => 'https://www.tucumanturismo.gob.ar/noche-museos-virtual',
            'featured_image' => 'https://example.com/images/noche-museos.jpg',
            'is_featured' => false,
            'max_attendees' => 3000,
            'category_id' => $categories['cultura-tradiciones']->id,
            'entity_id' => $enteTurismo->id,
            'created_by' => $users['entity_staff']->id,
            'approved_by' => $users['entity_admin']->id,
            'approved_at' => now()->subDays(2),
            'approval_comments' => 'Excelente propuesta cultural, listo para aprobación pública',
        ]);
        
        // 3. Congreso de Turismo Regional (DRAFT)
        $evento3 = Event::create([
            'title' => 'VI Congreso Regional de Turismo Sustentable',
            'description' => 'Congreso académico y profesional que reúne a expertos en turismo sustentable del NOA para analizar tendencias, compartir experiencias y generar estrategias de desarrollo turístico responsable. Incluye conferencias magistrales, paneles de discusión, workshops prácticos y networking profesional.',
            'start_date' => Carbon::now()->addDays(60)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(62)->setHour(18)->setMinute(0),
            'status_id' => $eventStatuses['draft']->id,
            'type_id' => $eventTypes['sede_unica']->id,
            'cta_link' => 'https://www.tucumanturismo.gob.ar/congreso-turismo-2025/inscripcion',
            'cta_text' => 'Inscripción Profesional',
            'max_attendees' => 200,
            'category_id' => $categories['eventos-corporativos']->id,
            'entity_id' => $enteTurismo->id,
            'created_by' => $users['entity_staff']->id,
        ]);
        
        $evento3->locations()->attach([
            $locations['sheraton']->id => ['location_specific_notes' => 'Salones de conferencias y networking']
        ]);
        
        // 4. Peña Folklórica (APPROVED_INTERNAL)
        $evento4 = Event::create([
            'title' => 'Gran Peña Folklórica "Canto a Tucumán"',
            'description' => 'Noche de auténtico folclore tucumano con la participación de los mejores conjuntos locales. Una celebración de nuestras raíces musicales con chacareras, zambas, escondidos y gatos, acompañados de comidas típicas y vino patero. Un encuentro familiar que mantiene viva la tradición folklórica de nuestra tierra.',
            'start_date' => Carbon::now()->addDays(25)->setHour(21)->setMinute(0),
            'end_date' => Carbon::now()->addDays(26)->setHour(3)->setMinute(0),
            'status_id' => $eventStatuses['approved_internal']->id,
            'type_id' => $eventTypes['sede_unica']->id,
            'cta_link' => 'https://www.tucumanturismo.gob.ar/pena-folklorica',
            'cta_text' => 'Reservar Mesa',
            'featured_image' => 'https://example.com/images/pena-folklorica.jpg',
            'is_featured' => true,
            'max_attendees' => 400,
            'category_id' => $categories['folclore-musica']->id,
            'entity_id' => $enteTurismo->id,
            'created_by' => $users['entity_staff']->id,
            'approved_by' => $users['entity_admin']->id,
            'approved_at' => now()->subDay(),
            'approval_comments' => 'Evento cultural aprobado para promoción interna',
        ]);
        
        $evento4->locations()->attach([
            $locations['teatro']->id => ['location_specific_notes' => 'Escenario principal con ambientación tradicional']
        ]);
    }
    
    private function showSummary($enteTurismo): void
    {
        $this->command->info('');
        $this->command->info('✅ TUCUMÁN TOURISM DATA CREATED SUCCESSFULLY!');
        $this->command->info('================================================');
        $this->command->info("📍 Primary Entity: {$enteTurismo->name} (ID: {$enteTurismo->id})");
        $this->command->info('👥 Users: ' . User::count() . ' total');
        $this->command->info('🏢 Organizations: ' . Organization::count() . ' total');
        $this->command->info('🏷️  Categories: ' . Category::where('entity_id', $enteTurismo->id)->count() . ' tourism categories');
        $this->command->info('📍 Locations: ' . Location::where('entity_id', $enteTurismo->id)->count() . ' iconic locations');
        $this->command->info('🎫 Events: ' . Event::where('entity_id', $enteTurismo->id)->count() . ' demo events');
        $this->command->info('');
        $this->command->info('🔑 LOGIN CREDENTIALS:');
        $this->command->info('Platform Admin: admin@tucumanturismo.gob.ar / TucumanTurismo2025!');
        $this->command->info('Entity Admin: director@tucumanturismo.gob.ar / DirectorTurismo2025!');
        $this->command->info('Entity Staff: eventos@tucumanturismo.gob.ar / EventosTurismo2025!');
        $this->command->info('Organizer Admin: eventos@sheraton-tucuman.com / SheratonEventos2025!');
        $this->command->info('');
        $this->command->info('🚀 READY FOR TESTING:');
        $this->command->info('curl http://localhost:8000/api/v1/public/events');
        $this->command->info('curl http://localhost:8000/api/v1/public/categories');
        $this->command->info('http://localhost:3000/calendar');
    }
}
