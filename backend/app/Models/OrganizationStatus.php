<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationStatus extends Model
{
    protected $fillable = [
        'status_code',
        'status_name',
        'description',
        'can_create_events',
    ];

    protected $casts = [
        'can_create_events' => 'boolean',
    ];

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'status_id');
    }
}
