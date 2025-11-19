<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'issue_type',
        'severity',
        'title',
        'description',
        'status',
        'reported_at',
        'resolved_at',
        'resolution_notes',
        'reported_by_name',
        'reported_by_contact',
        'reported_by_user_id',
        'assigned_to',
        'resolved_by',
        'estimated_repair_cost',
        'actual_repair_cost',
        'requires_maintenance',
        'maintenance_id',
        'affects_operations',
        'impact_description',
        'attachments',
        'notes'
    ];

    protected $casts = [
        'reported_at' => 'datetime',
        'resolved_at' => 'datetime',
        'estimated_repair_cost' => 'decimal:2',
        'actual_repair_cost' => 'decimal:2',
        'requires_maintenance' => 'boolean',
        'affects_operations' => 'boolean',
        'attachments' => 'array'
    ];

    /**
     * Get the equipment that owns the issue.
     */
    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who reported the issue.
     */
    public function reportedByUser()
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    /**
     * Get the user assigned to resolve the issue.
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who resolved the issue.
     */
    public function resolvedByUser()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Get the maintenance record associated with this issue.
     */
    public function maintenance()
    {
        return $this->belongsTo(EquipmentMaintenance::class, 'maintenance_id');
    }

    /**
     * Scope a query to only include reported issues.
     */
    public function scopeReported($query)
    {
        return $query->where('status', 'reported');
    }

    /**
     * Scope a query to only include investigating issues.
     */
    public function scopeInvestigating($query)
    {
        return $query->where('status', 'investigating');
    }

    /**
     * Scope a query to only include in progress issues.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include resolved issues.
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope a query to only include closed issues.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope a query to filter by issue type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('issue_type', $type);
    }

    /**
     * Scope a query to filter by severity.
     */
    public function scopeOfSeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('reported_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by assigned user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope a query to only include issues affecting operations.
     */
    public function scopeAffectingOperations($query)
    {
        return $query->where('affects_operations', true);
    }

    /**
     * Scope a query to only include issues requiring maintenance.
     */
    public function scopeRequiringMaintenance($query)
    {
        return $query->where('requires_maintenance', true);
    }

    /**
     * Check if issue is reported.
     */
    public function isReported()
    {
        return $this->status === 'reported';
    }

    /**
     * Check if issue is being investigated.
     */
    public function isInvestigating()
    {
        return $this->status === 'investigating';
    }

    /**
     * Check if issue is in progress.
     */
    public function isInProgress()
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if issue is resolved.
     */
    public function isResolved()
    {
        return $this->status === 'resolved';
    }

    /**
     * Check if issue is closed.
     */
    public function isClosed()
    {
        return $this->status === 'closed';
    }

    /**
     * Check if issue is open (not resolved or closed).
     */
    public function isOpen()
    {
        return in_array($this->status, ['reported', 'investigating', 'in_progress']);
    }

    /**
     * Get issue type description.
     */
    public function getIssueTypeDescription()
    {
        $descriptions = [
            'malfunction' => 'Equipment Malfunction',
            'damage' => 'Physical Damage',
            'missing' => 'Missing Equipment',
            'calibration_failed' => 'Calibration Failed',
            'safety_concern' => 'Safety Concern',
            'performance_issue' => 'Performance Issue',
            'software_bug' => 'Software Bug',
            'connectivity_issue' => 'Connectivity Issue'
        ];

        return $descriptions[$this->issue_type] ?? 'Unknown';
    }

    /**
     * Get severity description.
     */
    public function getSeverityDescription()
    {
        $descriptions = [
            'low' => 'Low Severity',
            'medium' => 'Medium Severity',
            'high' => 'High Severity',
            'critical' => 'Critical Severity'
        ];

        return $descriptions[$this->severity] ?? 'Unknown';
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'reported' => 'blue',
            'investigating' => 'yellow',
            'in_progress' => 'orange',
            'resolved' => 'green',
            'closed' => 'gray'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get severity color.
     */
    public function getSeverityColor()
    {
        $colors = [
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red'
        ];

        return $colors[$this->severity] ?? 'gray';
    }

    /**
     * Get resolution time in hours.
     */
    public function getResolutionTime()
    {
        if ($this->resolved_at && $this->reported_at) {
            return $this->reported_at->diffInHours($this->resolved_at);
        }
        return null;
    }

    /**
     * Get formatted resolution time.
     */
    public function getFormattedResolutionTime()
    {
        $time = $this->getResolutionTime();
        
        if ($time) {
            if ($time < 1) {
                return round($time * 60) . ' minutes';
            } elseif ($time < 24) {
                return round($time) . ' hours';
            } else {
                $days = floor($time / 24);
                $hours = $time % 24;
                return "{$days} days " . round($hours) . ' hours';
            }
        }
        
        return 'N/A';
    }

    /**
     * Get cost variance.
     */
    public function getCostVariance()
    {
        if ($this->estimated_repair_cost && $this->actual_repair_cost) {
            return $this->actual_repair_cost - $this->estimated_repair_cost;
        }
        return null;
    }

    /**
     * Get cost variance percentage.
     */
    public function getCostVariancePercentage()
    {
        $variance = $this->getCostVariance();
        
        if ($variance && $this->estimated_repair_cost) {
            return ($variance / $this->estimated_repair_cost) * 100;
        }
        
        return null;
    }

    /**
     * Check if issue is overdue.
     */
    public function isOverdue()
    {
        if (!$this->isOpen()) {
            return false;
        }

        // Define SLA based on severity
        $slaHours = [
            'critical' => 2,
            'high' => 8,
            'medium' => 24,
            'low' => 72
        ];

        $sla = $slaHours[$this->severity] ?? 24;
        $hoursSinceReported = $this->reported_at->diffInHours(now());

        return $hoursSinceReported > $sla;
    }

    /**
     * Get days overdue.
     */
    public function getDaysOverdue()
    {
        if ($this->isOverdue()) {
            $slaHours = [
                'critical' => 2,
                'high' => 8,
                'medium' => 24,
                'low' => 72
            ];

            $sla = $slaHours[$this->severity] ?? 24;
            $hoursSinceReported = $this->reported_at->diffInHours(now());
            
            return max(0, $hoursSinceReported - $sla);
        }
        
        return 0;
    }

    /**
     * Get SLA status.
     */
    public function getSlaStatus()
    {
        if (!$this->isOpen()) {
            return 'completed';
        }

        if ($this->isOverdue()) {
            return 'overdue';
        }

        $slaHours = [
            'critical' => 2,
            'high' => 8,
            'medium' => 24,
            'low' => 72
        ];

        $sla = $slaHours[$this->severity] ?? 24;
        $hoursSinceReported = $this->reported_at->diffInHours(now());
        $remainingHours = $sla - $hoursSinceReported;

        if ($remainingHours <= 0) {
            return 'overdue';
        } elseif ($remainingHours <= $sla * 0.25) {
            return 'critical';
        } elseif ($remainingHours <= $sla * 0.5) {
            return 'warning';
        }

        return 'normal';
    }

    /**
     * Get SLA status color.
     */
    public function getSlaStatusColor()
    {
        $status = $this->getSlaStatus();
        
        $colors = [
            'normal' => 'green',
            'warning' => 'yellow',
            'critical' => 'orange',
            'overdue' => 'red',
            'completed' => 'blue'
        ];

        return $colors[$status] ?? 'gray';
    }

    /**
     * Assign issue to user.
     */
    public function assignTo($userId)
    {
        $this->update([
            'assigned_to' => $userId,
            'status' => 'investigating'
        ]);
    }

    /**
     * Resolve issue.
     */
    public function resolve($resolvedBy, $resolutionNotes, $actualCost = null)
    {
        $updateData = [
            'status' => 'resolved',
            'resolved_by' => $resolvedBy,
            'resolved_at' => now(),
            'resolution_notes' => $resolutionNotes
        ];

        if ($actualCost !== null) {
            $updateData['actual_repair_cost'] = $actualCost;
        }

        $this->update($updateData);
    }

    /**
     * Close issue.
     */
    public function close()
    {
        $this->update(['status' => 'closed']);
    }

    /**
     * Get issue summary.
     */
    public function getSummary()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'equipment' => $this->equipment->name ?? 'Unknown',
            'type' => $this->getIssueTypeDescription(),
            'severity' => $this->getSeverityDescription(),
            'status' => $this->status,
            'reported_at' => $this->reported_at->format('Y-m-d H:i'),
            'resolved_at' => $this->resolved_at?->format('Y-m-d H:i'),
            'resolution_time' => $this->getFormattedResolutionTime(),
            'assigned_to' => $this->assignedUser->name ?? 'Unassigned',
            'affects_operations' => $this->affects_operations,
            'sla_status' => $this->getSlaStatus(),
            'cost' => $this->actual_repair_cost ?? $this->estimated_repair_cost,
        ];
    }

    /**
     * Get issue statistics.
     */
    public static function getIssueStatistics($startDate = null, $endDate = null)
    {
        $query = static::query();

        if ($startDate && $endDate) {
            $query->whereBetween('reported_at', [$startDate, $endDate]);
        }

        return [
            'total_issues' => $query->count(),
            'open_issues' => $query->clone()->whereIn('status', ['reported', 'investigating', 'in_progress'])->count(),
            'resolved_issues' => $query->clone()->where('status', 'resolved')->count(),
            'closed_issues' => $query->clone()->where('status', 'closed')->count(),
            'critical_issues' => $query->clone()->where('severity', 'critical')->count(),
            'issues_affecting_operations' => $query->clone()->where('affects_operations', true)->count(),
            'average_resolution_time' => $query->clone()
                ->whereNotNull('resolved_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, reported_at, resolved_at)) as avg_time')
                ->value('avg_time'),
            'sla_compliance' => static::calculateSlaCompliance($query->clone()),
        ];
    }

    /**
     * Calculate SLA compliance percentage.
     */
    private static function calculateSlaCompliance($query)
    {
        $resolvedIssues = $query->whereIn('status', ['resolved', 'closed'])->get();
        
        if ($resolvedIssues->isEmpty()) {
            return 0;
        }

        $compliantIssues = 0;
        
        foreach ($resolvedIssues as $issue) {
            if (!$issue->isOverdue()) {
                $compliantIssues++;
            }
        }

        return round(($compliantIssues / $resolvedIssues->count()) * 100, 2);
    }
}