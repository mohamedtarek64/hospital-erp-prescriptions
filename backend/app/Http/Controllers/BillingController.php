<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    /**
     * Display billing dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $data = [
                'total_invoices' => Invoice::count(),
                'pending_invoices' => Invoice::whereIn('status', ['draft', 'sent'])->count(),
                'overdue_invoices' => Invoice::overdue()->count(),
                'paid_invoices' => Invoice::paid()->count(),
                'total_revenue' => Payment::sum('amount'),
                'outstanding_amount' => Invoice::where('status', '!=', 'paid')->sum('balance_amount'),
                'recent_payments' => Payment::with(['invoice.patient', 'receiver'])
                    ->orderBy('payment_date', 'desc')
                    ->limit(10)
                    ->get(),
                'overdue_invoices_list' => Invoice::overdue()->with('patient')->get(),
                'monthly_revenue' => Payment::whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year)
                    ->sum('amount')
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load billing dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invoices with filters.
     */
    public function getInvoices(Request $request): JsonResponse
    {
        try {
            $query = Invoice::with(['patient', 'creator', 'items.service']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('date_from')) {
                $query->whereDate('invoice_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('invoice_date', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('name', 'like', "%{$search}%")
                                     ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $invoices = $query->orderBy('invoice_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load invoices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new invoice.
     */
    public function createInvoice(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:services,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
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
            DB::beginTransaction();

            // Create invoice
            $invoice = Invoice::create([
                'patient_id' => $request->patient_id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'invoice_date' => $request->invoice_date,
                'due_date' => $request->due_date,
                'discount_amount' => $request->discount_amount ?? 0,
                'notes' => $request->notes,
                'created_by' => auth()->id()
            ]);

            // Create invoice items
            $subtotal = 0;
            foreach ($request->items as $item) {
                $totalPrice = $item['quantity'] * $item['unit_price'];
                $subtotal += $totalPrice;

                $invoice->items()->create([
                    'service_id' => $item['service_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $totalPrice,
                    'description' => $item['description'] ?? null
                ]);
            }

            // Calculate totals
            $invoice->calculateTotals();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data' => $invoice->load(['patient', 'items.service', 'creator'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update invoice status.
     */
    public function updateInvoiceStatus(Request $request, Invoice $invoice): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,sent,paid,overdue,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $invoice->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Invoice status updated successfully',
                'data' => $invoice->load(['patient', 'items.service'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update invoice status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record payment for invoice.
     */
    public function recordPayment(Request $request, Invoice $invoice): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,bank_transfer,cheque,insurance',
            'reference_number' => 'nullable|string',
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
            DB::beginTransaction();

            // Create payment record
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
                'received_by' => auth()->id()
            ]);

            // Update invoice paid amount
            $invoice->increment('paid_amount', $request->amount);
            $invoice->decrement('balance_amount', $request->amount);

            // Update invoice status if fully paid
            if ($invoice->fresh()->isFullyPaid()) {
                $invoice->update(['status' => 'paid']);
            } elseif ($invoice->fresh()->isPartiallyPaid()) {
                $invoice->update(['status' => 'sent']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => $payment->load(['invoice.patient', 'receiver'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history.
     */
    public function getPaymentHistory(Request $request): JsonResponse
    {
        try {
            $query = Payment::with(['invoice.patient', 'receiver']);

            if ($request->has('date_from')) {
                $query->whereDate('payment_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('payment_date', '<=', $request->date_to);
            }

            if ($request->has('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->has('patient_id')) {
                $query->whereHas('invoice', function ($q) use ($request) {
                    $q->where('patient_id', $request->patient_id);
                });
            }

            $payments = $query->orderBy('payment_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load payment history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_revenue' => Payment::where('payment_date', '>=', $startDate)->sum('amount'),
                'total_invoices' => Invoice::where('invoice_date', '>=', $startDate)->count(),
                'paid_invoices' => Invoice::where('invoice_date', '>=', $startDate)->paid()->count(),
                'outstanding_amount' => Invoice::where('invoice_date', '>=', $startDate)
                    ->where('status', '!=', 'paid')
                    ->sum('balance_amount'),
                'payment_methods' => Payment::where('payment_date', '>=', $startDate)
                    ->selectRaw('payment_method, SUM(amount) as total')
                    ->groupBy('payment_method')
                    ->get(),
                'daily_revenue' => Payment::where('payment_date', '>=', $startDate)
                    ->selectRaw('DATE(payment_date) as date, SUM(amount) as total')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
                'top_services' => DB::table('invoice_items')
                    ->join('services', 'invoice_items.service_id', '=', 'services.id')
                    ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
                    ->where('invoices.invoice_date', '>=', $startDate)
                    ->selectRaw('services.name, SUM(invoice_items.total_price) as total_revenue, COUNT(*) as count')
                    ->groupBy('services.id', 'services.name')
                    ->orderBy('total_revenue', 'desc')
                    ->limit(10)
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
}
