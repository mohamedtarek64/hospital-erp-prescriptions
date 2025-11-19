<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'name',
        'phone',
        'relationship',
        'email',
        'address',
        'is_primary',
        'can_consent',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'can_consent' => 'boolean',
        'is_active' => 'boolean'
    ];

    /**
     * Get the patient that owns the emergency contact.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Scope a query to only include active contacts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include primary contacts.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope a query to only include contacts who can consent.
     */
    public function scopeCanConsent($query)
    {
        return $query->where('can_consent', true);
    }

    /**
     * Scope a query to filter by relationship.
     */
    public function scopeByRelationship($query, $relationship)
    {
        return $query->where('relationship', $relationship);
    }

    /**
     * Check if contact is primary.
     */
    public function isPrimary()
    {
        return $this->is_primary;
    }

    /**
     * Check if contact can give consent.
     */
    public function canGiveConsent()
    {
        return $this->can_consent;
    }

    /**
     * Check if contact is active.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Get relationship description.
     */
    public function getRelationshipDescription()
    {
        $descriptions = [
            'spouse' => 'Spouse',
            'parent' => 'Parent',
            'child' => 'Child',
            'sibling' => 'Sibling',
            'friend' => 'Friend',
            'colleague' => 'Colleague',
            'neighbor' => 'Neighbor',
            'other' => 'Other'
        ];

        return $descriptions[$this->relationship] ?? 'Unknown';
    }

    /**
     * Get formatted phone number.
     */
    public function getFormattedPhone()
    {
        // Basic phone formatting - can be enhanced based on country
        $phone = preg_replace('/[^0-9]/', '', $this->phone);
        
        if (strlen($phone) === 10) {
            return substr($phone, 0, 3) . '-' . substr($phone, 3, 3) . '-' . substr($phone, 6);
        }
        
        return $this->phone;
    }

    /**
     * Get contact priority level.
     */
    public function getPriorityLevel()
    {
        if ($this->is_primary) {
            return 1;
        }
        
        if ($this->can_consent) {
            return 2;
        }
        
        return 3;
    }

    /**
     * Get contact priority description.
     */
    public function getPriorityDescription()
    {
        $priority = $this->getPriorityLevel();
        
        $descriptions = [
            1 => 'Primary Contact',
            2 => 'Can Give Consent',
            3 => 'Secondary Contact'
        ];

        return $descriptions[$priority] ?? 'Unknown';
    }

    /**
     * Get contact priority color.
     */
    public function getPriorityColor()
    {
        $priority = $this->getPriorityLevel();
        
        $colors = [
            1 => 'red',
            2 => 'orange',
            3 => 'blue'
        ];

        return $colors[$priority] ?? 'gray';
    }

    /**
     * Get full contact information.
     */
    public function getFullContactInfo()
    {
        $info = [
            'name' => $this->name,
            'phone' => $this->getFormattedPhone(),
            'relationship' => $this->getRelationshipDescription()
        ];

        if ($this->email) {
            $info['email'] = $this->email;
        }

        if ($this->address) {
            $info['address'] = $this->address;
        }

        return $info;
    }

    /**
     * Check if contact has complete information.
     */
    public function hasCompleteInfo()
    {
        return !empty($this->name) && !empty($this->phone) && !empty($this->relationship);
    }

    /**
     * Get missing information.
     */
    public function getMissingInfo()
    {
        $missing = [];

        if (empty($this->name)) {
            $missing[] = 'Name';
        }

        if (empty($this->phone)) {
            $missing[] = 'Phone';
        }

        if (empty($this->relationship)) {
            $missing[] = 'Relationship';
        }

        return $missing;
    }

    /**
     * Validate phone number format.
     */
    public function isValidPhone()
    {
        $phone = preg_replace('/[^0-9]/', '', $this->phone);
        return strlen($phone) >= 10 && strlen($phone) <= 15;
    }

    /**
     * Validate email format.
     */
    public function isValidEmail()
    {
        if (empty($this->email)) {
            return true; // Email is optional
        }
        
        return filter_var($this->email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Get contact summary.
     */
    public function getContactSummary()
    {
        $summary = "{$this->name} ({$this->getRelationshipDescription()})";
        
        if ($this->is_primary) {
            $summary .= " - Primary Contact";
        }
        
        if ($this->can_consent) {
            $summary .= " - Can Give Consent";
        }

        return $summary;
    }
}
