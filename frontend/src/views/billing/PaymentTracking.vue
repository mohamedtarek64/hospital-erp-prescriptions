<template>
  <div class="payment-tracking">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Payment Tracking</h1>
      <button @click="recordPayment" class="add-btn">
        <i class="fas fa-plus"></i>
        Record Payment
      </button>
    </div>

    <!-- Payment Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign text-green-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ formatCurrency(stats.totalReceived) }}</h3>
          <p class="stat-label">Total Received</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock text-yellow-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ formatCurrency(stats.pendingAmount) }}</h3>
          <p class="stat-label">Pending Payments</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ formatCurrency(stats.overdueAmount) }}</h3>
          <p class="stat-label">Overdue Amount</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chart-line text-blue-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.paymentCount }}</h3>
          <p class="stat-label">Total Payments</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search payments..."
          class="search-input"
        >
        <select v-model="filters.method" class="filter-select">
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
          <option value="insurance">Insurance</option>
        </select>
        <input 
          v-model="filters.dateFrom" 
          type="date" 
          class="filter-input"
          placeholder="From Date"
        >
        <input 
          v-model="filters.dateTo" 
          type="date" 
          class="filter-input"
          placeholder="To Date"
        >
      </div>
    </div>

    <!-- Payments Table -->
    <div class="payments-table">
      <div class="table-header">
        <div class="table-row">
          <div class="col-date">Date</div>
          <div class="col-invoice">Invoice</div>
          <div class="col-patient">Patient</div>
          <div class="col-amount">Amount</div>
          <div class="col-method">Method</div>
          <div class="col-reference">Reference</div>
          <div class="col-actions">Actions</div>
        </div>
      </div>
      
      <div class="table-body">
        <div v-for="payment in filteredPayments" :key="payment.id" class="table-row">
          <div class="col-date">
            <span class="payment-date">{{ formatDate(payment.payment_date) }}</span>
          </div>
          <div class="col-invoice">
            <span class="invoice-number">{{ payment.invoice?.invoice_number }}</span>
          </div>
          <div class="col-patient">
            <div class="patient-info">
              <span class="patient-name">{{ payment.invoice?.patient?.name }}</span>
            </div>
          </div>
          <div class="col-amount">
            <span class="amount">{{ formatCurrency(payment.amount) }}</span>
          </div>
          <div class="col-method">
            <span :class="getMethodClass(payment.payment_method)">{{ payment.payment_method }}</span>
          </div>
          <div class="col-reference">
            <span class="reference">{{ payment.reference_number }}</span>
          </div>
          <div class="col-actions">
            <button @click="viewPayment(payment)" class="action-btn view">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editPayment(payment)" class="action-btn edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deletePayment(payment.id)" class="action-btn delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Record Payment</h2>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="savePayment" class="payment-form">
          <div class="form-group">
            <label>Invoice *</label>
            <select v-model="paymentForm.invoice_id" required>
              <option value="">Select Invoice</option>
              <option v-for="invoice in pendingInvoices" :key="invoice.id" :value="invoice.id">
                {{ invoice.invoice_number }} - {{ invoice.patient?.name }} - {{ formatCurrency(invoice.total_amount) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Payment Date *</label>
            <input v-model="paymentForm.payment_date" type="date" required>
          </div>

          <div class="form-group">
            <label>Amount *</label>
            <input v-model="paymentForm.amount" type="number" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Payment Method *</label>
            <select v-model="paymentForm.payment_method" required>
              <option value="">Select Method</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>

          <div class="form-group">
            <label>Reference Number</label>
            <input v-model="paymentForm.reference_number" type="text" placeholder="Transaction ID, Check Number, etc.">
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="paymentForm.notes" rows="3" placeholder="Additional notes..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useBillingStore } from '@/stores/billing'
import { usePaymentsStore } from '@/stores/payments'
import { formatCurrency, formatDate } from '@/utils/billingHelpers'

export default {
  name: 'PaymentTracking',
  setup() {
    // const router = useRouter()
    const billingStore = useBillingStore()
    const paymentsStore = usePaymentsStore()
    
    const payments = ref([])
    const pendingInvoices = ref([])
    const showPaymentModal = ref(false)

    const stats = ref({
      totalReceived: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      paymentCount: 0
    })

    const filters = ref({
      search: '',
      method: '',
      dateFrom: '',
      dateTo: ''
    })

    const paymentForm = ref({
      invoice_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_method: '',
      reference_number: '',
      notes: ''
    })

    const filteredPayments = computed(() => {
      let filtered = payments.value

      if (filters.value.search) {
        filtered = filtered.filter(payment =>
          payment.invoice?.invoice_number.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          payment.invoice?.patient?.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          payment.reference_number.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }

      if (filters.value.method) {
        filtered = filtered.filter(payment => payment.payment_method === filters.value.method)
      }

      if (filters.value.dateFrom) {
        filtered = filtered.filter(payment => 
          new Date(payment.payment_date) >= new Date(filters.value.dateFrom)
        )
      }

      if (filters.value.dateTo) {
        filtered = filtered.filter(payment => 
          new Date(payment.payment_date) <= new Date(filters.value.dateTo)
        )
      }

      return filtered
    })

    const loadData = async () => {
      try {
        await Promise.all([
          paymentsStore.fetchPayments(),
          billingStore.fetchPendingInvoices()
        ])
        payments.value = paymentsStore.payments
        pendingInvoices.value = billingStore.pendingInvoices
        calculateStats()
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const calculateStats = () => {
      stats.value.totalReceived = payments.value.reduce((sum, payment) => sum + payment.amount, 0)
      stats.value.paymentCount = payments.value.length
      
      // Calculate pending and overdue amounts from invoices
      const pendingInvoices = billingStore.invoices.filter(inv => inv.status === 'sent')
      const overdueInvoices = billingStore.invoices.filter(inv => inv.status === 'overdue')
      
      stats.value.pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
      stats.value.overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    }

    const recordPayment = () => {
      showPaymentModal.value = true
    }

    const closeModal = () => {
      showPaymentModal.value = false
      paymentForm.value = {
        invoice_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: '',
        reference_number: '',
        notes: ''
      }
    }

    const savePayment = async () => {
      try {
        await paymentsStore.createPayment(paymentForm.value)
        await loadData()
        closeModal()
      } catch (error) {
        console.error('Error saving payment:', error)
      }
    }

    const viewPayment = (payment) => {
      // Navigate to payment details
      console.log('View payment:', payment)
    }

    const editPayment = (payment) => {
      // Navigate to edit payment
      console.log('Edit payment:', payment)
    }

    const deletePayment = async (paymentId) => {
      if (confirm('Are you sure you want to delete this payment?')) {
        try {
          await paymentsStore.deletePayment(paymentId)
          await loadData()
        } catch (error) {
          console.error('Error deleting payment:', error)
        }
      }
    }

    const getMethodClass = (method) => {
      const classes = {
        cash: 'method-cash',
        card: 'method-card',
        bank_transfer: 'method-transfer',
        check: 'method-check',
        insurance: 'method-insurance'
      }
      return classes[method] || 'method-default'
    }

    onMounted(() => {
      loadData()
    })

    return {
      payments,
      pendingInvoices,
      stats,
      filters,
      paymentForm,
      filteredPayments,
      showPaymentModal,
      recordPayment,
      closeModal,
      savePayment,
      viewPayment,
      editPayment,
      deletePayment,
      getMethodClass,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
