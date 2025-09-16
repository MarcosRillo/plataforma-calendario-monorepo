<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventStatus extends Model
{
    protected $fillable = [
        'status_code',
        'status_name',
        'description',
        'is_public',
        'workflow_order',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'workflow_order' => 'integer',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'status_id');
    }
}
