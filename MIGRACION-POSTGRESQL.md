# MIGRACIÓN MySQL → PostgreSQL + 3NF

**Plataforma Multi-Tenant Eventos Turísticos - Tucumán**  
**Estrategia:** Migración directa sin coexistencia de DBs

---

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Migrar de MySQL a PostgreSQL con estructura 3NF sin enums para escalabilidad comercial

**Estado Actual:** 
- ✅ Backend Laravel con 9 endpoints públicos funcionando
- ✅ Frontend Next.js 15 limpio de código mock
- ✅ Estructura MySQL mapeada y analizada completamente

**Método:** Migración directa (down MySQL → up PostgreSQL) aprovechando datos de prueba

**Timeline:** 2-3 días de desarrollo + testing

---

## 🎯 OBJETIVOS TÉCNICOS

### Eliminar Limitaciones Actuales
- [ ] 5 ENUMs rígidos → 5 tablas lookup flexibles
- [ ] Campos de apariencia duplicados → tabla normalizada
- [ ] Estructura hardcodeada → configuración dinámica

### Beneficios Comerciales
- [ ] Escalable para múltiples provincias
- [ ] Modificaciones sin ALTER TABLE
- [ ] Performance superior PostgreSQL
- [ ] Estructura empresarial profesional

---

## 📊 ANÁLISIS DE ESTRUCTURA ACTUAL

### 5 ENUMs Críticos Identificados
```sql
-- ANTES (ENUMs rígidos)
users.role → 4 valores hardcodeados
organizations.status → 3 valores hardcodeados  
organizations.type → 2 valores hardcodeados
events.status → 8 valores hardcodeados (CRÍTICO para workflow)
events.type → 2 valores hardcodeados

-- DESPUÉS (Tablas lookup flexibles)
user_roles, organization_statuses, organization_types, event_statuses, event_types
```

### Problemas de Normalización
```sql
-- Campos duplicados de apariencia
organizations: color_primary, color_secondary, color_background, color_text, logo_url, banner_url
→ Normalizar en appearance_themes table

-- Metadata JSON dispersa
events.approval_history, locations.additional_info, event_location.location_metadata
→ Considerar estructurar en event_approval_logs
```

---

## 🚀 PLAN DE MIGRACIÓN - 3 FASES

## FASE 1: INFRAESTRUCTURA BASE
**Objetivo:** Cambiar motor de DB manteniendo funcionalidad actual

### 1.1 Docker Configuration
- [ ] **Modificar docker-compose.dev.yml**
  ```yaml
  # Reemplazar MySQL service con PostgreSQL
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: eventos_tucuman
      POSTGRES_USER: eventos_user
      POSTGRES_PASSWORD: eventos_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  ```

- [ ] **Actualizar variables .env**
  ```env
  DB_CONNECTION=pgsql
  DB_HOST=localhost
  DB_PORT=5432
  DB_DATABASE=eventos_tucuman
  DB_USERNAME=eventos_user
  DB_PASSWORD=eventos_pass
  ```

### 1.2 Comandos de Migración
- [ ] **Shutdown servicios actuales**
  ```bash
  docker-compose -f docker-compose.dev.yml down
  ```

- [ ] **Limpiar volúmenes MySQL (IRREVERSIBLE)**
  ```bash
  docker volume prune
  # Confirmar eliminación de mysql_data volume
  ```

- [ ] **Levantar PostgreSQL**
  ```bash
  docker-compose -f docker-compose.dev.yml up -d
  ```

- [ ] **Verificar conectividad**
  ```bash
  docker exec -it [postgres_container] psql -U eventos_user -d eventos_tucuman
  ```

### 1.3 Laravel Configuration
- [ ] **Instalar driver PostgreSQL**
  ```bash
  # Ya incluido en Laravel, verificar composer.json
  composer require --dev doctrine/dbal
  ```

- [ ] **Test de conexión**
  ```bash
  cd backend && php artisan tinker
  # DB::connection()->getPdo();
  ```

**CHECKPOINT FASE 1:** PostgreSQL funcionando, Laravel conectado

---

## FASE 2: ESTRUCTURA 3NF SIN ENUMS
**Objetivo:** Crear estructura normalizada con tablas lookup

### 2.1 Crear Tablas Lookup (5 críticas)

- [ ] **Migration: CreateUserRolesTable**
  ```php
  Schema::create('user_roles', function (Blueprint $table) {
      $table->id();
      $table->string('role_code', 50)->unique();
      $table->string('role_name', 100);
      $table->text('description')->nullable();
      $table->json('permissions')->nullable();
      $table->timestamps();
  });
  ```

