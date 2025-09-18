<?php

namespace App\Features\Events\Services;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Str;

class EventService
{
    /**
     * Create a new event - SIMPLE, sin repository pattern.
     */
    public function create(array $data, User $user): Event
    {
        $data['created_by'] = $user->id;
        $data['organization_id'] = $data['organization_id'] ?? $user->organization_id;
        $data['slug'] = Str::slug($data['title']);
        $data['status_id'] = 1; // draft

        // Eloquent directo, sin abstracciones
        return Event::create($data);
    }

    /**
     * Update existing event - SIMPLE.
     */
    public function update(Event $event, array $data, User $user): Event
    {
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $data['updated_by'] = $user->id;

        // Eloquent directo
        $event->update($data);

        return $event->fresh();
    }

    /**
     * Duplicate event - SIMPLE.
     */
    public function duplicate(Event $event): Event
    {
        $replica = $event->replicate();
        $replica->title = $event->title . ' (Copia)';
        $replica->slug = Str::slug($replica->title);
        $replica->status_id = 1; // draft
        $replica->is_featured = false;
        $replica->approved_at = null;
        $replica->approved_by = null;
        $replica->published_at = null;
        $replica->save();

        // Copiar relaciones si es necesario
        if ($event->locations) {
            $replica->locations()->sync($event->locations->pluck('id'));
        }

        return $replica;
    }
}