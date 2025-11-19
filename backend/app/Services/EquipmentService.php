<?php

namespace App\Services;

use App\Models\Equipment;
use App\Models\EquipmentMaintenance;
use App\Models\AssetDepreciation;
use Illuminate\Support\Facades\DB;

class EquipmentService
{
    public function createEquipment(array $data): Equipment
    {
        return DB::transaction(function () use ($data) {
            $equipment = Equipment::create($data);

            if (isset($data['purchase_cost']) && $data['purchase_cost'] > 0) {
                $this->createDepreciationRecord($equipment, $data);
            }

            return $equipment->load(['category', 'assignedUser', 'creator']);
        });
    }

    public function createDepreciationRecord(Equipment $equipment, array $data): AssetDepreciation
    {
        $depreciationData = [
            'equipment_id' => $equipment->id,
            'depreciation_method' => $data['depreciation_method'] ?? 'straight_line',
            'purchase_cost' => $data['purchase_cost'],
            'salvage_value' => $data['salvage_value'] ?? 0,
            'useful_life_years' => $data['useful_life_years'] ?? 5,
            'depreciation_date' => $data['purchase_date'] ?? now(),
            'created_by' => auth()->id()
        ];

        $depreciationData['annual_depreciation'] = ($depreciationData['purchase_cost'] - $depreciationData['salvage_value']) / $depreciationData['useful_life_years'];
        $depreciationData['accumulated_depreciation'] = 0;
        $depreciationData['book_value'] = $depreciationData['purchase_cost'];

        return AssetDepreciation::create($depreciationData);
    }

    public function getEquipmentHealth(Equipment $equipment): array
    {
        $health = ['overall_status' => 'good', 'score' => 100, 'issues' => []];

        $overdueMaintenance = $equipment->maintenanceRecords()->where('status', 'overdue')->count();
        if ($overdueMaintenance > 0) {
            $health['issues'][] = "{$overdueMaintenance} overdue maintenance tasks";
            $health['score'] -= 20;
        }

        $openIssues = $equipment->issues()->where('status', 'open')->count();
        if ($openIssues > 0) {
            $health['issues'][] = "{$openIssues} open issues";
            $health['score'] -= $openIssues * 10;
        }

        if ($equipment->condition === 'poor') {
            $health['issues'][] = 'Equipment condition is poor';
            $health['score'] -= 25;
        }

        if ($health['score'] >= 90) {
            $health['overall_status'] = 'excellent';
        } elseif ($health['score'] >= 70) {
            $health['overall_status'] = 'good';
        } elseif ($health['score'] >= 50) {
            $health['overall_status'] = 'fair';
        } else {
            $health['overall_status'] = 'poor';
        }

        return $health;
    }
}