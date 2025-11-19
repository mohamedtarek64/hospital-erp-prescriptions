<template>
  <div class="invoice-view">
    <div class="invoice-header">
      <div class="header-content">
        <h1 class="invoice-title">Invoice #{{ invoice.invoice_number }}</h1>
        <div class="invoice-status">
          <span :class="getStatusClass(invoice.status)">{{ invoice.status }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button @click="printInvoice" class="action-btn print">
          <i class="fas fa-print"></i>
          Print
        </button>
        <button @click="editInvoice" class="action-btn edit">
          <i class="fas fa-edit"></i>
          Edit
        </button>
        <button @click="sendInvoice" class="action-btn send">
          <i class="fas fa-paper-plane"></i>
          Send
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      Loading invoice...
    </div>

    <div v-else-if="invoice" class="invoice-content">
      <!-- Invoice Details -->
      <div class="invoice-details">
        <div class="invoice-info">
          <div class="info-section">
            <h3>Invoice Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Invoice Number:</label>
                <span>{{ invoice.invoice_number }}</span>
              </div>
              <div class="info-item">
                <label>Invoice Date:</label>
                <span>{{ formatDate(invoice.invoice_date) }}</span>
              </div>
              <div class="info-item">
                <label>Due Date:</label>
                <span>{{ formatDate(invoice.due_date) }}</span>
              </div>
              <div class="info-item">
                <label>Status:</label>
                <span :class="getStatusClass(invoice.status)">{{ invoice.status }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Patient Information</h3>
            <div class="patient-details">
              <div class="patient-name">{{ invoice.patient?.name }}</div>
              <div class="patient-info">
                <span>ID: {{ invoice.patient?.id }}</span>
                <span>Phone: {{ invoice.patient?.phone }}</span>
                <span>Email: {{ invoice.patient?.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="invoice-items">
        <h3>Services</h3>
        <div class="items-table">
          <div class="table-header">
            <div class="col-service">Service</div>
            <div class="col-quantity">Qty</div>
            <div class="col-price">Unit Price</div>
            <div class="col-total">Total</div>
          </div>
          <div class="table-body">
            <div v-for="item in invoice.items" :key="item.id" class="table-row">
              <div class="col-service">
                <span class="service-name">{{ item.service?.name }}</span>
                <span class="service-description">{{ item.service?.description }}</span>
              </div>
              <div class="col-quantity">{{ item.quantity }}</div>
              <div class="col-price">{{ formatCurrency(item.unit_price) }}</div>
              <div class="col-total">{{ formatCurrency(item.total_price) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Totals -->
      <div class="invoice-totals">
        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">{{ formatCurrency(invoice.subtotal) }}</span>
          </div>
          <div v-if="invoice.discount_amount > 0" class="total-row">
            <span class="total-label">Discount:</span>
            <span class="total-value">-{{ formatCurrency(invoice.discount_amount) }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax ({{ invoice.tax_rate }}%):</span>
            <span class="total-value">{{ formatCurrency(invoice.tax_amount) }}</span>
          </div>
          <div class="total-row total-final">
            <span class="total-label">Total Amount:</span>
            <span class="total-value">{{ formatCurrency(invoice.total_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div v-if="invoice.payments && invoice.payments.length > 0" class="payment-info">
        <h3>Payment History</h3>
        <div class="payments-list">
          <div v-for="payment in invoice.payments" :key="payment.id" class="payment-item">
            <div class="payment-details">
              <span class="payment-date">{{ formatDate(payment.payment_date) }}</span>
              <span class="payment-method">{{ payment.payment_method }}</span>
              <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
            </div>
            <div class="payment-reference">
              Ref: {{ payment.reference_number }}
            </div>
          </div>
        </div>
        <div class="payment-summary">
          <div class="total-row">
            <span class="total-label">Total Paid:</span>
            <span class="total-value">{{ formatCurrency(totalPaid) }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Outstanding Balance:</span>
            <span class="total-value">{{ formatCurrency(outstandingBalance) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="invoice.notes" class="invoice-notes">
        <h3>Notes</h3>
        <p class="notes-content">{{ invoice.notes }}</p>
      </div>
    </div>

    <div v-else class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      Invoice not found
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillingStore } from '@/stores/billing'
import { formatCurrency, formatDate } from '@/utils/billingHelpers'

export default {
  name: 'InvoiceView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const billingStore = useBillingStore()
    
    const invoice = ref(null)
    const loading = ref(true)

    const totalPaid = computed(() => {
      if (!invoice.value?.payments) return 0
      return invoice.value.payments.reduce((sum, payment) => sum + payment.amount, 0)
    })

    const outstandingBalance = computed(() => {
      if (!invoice.value) return 0
      return invoice.value.total_amount - totalPaid.value
    })

    const loadInvoice = async () => {
      try {
        const invoiceId = route.params.id
        await billingStore.fetchInvoice(invoiceId)
        invoice.value = billingStore.currentInvoice
      } catch (error) {
        console.error('Error loading invoice:', error)
      } finally {
        loading.value = false
      }
    }

    const printInvoice = () => {
      window.open(`/billing/invoices/${invoice.value.id}/print`, '_blank')
    }

    const editInvoice = () => {
      router.push(`/billing/invoices/${invoice.value.id}/edit`)
    }

    const sendInvoice = async () => {
      try {
        await billingStore.sendInvoice(invoice.value.id)
        await loadInvoice() // Reload to get updated status
      } catch (error) {
        console.error('Error sending invoice:', error)
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        draft: 'status-draft',
        sent: 'status-sent',
        paid: 'status-paid',
        overdue: 'status-overdue',
        cancelled: 'status-cancelled'
      }
      return classes[status] || 'status-draft'
    }

    onMounted(() => {
      loadInvoice()
    })

    return {
      invoice,
      loading,
      totalPaid,
      outstandingBalance,
      printInvoice,
      editInvoice,
      sendInvoice,
      getStatusClass,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
