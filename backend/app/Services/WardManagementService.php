<?php

namespace App\Services;

use App\Models\Ward;
use App\Models\Room;
use App\Models\Bed;
use App\Models\User;
use App\Models\Admission;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WardManagementService
{
    /**
     * Get wards with filters and pagination.
     */
    public function getWards(array $filters = [])
    {
        $query = Ward::with(['headNurse', 'rooms.beds']);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['floor'])) {
            $query->where('floor', $filters['floor']);
        }

        if (isset($filters['head_nurse_id'])) {
            $query->where('head_nurse_id', $filters['head_nurse_id']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        // Apply pagination
        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Create a new ward.
     */
    public function createWard(array $data): Ward
    {
        return DB::transaction(function () use ($data) {
            // Validate head nurse if provided
            if (isset($data['head_nurse_id'])) {
                $headNurse = User::where('id', $data['head_nurse_id'])
                    ->where('role', 'nurse')
                    ->first();

                if (!$headNurse) {
                    throw new \Exception('Invalid head nurse selected');
                }

                // Check if nurse is already head of another ward
                $existingWard = Ward::where('head_nurse_id', $data['head_nurse_id'])
                    ->where('status', 'active')
                    ->first();

                if ($existingWard) {
                    throw new \Exception('Nurse is already head of another ward');
                }
            }

            $ward = Ward::create($data);
            $ward->load(['headNurse']);

            return $ward;
        });
    }

    /**
     * Get ward with detailed information.
     */
    public function getWardWithDetails(Ward $ward): Ward
    {
        return $ward->load([
            'headNurse',
            'rooms.beds',
            'admissions.patient',
            'housekeepingTasks'
        ]);
    }

    /**
     * Update ward information.
     */
    public function updateWard(Ward $ward, array $data): Ward
    {
        return DB::transaction(function () use ($ward, $data) {
            // Validate head nurse if being changed
            if (isset($data['head_nurse_id']) && $data['head_nurse_id'] !== $ward->head_nurse_id) {
                $headNurse = User::where('id', $data['head_nurse_id'])
                    ->where('role', 'nurse')
                    ->first();

                if (!$headNurse) {
                    throw new \Exception('Invalid head nurse selected');
                }

                // Check if nurse is already head of another ward
                $existingWard = Ward::where('head_nurse_id', $data['head_nurse_id'])
                    ->where('status', 'active')
                    ->where('id', '!=', $ward->id)
                    ->first();

                if ($existingWard) {
                    throw new \Exception('Nurse is already head of another ward');
                }
            }

            $ward->update($data);
            $ward->load(['headNurse']);

            return $ward;
        });
    }

    /**
     * Delete ward.
     */
    public function deleteWard(Ward $ward): void
    {
        DB::transaction(function () use ($ward) {
            // Check if ward has active admissions
            $activeAdmissions = Admission::whereHas('bed.room', function ($query) use ($ward) {
                $query->where('ward_id', $ward->id);
            })->where('status', 'active')->count();

            if ($activeAdmissions > 0) {
                throw new \Exception('Cannot delete ward with active admissions');
            }

            // Check if ward has rooms with beds
            $roomsWithBeds = $ward->rooms()->withCount('beds')->get()->sum('beds_count');
            if ($roomsWithBeds > 0) {
                throw new \Exception('Cannot delete ward with existing rooms and beds');
            }

            $ward->delete();
        });
    }

    /**
     * Get ward statistics.
     */
    public function getWardStatistics(Ward $ward)
    {
        $totalRooms = $ward->rooms()->count();
        $totalBeds = $ward->rooms()->withCount('beds')->get()->sum('beds_count');
        $occupiedBeds = $ward->rooms()
            ->withCount(['beds' => function ($query) {
                $query->where('status', 'occupied');
            }])
            ->get()
            ->sum('beds_count');

        $activeAdmissions = $ward->admissions()->where('status', 'active')->count();
        $dischargedToday = $ward->admissions()
            ->where('status', 'discharged')
            ->whereDate('discharge_date', today())
            ->count();

        $pendingHousekeepingTasks = $ward->housekeepingTasks()
            ->where('status', 'pending')
            ->count();

        return [
            'ward_id' => $ward->id,
            'ward_name' => $ward->name,
            'total_rooms' => $totalRooms,
            'total_beds' => $totalBeds,
            'occupied_beds' => $occupiedBeds,
            'available_beds' => $totalBeds - $occupiedBeds,
            'occupancy_rate' => $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 2) : 0,
            'active_admissions' => $activeAdmissions,
            'discharged_today' => $dischargedToday,
            'pending_housekeeping_tasks' => $pendingHousekeepingTasks,
            'capacity_utilization' => $ward->capacity > 0 ? round(($occupiedBeds / $ward->capacity) * 100, 2) : 0
        ];
    }

    /**
     * Get ward occupancy data.
     */
    public function getWardOccupancy(Ward $ward)
    {
        $rooms = $ward->rooms()->with(['beds' => function ($query) {
            $query->with(['currentAdmission.patient']);
        }])->get();

        $occupancyData = $rooms->map(function ($room) {
            return [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'room_type' => $room->room_type,
                'total_beds' => $room->beds->count(),
                'occupied_beds' => $room->beds->where('status', 'occupied')->count(),
                'available_beds' => $room->beds->where('status', 'available')->count(),
                'beds' => $room->beds->map(function ($bed) {
                    return [
                        'bed_id' => $bed->id,
                        'bed_number' => $bed->bed_number,
                        'bed_type' => $bed->bed_type,
                        'status' => $bed->status,
                        'patient' => $bed->currentAdmission?->patient,
                        'admission_date' => $bed->currentAdmission?->admission_date
                    ];
                })
            ];
        });

        return [
            'ward_id' => $ward->id,
            'ward_name' => $ward->name,
            'rooms' => $occupancyData,
            'summary' => [
                'total_rooms' => $rooms->count(),
                'total_beds' => $rooms->sum('beds_count'),
                'occupied_beds' => $rooms->sum(function ($room) {
                    return $room->beds->where('status', 'occupied')->count();
                }),
                'available_beds' => $rooms->sum(function ($room) {
                    return $room->beds->where('status', 'available')->count();
                })
            ]
        ];
    }

    /**
     * Get available head nurses for ward assignment.
     */
    public function getAvailableHeadNurses()
    {
        return User::where('role', 'nurse')
            ->where('status', 'active')
            ->whereDoesntHave('headWards', function ($query) {
                $query->where('status', 'active');
            })
            ->select('id', 'name', 'email')
            ->get();
    }

    /**
     * Get ward capacity planning data.
     */
    public function getWardCapacityPlanning(Ward $ward)
    {
        $currentOccupancy = $this->getWardStatistics($ward);
        
        // Get historical data for the last 30 days
        $historicalData = Admission::whereHas('bed.room', function ($query) use ($ward) {
            $query->where('ward_id', $ward->id);
        })
        ->where('admission_date', '>=', Carbon::now()->subDays(30))
        ->selectRaw('DATE(admission_date) as date, COUNT(*) as admissions')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Get discharge data for the last 30 days
        $dischargeData = Admission::whereHas('bed.room', function ($query) use ($ward) {
            $query->where('ward_id', $ward->id);
        })
        ->where('discharge_date', '>=', Carbon::now()->subDays(30))
        ->selectRaw('DATE(discharge_date) as date, COUNT(*) as discharges')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return [
            'ward_id' => $ward->id,
            'ward_name' => $ward->name,
            'current_capacity' => $ward->capacity,
            'current_occupancy' => $currentOccupancy,
            'historical_admissions' => $historicalData,
            'historical_discharges' => $dischargeData,
            'capacity_recommendations' => $this->getCapacityRecommendations($ward, $currentOccupancy)
        ];
    }

    /**
     * Get capacity recommendations based on current usage.
     */
    private function getCapacityRecommendations(Ward $ward, array $currentOccupancy)
    {
        $occupancyRate = $currentOccupancy['occupancy_rate'];
        $recommendations = [];

        if ($occupancyRate > 90) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Ward is at high capacity. Consider opening additional beds or transferring patients.',
                'priority' => 'high'
            ];
        } elseif ($occupancyRate > 75) {
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Ward is approaching capacity. Monitor closely for new admissions.',
                'priority' => 'medium'
            ];
        } elseif ($occupancyRate < 30) {
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Ward has low occupancy. Consider consolidating rooms for efficiency.',
                'priority' => 'low'
            ];
        }

        return $recommendations;
    }
}
