<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'display_name',
        'description',
        'is_public',
        'is_required',
        'options'
    ];

    protected $casts = [
        'options' => 'array',
        'is_public' => 'boolean',
        'is_required' => 'boolean'
    ];

    /**
     * Scope a query to only include public settings.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope a query to filter by group.
     */
    public function scopeOfGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get setting value with proper casting.
     */
    public function getValueAttribute($value)
    {
        switch ($this->type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $value;
            case 'json':
                return json_decode($value, true);
            case 'file':
                return $value;
            default:
                return $value;
        }
    }

    /**
     * Set setting value with proper formatting.
     */
    public function setValueAttribute($value)
    {
        switch ($this->type) {
            case 'boolean':
                $this->attributes['value'] = $value ? '1' : '0';
                break;
            case 'json':
                $this->attributes['value'] = is_array($value) ? json_encode($value) : $value;
                break;
            default:
                $this->attributes['value'] = $value;
        }
    }

    /**
     * Check if setting is boolean type.
     */
    public function isBoolean()
    {
        return $this->type === 'boolean';
    }

    /**
     * Check if setting is json type.
     */
    public function isJson()
    {
        return $this->type === 'json';
    }

    /**
     * Check if setting is file type.
     */
    public function isFile()
    {
        return $this->type === 'file';
    }

    /**
     * Get formatted value for display.
     */
    public function getFormattedValue()
    {
        if ($this->isBoolean()) {
            return $this->value ? 'Yes' : 'No';
        }

        if ($this->isJson()) {
            return json_encode($this->value, JSON_PRETTY_PRINT);
        }

        return $this->value;
    }

    /**
     * Get setting by key with caching.
     */
    public static function getByKey($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set setting by key.
     */
    public static function setByKey($key, $value, $type = 'string')
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'display_name' => ucwords(str_replace('_', ' ', $key))
            ]
        );

        return $setting;
    }
}
