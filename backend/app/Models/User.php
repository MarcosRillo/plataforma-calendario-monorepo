<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role_id',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role_id' => 'integer',
        ];
    }

    /**
     * The organizations that belong to the user.
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_user')
                    ->withTimestamps();
    }

    /**
     * Get the role that this user belongs to.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(UserRole::class, 'role_id');
    }

    /**
     * Check if the user is a platform admin.
     */
    public function isPlatformAdmin(): bool
    {
        return $this->role?->role_code === 'platform_admin';
    }

    /**
     * Check if the user is an entity admin.
     */
    public function isEntityAdmin(): bool
    {
        return $this->role?->role_code === 'entity_admin';
    }

    /**
     * Check if the user is an entity staff member.
     */
    public function isEntityStaff(): bool
    {
        return $this->role?->role_code === 'entity_staff';
    }

    /**
     * Check if the user is an organizer admin.
     */
    public function isOrganizerAdmin(): bool
    {
        return $this->role?->role_code === 'organizer_admin';
    }

    /**
     * Check if the user has admin privileges (platform or entity admin).
     */
    public function hasAdminPrivileges(): bool
    {
        return in_array($this->role?->role_code, ['platform_admin', 'entity_admin']);
    }

    /**
     * Scope a query to only include platform admins.
     */
    public function scopePlatformAdmins($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('role_code', 'platform_admin'));
    }

    /**
     * Scope a query to only include entity admins.
     */
    public function scopeEntityAdmins($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('role_code', 'entity_admin'));
    }

    /**
     * Scope a query to only include organizer admins.
     */
    public function scopeOrganizerAdmins($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('role_code', 'organizer_admin'));
    }
}
