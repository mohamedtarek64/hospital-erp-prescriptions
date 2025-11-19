<?php

namespace App\Http\Controllers;

use App\Models\InsuranceClaim;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InsuranceClaimController extends Controller
{
    /**
     * Display a listing of insurance claims.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = InsuranceClaim::with(['patient', 'invoice', 'creator']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('insurance_provider')) {
                $query->where('insurance_provider', 'like', "%{$request->insurance_provider}%");
            }

            if ($request->has('date_from')) {
                $query->whereDate('submitted_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('submitted_date', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('claim_number', 'like', "%{$search}%")
                      ->orWhere('policy_number', 'like', "%{$search}%")
                      ->orWhere('insurance_provider', 'like', "%{$search}%");
                });
            }

            $claims = $query->orderBy('submitted_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $claims
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load insurance claims',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created insurance claim.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'invoice_id' => 'required|exists:invoices,id',
            'insurance_provider' => 'required|string|max:255',
            'policy_number' => 'required|string|max:255',
            'claim_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $claim = InsuranceClaim::create([
                'patient_id' => $request->patient_id,
                'invoice_id' => $request->invoice_id,
                'insurance_provider' => $request->insurance_provider,
                'policy_number' => $request->policy_number,
                'claim_number' => InsuranceClaim::generateClaimNumber(),
                'claim_amount' => $request->claim_amount,
                'submitted_date' => now(),
                'notes' => $request->notes,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Insurance claim created successfully',
                'data' => $claim->load(['patient', 'invoice', 'creator'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create insurance claim',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified insurance claim.
     */
    public function show(InsuranceClaim $insuranceClaim): JsonResponse
    {
        $insuranceClaim->load(['patient', 'invoice.items.service', 'creator']);

        return response()->json([
            'success' => true,
            'data' => $insuranceClaim
        ]);
    }

    /**
     * Update the specified insurance claim.
     */
    public function update(Request $request, InsuranceClaim $insuranceClaim): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'insurance_provider' => 'sometimes|required|string|max:255',
            'policy_number' => 'sometimes|required|string|max:255',
            'claim_amount' => 'sometimes|required|numeric|min:0',
            'approved_amount' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:submitted,under_review,approved,rejected,paid',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();

            // Set approval date if status is being changed to approved
            if ($request->has('status') && $request->status === 'approved' && $insuranceClaim->status !== 'approved') {
                $data['approved_date'] = now();
            }

            // Set paid date if status is being changed to paid
            if ($request->has('status') && $request->status === 'paid' && $insuranceClaim->status !== 'paid') {
                $data['paid_date'] = now();
            }

            $insuranceClaim->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Insurance claim updated successfully',
                'data' => $insuranceClaim->load(['patient', 'invoice', 'creator'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update insurance claim',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified insurance claim.
     */
    public function destroy(InsuranceClaim $insuranceClaim): JsonResponse
    {
        try {
            // Check if claim is already paid
            if ($insuranceClaim->isPaid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete paid insurance claim'
                ], 400);
            }

            $insuranceClaim->delete();

            return response()->json([
                'success' => true,
                'message' => 'Insurance claim deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete insurance claim',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get insurance claim analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_claims' => InsuranceClaim::where('submitted_date', '>=', $startDate)->count(),
                'approved_claims' => InsuranceClaim::where('submitted_date', '>=', $startDate)->approved()->count(),
                'rejected_claims' => InsuranceClaim::where('submitted_date', '>=', $startDate)->rejected()->count(),
                'paid_claims' => InsuranceClaim::where('submitted_date', '>=', $startDate)->paid()->count(),
                'total_claim_amount' => InsuranceClaim::where('submitted_date', '>=', $startDate)->sum('claim_amount'),
                'total_approved_amount' => InsuranceClaim::where('submitted_date', '>=', $startDate)->sum('approved_amount'),
                'approval_rate' => InsuranceClaim::where('submitted_date', '>=', $startDate)->count() > 0 
                    ? (InsuranceClaim::where('submitted_date', '>=', $startDate)->approved()->count() / InsuranceClaim::where('submitted_date', '>=', $startDate)->count()) * 100 
                    : 0,
                'insurance_providers' => InsuranceClaim::where('submitted_date', '>=', $startDate)
                    ->selectRaw('insurance_provider, COUNT(*) as count, SUM(claim_amount) as total_amount')
                    ->groupBy('insurance_provider')
                    ->orderBy('total_amount', 'desc')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get insurance providers.
     */
    public function getInsuranceProviders(): JsonResponse
    {
        try {
            $providers = InsuranceClaim::select('insurance_provider')
                ->distinct()
                ->orderBy('insurance_provider')
                ->pluck('insurance_provider');

            return response()->json([
                'success' => true,
                'data' => $providers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load insurance providers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