- [ ] **Migration: CreateOrganizationStatusesTable**
  ```php
  Schema::create('organization_statuses', function (Blueprint $table) {
      $table->id();
      $table->string('status_code', 50)->unique();
      $table->string('status_name', 100);
      $table->text('description')->nullable();
      $table->boolean('can_create_events')->default(false);
      $table->timestamps();
  });
  ```

- [ ] **Migration: CreateOrganizationTypesTable**
  ```php
  Schema::create('organization_types', function (Blueprint $table) {
      $table->id();
      $table->string('type_code', 50)->unique();
      $table->string('type_name', 100);
      $table->text('description')->nullable();
      $table->integer('hierarchy_level')->default(0);
      $table->timestamps();
  });
  ```

- [ ] **Migration: CreateEventStatusesTable**
  ```php
  Schema::create('event_statuses', function (Blueprint $table) {
      $table->id();
      $table->string('status_code', 50)->unique();
      $table->string('status_name', 100);
      $table->text('description')->nullable();
      $table->boolean('is_public')->default(false);
      $table->integer('workflow_order')->nullable();
      $table->timestamps();
  });
  ```

- [ ] **Migration: CreateEventTypesTable**
  ```php
  Schema::create('event_types', function (Blueprint $table) {
      $table->id();
      $table->string('type_code', 50)->unique();
      $table->string('type_name', 100);
      $table->text('description')->nullable();
      $table->boolean('allows_multiple_locations')->default(false);
      $table->timestamps();
  });
  ```

### 2.2 Normalizar Campos de Apariencia

- [ ] **Migration: CreateAppearanceThemesTable**
  ```php
  Schema::create('appearance_themes', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->string('theme_name', 100)->nullable();
      $table->string('primary_color', 7)->nullable();
      $table->string('secondary_color', 7)->nullable();
      $table->string('background_color', 7)->nullable();
      $table->string('text_color', 7)->nullable();
      $table->text('logo_url')->nullable();
      $table->text('banner_url')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();
  });
  ```

### 2.3 Modificar Tablas Principales

- [ ] **Migration: ModifyUsersTable**
  ```php
  // Reemplazar enum role con foreign key
  $table->dropColumn('role');
  $table->foreignId('role_id')->constrained('user_roles');
  ```

- [ ] **Migration: ModifyOrganizationsTable**
  ```php
  // Reemplazar enums con foreign keys
  $table->dropColumn(['status', 'type']);
  $table->dropColumn(['color_primary', 'color_secondary', 'color_background', 'color_text', 'logo_url', 'banner_url']);
  $table->foreignId('status_id')->constrained('organization_statuses');
  $table->foreignId('type_id')->constrained('organization_types');
  ```

- [ ] **Migration: ModifyEventsTable**
  ```php
  // Reemplazar enums con foreign keys
  $table->dropColumn(['status', 'type']);
  $table->foreignId('status_id')->constrained('event_statuses');
  $table->foreignId('type_id')->constrained('event_types');
  ```

### 2.4 Seeders para Datos Iniciales

- [ ] **UserRolesSeeder**
  ```php
  // platform_admin, entity_admin, entity_staff, organizer_admin
  ```

- [ ] **OrganizationStatusesSeeder**
  ```php
  // active, suspended, pending
  ```

- [ ] **OrganizationTypesSeeder**
  ```php
  // primary_entity, event_organizer
  ```

- [ ] **EventStatusesSeeder**
  ```php
  // draft, pending_internal_approval, approved_internal, 
  // pending_public_approval, published, requires_changes, rejected, cancelled
  ```

- [ ] **EventTypesSeeder**
  ```php
  // sede_unica, multi_sede
  ```

**CHECKPOINT FASE 2:** Estructura 3NF completa, datos iniciales seeded

---

## FASE 3: MODELS Y TESTING
**Objetivo:** Actualizar código Laravel y verificar funcionalidad completa

### 3.1 Actualizar Eloquent Models

- [ ] **User Model**
  ```php
  // Reemplazar enum con relationship
  public function role()
  {
      return $this->belongsTo(UserRole::class);
  }
  
  // Accessor para compatibilidad
  public function getRoleAttribute()
  {
      return $this->role->role_code;
  }
  ```

- [ ] **Organization Model**
  ```php
  public function status()
  {
      return $this->belongsTo(OrganizationStatus::class);
  }
  
  public function type()
  {
      return $this->belongsTo(OrganizationType::class);
  }
  
  public function appearanceTheme()
  {
      return $this->hasOne(AppearanceTheme::class);
  }
  ```

- [ ] **Event Model**
  ```php
  public function status()
  {
      return $this->belongsTo(EventStatus::class);
  }
  
  public function type()
  {
      return $this->belongsTo(EventType::class);
  }
  ```

### 3.2 Crear Nuevos Models

- [ ] **UserRole Model**
- [ ] **OrganizationStatus Model**
- [ ] **OrganizationType Model**
- [ ] **EventStatus Model**
- [ ] **EventType Model**
- [ ] **AppearanceTheme Model**

