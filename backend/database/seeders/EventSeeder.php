<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get event statuses and types
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        $pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $multiSedeType = EventType::where('type_code', 'multi_sede')->first();
        $sedeUnicaType = EventType::where('type_code', 'sede_unica')->first();
        // Get organizations and their admins
        $enteDeturismo = Organization::where('slug', 'ente-turismo-tucuman')->first();
        $secretariaCultura = Organization::where('slug', 'secretaria-cultura')->first();

        // Get Entity Admins
        $entityAdminTurismo = User::where('email', 'ana.garcia@enteturismo.gov.ar')->first();
        $entityAdminCultura = User::where('email', 'carlos.mendoza@cultura.gov.ar')->first();

        // Get categories for each entity
        $categoriasTurismo = Category::where('entity_id', $enteDeturismo->id)->get();
        $categoriasCultura = Category::where('entity_id', $secretariaCultura->id)->get();

        // Get locations for each entity
        $ubicacionesTurismo = Location::where('entity_id', $enteDeturismo->id)->get();
        $ubicacionesCultura = Location::where('entity_id', $secretariaCultura->id)->get();

        // Events for Ente de Turismo
        $eventoTurismo1 = Event::create([
            'title' => 'Festival Gastronómico de Tucumán 2025',
            'description' => 'Gran festival que celebra la rica tradición culinaria tucumana con la participación de los mejores chefs locales, degustaciones de platos típicos, talleres de cocina y espectáculos musicales folclóricos.',
            'start_date' => Carbon::now()->addDays(30)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(32)->setHour(23)->setMinute(0),
            'status_id' => $publishedStatus->id,
            'type_id' => $multiSedeType->id,
            'cta_link' => 'https://festivalgatronomico.tuc.gov.ar/entradas',
            'cta_text' => 'Comprar Entradas',
            'featured_image' => 'https://example.com/images/festival-gastronomico.jpg',
            'is_featured' => true,
            'max_attendees' => 5000,
            'category_id' => $categoriasTurismo->where('slug', 'turismo-gastronomico')->first()?->id,
            'organization_id' => $enteDeturismo->id, // Add organization_id for Ente
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo->id,
        ]);

        // Associate locations with the first tourism event
        if ($ubicacionesTurismo->count() > 0) {
            $eventoTurismo1->locations()->attach([
                $ubicacionesTurismo->first()->id => ['location_specific_notes' => 'Zona gastronómica principal'],
                $ubicacionesTurismo->skip(1)->first()->id => ['location_specific_notes' => 'Escenario musical']
            ]);
        }

        $eventoTurismo2 = Event::create([
            'title' => 'Expedición Aventura - Cerro San Javier',
            'description' => 'Actividad de turismo aventura que incluye trekking, rappel y tirolesa en el hermoso Cerro San Javier. Una experiencia única para conectar con la naturaleza tucumana.',
            'start_date' => Carbon::now()->addDays(15)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(15)->setHour(17)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'type_id' => $sedeUnicaType->id,
            'cta_link' => 'https://aventuratucuman.com/inscripcion',
            'cta_text' => 'Inscribirse',
            'featured_image' => 'https://example.com/images/cerro-san-javier.jpg',
            'is_featured' => false,
            'max_attendees' => 50,
            'category_id' => $categoriasTurismo->where('slug', 'turismo-aventura')->first()?->id,
            'organization_id' => $enteDeturismo->id, // Add organization_id for Ente
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo->id,
        ]);

        // Associate location with the second tourism event
        if ($ubicacionesTurismo->count() > 2) {
            $eventoTurismo2->locations()->attach([
                $ubicacionesTurismo->skip(2)->first()->id => ['location_specific_notes' => 'Punto de encuentro']
            ]);
        }

        $eventoTurismo3 = Event::create([
            'title' => 'Ruta del Dulce Regional',
            'description' => 'Recorrido por las principales fincas productoras de dulces artesanales de Tucumán. Incluye degustación de dulce de cayote, mamón, batata y otros productos tradicionales.',
            'start_date' => Carbon::now()->addDays(45)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addDays(45)->setHour(18)->setMinute(0),
            'status_id' => $pendingInternalStatus->id,
            'type_id' => $sedeUnicaType->id,
            'featured_image' => 'https://example.com/images/ruta-dulce.jpg',
            'is_featured' => false,
            'max_attendees' => 30,
            'category_id' => $categoriasTurismo->where('slug', 'turismo-rural')->first()?->id,
            'organization_id' => $enteDeturismo->id, // Add organization_id for Ente
            'entity_id' => $enteDeturismo->id,
            'created_by' => $entityAdminTurismo->id,
        ]);

        // Associate location with the third tourism event
        if ($ubicacionesTurismo->count() > 0) {
            $eventoTurismo3->locations()->attach([
                $ubicacionesTurismo->first()->id => ['location_specific_notes' => 'Punto de salida del tour']
            ]);
        }

        // Events for Secretaría de Cultura - also add organization_id
        $eventoCultura1 = Event::create([
            'title' => 'Gala de Danza Folclórica Argentina',
            'description' => 'Espectacular gala que presenta los mejores exponentes de la danza folclórica argentina, con la participación de grupos locales y nacionales. Una celebración de nuestras tradiciones culturales.',
            'start_date' => Carbon::now()->addDays(20)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(20)->setHour(22)->setMinute(30),
            'status_id' => $publishedStatus->id,
            'type_id' => $sedeUnicaType->id,
            'cta_link' => 'https://cultura.tuc.gov.ar/gala-folklorica',
            'cta_text' => 'Reservar Lugar',
            'featured_image' => 'https://example.com/images/gala-folklorica.jpg',
            'is_featured' => true,
            'max_attendees' => 200,
            'category_id' => $categoriasCultura->where('slug', 'artes-escenicas')->first()?->id,
            'organization_id' => $secretariaCultura->id, // Add organization_id for Cultura
            'entity_id' => $secretariaCultura->id,
            'created_by' => $entityAdminCultura->id,
        ]);

        // Associate location with the first culture event
        if ($ubicacionesCultura->count() > 0) {
            $eventoCultura1->locations()->attach([
                $ubicacionesCultura->first()->id => ['location_specific_notes' => 'Salón principal']
            ]);
        }

        $eventoCultura2 = Event::create([
            'title' => 'Exposición: "Tesoros del Patrimonio Tucumano"',
            'description' => 'Muestra extraordinaria que reúne piezas históricas y arqueológicas que narran la rica historia de Tucumán desde la época precolombina hasta la actualidad.',
            'start_date' => Carbon::now()->addDays(10)->setHour(10)->setMinute(0),
            'end_date' => Carbon::now()->addDays(40)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id,
            'type_id' => $sedeUnicaType->id,
            'featured_image' => 'https://example.com/images/exposicion-patrimonio.jpg',
            'is_featured' => false,
            'max_attendees' => null, // Sin límite específico para exposición
            'category_id' => $categoriasCultura->where('slug', 'patrimonio-cultural')->first()?->id,
            'organization_id' => $secretariaCultura->id, // Add organization_id for Cultura
            'entity_id' => $secretariaCultura->id,
            'created_by' => $entityAdminCultura->id,
        ]);

        // Associate location with the second culture event
        if ($ubicacionesCultura->count() > 1) {
            $eventoCultura2->locations()->attach([
                $ubicacionesCultura->skip(1)->first()->id => ['location_specific_notes' => 'Salas 1, 2 y 3']
            ]);
        }

        // Events from External Organizations (require approval workflow)
        $sheratonHotel = Organization::where('name', 'LIKE', '%Sheraton%')->first();
        $laRural = Organization::where('name', 'LIKE', '%Rural%')->first();
        $centroVirla = Organization::where('name', 'LIKE', '%Virla%')->first();

        // Event from Sheraton Hotel (requires approval from Ente de Turismo)
        $eventoSheraton = Event::create([
            'title' => 'Cena de Gala San Valentín 2025',
            'description' => 'Elegante cena de gala para celebrar San Valentín en el hotel más exclusivo de Tucumán. Incluye menú gourmet de cinco tiempos, música en vivo y vista panorámica de la ciudad.',
            'start_date' => Carbon::now()->addDays(25)->setHour(20)->setMinute(0),
            'end_date' => Carbon::now()->addDays(25)->setHour(23)->setMinute(30),
            'status_id' => $pendingInternalStatus->id, // Requires approval from entity_admin
            'type_id' => $sedeUnicaType->id,
            'cta_link' => 'https://sheraton.com/tucuman/san-valentin',
            'cta_text' => 'Reservar Mesa',
            'featured_image' => 'https://example.com/images/cena-san-valentin.jpg',
            'is_featured' => false,
            'max_attendees' => 80,
            'organization_id' => $sheratonHotel->id, // External organization
            'entity_id' => $enteDeturismo->id, // Supervised by Ente de Turismo
            'created_by' => null, // Created by organization, not entity admin
            'category_id' => $categoriasTurismo->where('slug', 'turismo-gastronomico')->first()?->id,
        ]);

        // Event from La Rural (approved internally, ready for public approval)
        $eventoRural = Event::create([
            'title' => 'Feria Agropecuaria del Norte 2025',
            'description' => 'Gran feria que reúne a productores agropecuarios del norte argentino. Exposición de ganado, maquinaria agrícola, productos regionales y conferencias técnicas del sector.',
            'start_date' => Carbon::now()->addDays(50)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addDays(53)->setHour(18)->setMinute(0),
            'status_id' => $approvedInternalStatus->id, // Approved internally, pending publication
            'type_id' => $multiSedeType->id,
            'cta_link' => 'https://larural.org.ar/feria-norte',
            'cta_text' => 'Ver Cronograma',
            'featured_image' => 'https://example.com/images/feria-agropecuaria.jpg',
            'is_featured' => true,
            'max_attendees' => 2000,
            'organization_id' => $laRural->id, // External organization
            'entity_id' => $enteDeturismo->id, // Supervised by Ente de Turismo
            'created_by' => null, // Created by organization
            'category_id' => $categoriasTurismo->where('slug', 'turismo-rural')->first()?->id,
        ]);

        // Event from Centro Cultural Virla (published external event)
        $eventoVirla = Event::create([
            'title' => 'Muestra de Arte Contemporáneo Tucumano',
            'description' => 'Exhibición de obras de artistas contemporáneos tucumanos emergentes. Incluye pintura, escultura, fotografía y nuevos medios digitales.',
            'start_date' => Carbon::now()->addDays(12)->setHour(18)->setMinute(0),
            'end_date' => Carbon::now()->addDays(35)->setHour(21)->setMinute(0),
            'status_id' => $publishedStatus->id, // Already approved and published
            'type_id' => $sedeUnicaType->id,
            'cta_link' => 'https://centrovirla.org/arte-contemporaneo',
            'cta_text' => 'Más Información',
            'featured_image' => 'https://example.com/images/arte-contemporaneo.jpg',
            'is_featured' => false,
            'max_attendees' => null,
            'organization_id' => $centroVirla->id, // External organization
            'entity_id' => $secretariaCultura->id, // Supervised by Secretaría de Cultura
            'created_by' => null, // Created by organization
            'category_id' => $categoriasCultura->where('slug', 'patrimonio-cultural')->first()?->id,
        ]);

        $this->command->info('Events created successfully!');
        $this->command->info('- 3 events created for Ente de Turismo (Internal):');
        $this->command->info('  * Festival Gastronómico (Published)');
        $this->command->info('  * Expedición Aventura (Approved Internal)');
        $this->command->info('  * Ruta del Dulce (Pending Internal Approval)');
        $this->command->info('- 2 events created for Secretaría de Cultura (Internal):');
        $this->command->info('  * Gala de Danza Folclórica (Published)');
        $this->command->info('  * Exposición Patrimonio (Approved Internal)');
        $this->command->info('- 3 events created by External Organizations:');
        $this->command->info('  * Cena San Valentín - Sheraton (Pending Internal Approval)');
        $this->command->info('  * Feria Agropecuaria - La Rural (Approved Internal)');
        $this->command->info('  * Arte Contemporáneo - Centro Virla (Published)');
        $this->command->info('- Events differentiated by ownership for approval workflow testing');
        $this->command->info('- All events have proper category and location associations');
    }
}
