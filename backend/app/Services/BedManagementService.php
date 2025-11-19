<?php

namespace App\Services;

use App\Models\Bed;
use App\Models\Room;
use App\Models\Ward;
use App\Models\Admission;
use App\Models\BedAssignment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BedManagementService
{
    /**
     * Get beds with filters and pagination.
     */
    public function getBeds(array $filters = [])
    {
        $query = Bed::with(['room.ward', 'currentAdmission.patient']);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['bed_type'])) {
            $query->where('bed_type', $filters['bed_type']);
        }

        if (isset($filters['ward_id'])) {
            $query->whereHas('room', function ($q) use ($filters) {
                $q->where('ward_id', $filters['ward_id']);
            });
        }

        if (isset($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        }

        if (isset($filters['maintenance_required'])) {
            $query->where(function ($q) {
                $q->whereNull('last_maintenance')
                  ->orWhere('last_maintenance', '<', Carbon::now()->subDays(30));
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Apply pagination
        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Create a new bed.
     */
    public function createBed(array $data): Bed
    {
        return DB::transaction(function () use ($data) {
            // Validate room exists and has capacity
            $room = Room::findOrFail($data['room_id']);
            
            // Check if bed number already exists in room
            $existingBed = Bed::where('room_id', $data['room_id'])
                ->where('bed_number', $data['bed_number'])
                ->first();

            if ($existingBed) {
                throw new \Exception('Bed number already exists in this room');
            }

            $bed = Bed::create($data);
            $bed->load(['room.ward']);

            return $bed;
        });
    }

    /**
     * Get bed with detailed information.
     */
    public function getBedWithDetails(Bed $bed): Bed
    {
        return $bed->load([
            'room.ward',
            'currentAdmission.patient',
            'bedAssignments.admission.patient',
            'housekeepingTasks'
        ]);
    }

    /**
     * Update bed information.
     */
    public function updateBed(Bed $bed, array $data): Bed
    {
        return DB::transaction(function () use ($bed, $data) {
            // If changing room, validate new room
            if (isset($data['room_id']) && $data['room_id'] !== $bed->room_id) {
                $room = Room::findOrFail($data['room_id']);
                
                // Check if bed number already exists in new room
                $existingBed = Bed::where('room_id', $data['room_id'])
                    ->where('bed_number', $data['bed_number'] ?? $bed->bed_number)
                    ->where('id', '!=', $bed->id)
                    ->first();

                if ($existingBed) {
                    throw new \Exception('Bed number already exists in the target room');
                }
            }

            $bed->update($data);
            $bed->load(['room.ward']);

            return $bed;
        });
    }

    /**
     * Delete bed.
     */
    public function deleteBed(Bed $bed): void
    {
        DB::transaction(function () use ($bed) {
            // Check if bed is currently occupied
            if ($bed->status === 'occupied') {
                throw new \Exception('Cannot delete occupied bed');
            }

            // Check if bed has active assignments
            $activeAssignments = BedAssignment::where('bed_id', $bed->id)
                ->whereNull('released_date')
                ->count();

            if ($activeAssignments > 0) {
                throw new \Exception('Cannot delete bed with active assignments');
            }

            $bed->delete();
        });
    }

    /**
     * Get available beds for admission.
     */
    public function getAvailableBeds(array $filters = [])
    {
        $query = Bed::with(['room.ward'])
            ->where('status', 'available');

        // Filter by ward
        if (isset($filters['ward_id'])) {
            $query->whereHas('room', function ($q) use ($filters) {
                $q->where('ward_id', $filters['ward_id']);
            });
        }

        // Filter by room type
        if (isset($filters['room_type'])) {
            $query->whereHas('room', function ($q) use ($filters) {
                $q->where('room_type', $filters['room_type']);
            });
        }

        // Filter by bed type
        if (isset($filters['bed_type'])) {
            $query->where('bed_type', $filters['bed_type']);
        }

        // Filter by floor
        if (isset($filters['floor'])) {
            $query->whereHas('room.ward', function ($q) use ($filters) {
                $q->where('floor', $filters['floor']);
            });
        }

        return $query->get();
    }

    /**
     * Get bed status history.
     */
    public function getBedStatusHistory(Bed $bed)
    {
        return BedAssignment::where('bed_id', $bed->id)
            ->with(['admission.patient'])
            ->orderBy('assigned_date', 'desc')
            ->orderBy('assigned_time', 'desc')
            ->get();
    }

    /**
     * Update bed maintenance status.
     */
    public function updateMaintenance(Bed $bed, array $data): Bed
    {
        $bed->update([
            'last_maintenance' => $data['maintenance_date'] ?? now()->toDateString(),
            'status' => $data['status'] ?? 'available'
        ]);

        $bed->load(['room.ward']);
        return $bed;
    }

    /**
     * Get beds requiring maintenance.
     */
    public function getBedsRequiringMaintenance()
    {
        return Bed::with(['room.ward'])
            ->where(function ($query) {
                $query->whereNull('last_maintenance')
                      ->orWhere('last_maintenance', '<', Carbon::now()->subDays(30));
            })
            ->where('status', '!=', 'maintenance')
            ->get()
            ->map(function ($bed) {
                $bed->days_since_maintenance = $bed->days_since_maintenance;
                return $bed;
            });
    }

    /**
     * Get bed occupancy statistics.
     */
    public function getBedOccupancyStatistics()
    {
        $totalBeds = Bed::count();
        $occupiedBeds = Bed::where('status', 'occupied')->count();
        $availableBeds = Bed::where('status', 'available')->count();
        $maintenanceBeds = Bed::where('status', 'maintenance')->count();
        $cleaningBeds = Bed::where('status', 'cleaning')->count();

        return [
            'total_beds' => $totalBeds,
            'occupied_beds' => $occupiedBeds,
            'available_beds' => $availableBeds,
            'maintenance_beds' => $maintenanceBeds,
            'cleaning_beds' => $cleaningBeds,
            'occupancy_rate' => $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 2) : 0,
            'availability_rate' => $totalBeds > 0 ? round(($availableBeds / $totalBeds) * 100, 2) : 0
        ];
    }

    /**
     * Get bed utilization by ward.
     */
    public function getBedUtilizationByWard()
    {
        return Ward::withCount([
            'rooms as total_beds' => function ($query) {
                $query->withCount('beds');
            },
            'rooms as occupied_beds' => function ($query) {
                $query->withCount(['beds' => function ($q) {
                    $q->where('status', 'occupied');
                }]);
            }
        ])->get()->map(function ($ward) {
            $ward->occupancy_rate = $ward->total_beds > 0 
                ? round(($ward->occupied_beds / $ward->total_beds) * 100, 2) 
                : 0;
            return $ward;
        });
    }
}
