# Vertical Slice de Gestión de Eventos - Frontend

Este documento describe la implementación completa del "vertical slice" de gestión de eventos en el frontend de Next.js.

## Arquitectura Implementada

### 1. Tipos (types/)
- **event.types.ts**: Definiciones completas de tipos TypeScript para eventos
  - `Event`: Interface principal del evento
  - `EventFormData`: Interface para formularios de creación/edición
  - `EventFilters`: Interface para filtros de búsqueda
  - `EventPagination`: Interface para paginación
  - `EventStatistics`: Interface para estadísticas
  - Constantes de estado (`EVENT_STATUS`) y tipo (`EVENT_TYPE`)

### 2. Servicios (features/events/services/)
- **event.service.ts**: Servicio API para operaciones CRUD y workflow de aprobación
  - Operaciones CRUD: `getEvents`, `getEvent`, `createEvent`, `updateEvent`, `deleteEvent`
  - Workflow de aprobación: `approveInternal`, `requestPublic`, `approvePublic`, `requestChanges`, `rejectEvent`
  - Estadísticas: `getStatistics`, `getApprovalStatistics`

### 3. Hook de Estado (features/events/hooks/)
- **useEventManager.ts**: Hook personalizado que maneja todo el estado de eventos
  - Estado: eventos, paginación, filtros, estadísticas, loading, errores
  - Acciones CRUD completas
  - Gestión de workflow de aprobación
  - Control de modales
  - Manejo de filtros y paginación

### 4. Componentes (features/events/components/)
- **EventTable.tsx**: Tabla principal con eventos
  - Visualización de datos
  - Acciones por fila (editar, aprobar, eliminar)
  - Estados visuales por status
  - Soporte para paginación

- **CreateEventForm.tsx**: Modal para crear eventos
  - Formulario completo con validación
  - Campos: título, descripción, fechas, tipo, categoría, ubicación, capacidad
  - Manejo de errores
  - Tipos estrictos de TypeScript

- **ApprovalModal.tsx**: Modal para acciones de aprobación
  - Acciones dinámicas según estado del evento
  - Formulario para comentarios
  - Workflow completo de aprobación

- **EventFiltersBar.tsx**: Barra de filtros avanzados
  - Filtros básicos: búsqueda, estado, tipo
  - Filtros avanzados: categoría, ubicación, fechas
  - Indicadores visuales de filtros activos

- **Pagination.tsx**: Componente de paginación
  - Navegación entre páginas
  - Selector de elementos por página
  - Información de resultados

### 5. Página Principal (app/(admin)/events/)
- **page.tsx**: Página "tonta" que consume useEventManager
  - Dashboard con estadísticas
  - Integración de todos los componentes
  - Manejo de estados globales
  - Interface administrativa completa

## Flujo de Datos

```
User Interaction → Page Component → useEventManager Hook → Event Service → Backend API
                ↓
UI Updates ← State Updates ← Hook Response ← Service Response ← API Response
```

## Características Implementadas

### ✅ CRUD Completo
- Crear eventos con formulario completo
- Leer/Listar eventos con filtros
- Actualizar eventos (preparado para modal de edición)
- Eliminar eventos con confirmación

### ✅ Workflow de Aprobación
- Aprobar internamente
- Solicitar aprobación pública
- Aprobar para publicación
- Solicitar cambios
- Rechazar eventos
- Historial de aprobaciones

### ✅ Filtros y Búsqueda
- Búsqueda por texto
- Filtro por estado
- Filtro por tipo
- Filtro por categoría
- Filtro por ubicación
- Filtro por rango de fechas

### ✅ UI/UX
- Design system consistente con Tailwind CSS
- Modales responsivos
- Estados de loading
- Manejo de errores
- Indicadores visuales de estado
- Paginación avanzada

### ✅ TypeScript
- Tipos estrictos en toda la aplicación
- Interfaces bien definidas
- Type safety completo
- IntelliSense mejorado

## Dependencias Instaladas

```json
{
  "date-fns": "^3.x" // Para formateo de fechas
}
```

## Estructura de Archivos

```
frontend/src/
├── types/
│   ├── event.types.ts
│   ├── category.types.ts
│   ├── location.types.ts
│   └── user.types.ts
├── features/events/
│   ├── services/
│   │   └── event.service.ts
│   ├── hooks/
│   │   └── useEventManager.ts
│   └── components/
│       ├── EventTable.tsx
│       ├── CreateEventForm.tsx
│       ├── ApprovalModal.tsx
│       ├── EventFiltersBar.tsx
│       ├── Pagination.tsx
│       └── index.ts
└── app/(admin)/events/
    └── page.tsx
```

## Estado de la Implementación

- ✅ Backend API completamente funcional
- ✅ Tipos TypeScript definidos
- ✅ Servicios API implementados
- ✅ Hook de estado completo
- ✅ Componentes UI implementados
- ✅ Página principal integrada
- ⚠️ Pendiente: Tests unitarios
- ⚠️ Pendiente: Tests de integración
- ⚠️ Pendiente: Modal de edición de eventos

## Próximos Pasos

1. **Testing**: Implementar tests unitarios y de integración
2. **Edición**: Completar modal de edición de eventos
3. **Optimización**: Implementar React Query para cache
4. **Accesibilidad**: Mejorar a11y en componentes
5. **Performance**: Implementar lazy loading y virtualization para tablas grandes

## Notas Técnicas

- La página principal es completamente "tonta" y solo consume el hook `useEventManager`
- Todo el estado y lógica de negocio está encapsulado en el hook
- Los componentes son reutilizables y tienen interfaces claras
- El sistema de tipos es consistente con el backend Laravel
- Se sigue la arquitectura establecida del proyecto
