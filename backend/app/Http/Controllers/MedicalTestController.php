<?php

namespace App\Http\Controllers;

use App\Models\MedicalTest;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class MedicalTestController extends Controller
{
    /**
     * Display a listing of medical tests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MedicalTest::with(['medicalRecord.patient', 'medicalRecord.doctor']);

        // Filter by medical record
        if ($request->has('medical_record_id')) {
            $query->where('medical_record_id', $request->medical_record_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by test type
        if ($request->has('test_type')) {
            $query->where('test_type', $request->test_type);
        }

        // Filter by test name
        if ($request->has('test_name')) {
            $query->where('test_name', 'like', '%' . $request->test_name . '%');
        }

        $medicalTests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $medicalTests
        ]);
    }

    /**
     * Store a newly created medical test.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'medical_record_id' => 'required|exists:medical_records,id',
            'test_name' => 'required|string|max:255',
            'test_type' => 'required|string|max:255',
            'normal_range' => 'nullable|string|max:255',
            'test_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalTest = MedicalTest::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Medical test created successfully',
                'data' => $medicalTest->load(['medicalRecord.patient', 'medicalRecord.doctor'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create medical test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified medical test.
     */
    public function show(MedicalTest $medicalTest): JsonResponse
    {
        $medicalTest->load(['medicalRecord.patient', 'medicalRecord.doctor']);

        return response()->json([
            'success' => true,
            'data' => $medicalTest
        ]);
    }

    /**
     * Update the specified medical test.
     */
    public function update(Request $request, MedicalTest $medicalTest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'test_name' => 'sometimes|required|string|max:255',
            'test_type' => 'sometimes|required|string|max:255',
            'results' => 'nullable|string',
            'normal_range' => 'nullable|string|max:255',
            'status' => 'sometimes|in:pending,completed,cancelled',
            'test_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalTest->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Medical test updated successfully',
                'data' => $medicalTest->load(['medicalRecord.patient', 'medicalRecord.doctor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update medical test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified medical test.
     */
    public function destroy(MedicalTest $medicalTest): JsonResponse
    {
        try {
            $medicalTest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Medical test deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medical test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update test results.
     */
    public function updateResults(Request $request, MedicalTest $medicalTest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'results' => 'required|string',
            'test_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalTest->update([
                'results' => $request->results,
                'test_date' => $request->test_date ?? now(),
                'status' => 'completed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test results updated successfully',
                'data' => $medicalTest->load(['medicalRecord.patient', 'medicalRecord.doctor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update test results',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending tests.
     */
    public function getPendingTests(): JsonResponse
    {
        $pendingTests = MedicalTest::where('status', 'pending')
            ->with(['medicalRecord.patient', 'medicalRecord.doctor'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendingTests
        ]);
    }
}