### 3.3 Actualizar Controllers si es necesario

- [ ] **Revisar controllers que usen enum values**
- [ ] **Actualizar validación rules**
- [ ] **Verificar queries que filtren por enum**

### 3.4 Testing Completo

- [ ] **Test endpoints públicos (9)**
  ```bash
  curl http://localhost:8000/api/v1/public/events
  curl http://localhost:8000/api/v1/public/categories
  # ... todos los endpoints
  ```

- [ ] **Test frontend Calendar**
  ```bash
  # Frontend corriendo en puerto 3000
  # Verificar que http://localhost:3000/calendar carga
  # Verificar que se muestran eventos
  ```

- [ ] **Test workflow administrativo**
  ```bash
  # Login con diferentes roles
  # Crear eventos
  # Cambiar estados
  ```

**CHECKPOINT FASE 3:** Sistema completo funcionando con PostgreSQL + 3NF

---

## 🗂️ REFERENCIAS TÉCNICAS

### Decisiones de Arquitectura Tomadas

**Timing Nginx:** Post-Fase 2 (después de estructura 3NF completa)
- **Razón:** Priorizar agilidad de desarrollo durante migración crítica DB
- **Setup actual:** Frontend local (3000) → Backend Docker (8000) → PostgreSQL
- **Reintegración nginx:** Después de tablas lookup + testing completo

### Stack Evolution Timeline
```
Fase 1: PostgreSQL ✅
↓
Setup Híbrido: Laravel directo (puerto 8000) ← EN PROGRESO
↓  
Fase 2: 3NF + tablas lookup
↓
Stack Completo: Nginx + Redis + MailHog + optimizaciones
↓
Seeder Real: Datos tucumanos + testing integral
```

### Comandos Docker Importantes
```bash
# Ver containers activos
docker-compose -f docker-compose.dev.yml ps

# Logs de PostgreSQL
docker logs [postgres_container_name]

# Acceso directo a PostgreSQL
docker exec -it [postgres_container] psql -U eventos_user -d eventos_tucuman

# Backup de seguridad (opcional)
docker exec [postgres_container] pg_dump -U eventos_user eventos_tucuman > backup.sql
```

### Comandos Laravel Importantes
```bash
# Ejecutar migrations
php artisan migrate

# Ejecutar seeders
php artisan db:seed

# Rollback si algo falla
php artisan migrate:rollback

# Limpiar cache
php artisan cache:clear
php artisan config:clear
```

### URLs de Testing
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Calendario Público: http://localhost:3000/calendar
- API Docs: http://localhost:8000/api/documentation

---

## ⚠️ PLAN DE ROLLBACK

Si algo falla durante la migración:

1. **Rollback Docker**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   git checkout HEAD~1 docker-compose.dev.yml
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Rollback Laravel**
   ```bash
   php artisan migrate:rollback
   git checkout HEAD~1 database/migrations/
   ```

3. **Restaurar desde backup**
   ```bash
   # Si se creó backup
   cat backup.sql | docker exec -i [mysql_container] mysql -u user -p database
   ```

---

## 📝 LOG DE PROGRESO

### [2025-09-10] - Inicio Migración
- [x] Análisis completo realizado
- [x] Plan aprobado
- [x] Inicio Fase 1

### [2025-09-10] - Fase 1 Completada ✅
- [x] Docker PostgreSQL configurado
- [x] Variables .env actualizadas  
- [x] MySQL completamente eliminado
- [x] PostgreSQL 15.13 funcionando
- [x] Container backend con pdo_pgsql
- [x] Laravel conectado exitosamente
- [x] Configuración Docker simplificada (solo DB + Backend)

### [FECHA] - Fase 1 Completada
- [ ] Docker PostgreSQL funcionando
- [ ] Laravel conectado
- [ ] Tests básicos OK

### [FECHA] - Fase 2 Completada
- [ ] 5 tablas lookup creadas
- [ ] Tablas principales modificadas
- [ ] Seeders ejecutados

### [FECHA] - Fase 3 Completada
- [ ] Models actualizados
- [ ] Controllers revisados
- [ ] Testing completo OK

### [FECHA] - Migración Finalizada
- [ ] Sistema estable
- [ ] Performance verificada
- [ ] Documentación actualizada

---

## 🎯 PRÓXIMOS PASOS POST-MIGRACIÓN

1. **Seeder de datos reales** (Semana 3-4 del plan original)
2. **Optimización de performance** PostgreSQL
3. **Testing automatizado** de la nueva estructura
4. **Documentación API** actualizada

---

**MIGRACIÓN DIRECTA MySQL → PostgreSQL + 3NF**  
**Preparado para:** Escalabilidad comercial multi-provincial  
**Estado:** 🔄 En progreso