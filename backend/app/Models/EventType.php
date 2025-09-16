<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventType extends Model
{
    protected $fillable = [
        'type_code',
        'type_name',
        'description',
        'allows_multiple_locations',
    ];

    protected $casts = [
        'allows_multiple_locations' => 'boolean',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'type_id');
    }
}
