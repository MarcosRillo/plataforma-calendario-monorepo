<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationType extends Model
{
    protected $fillable = [
        'type_code',
        'type_name',
        'description',
        'hierarchy_level',
    ];

    protected $casts = [
        'hierarchy_level' => 'integer',
    ];

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'type_id');
    }
}
