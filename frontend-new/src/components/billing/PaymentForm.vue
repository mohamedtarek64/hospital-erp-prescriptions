<template>
  <div class="payment-form">
    <div class="form-header">
      <h3>Record Payment</h3>
      <button @click="$emit('close')" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <form @submit.prevent="submitPayment" class="payment-form-content">
      <!-- Invoice Selection -->
      <div class="form-group">
        <label>Invoice *</label>
        <select v-model="paymentData.invoice_id" @change="loadInvoiceDetails" required>
          <option value="">Select Invoice</option>
          <option v-for="invoice in invoices" :key="invoice.id" :value="invoice.id">
            {{ invoice.invoice_number }} - {{ invoice.patient?.name }} - {{ formatCurrency(invoice.total_amount) }}
          </option>
        </select>
      </div>

      <!-- Invoice Details -->
      <div v-if="selectedInvoice" class="invoice-details">
        <div class="invoice-info">
          <h4>Invoice Details</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Invoice Number:</span>
              <span class="value">{{ selectedInvoice.invoice_number }}</span>
            </div>
            <div class="info-item">
              <span class="label">Patient:</span>
              <span class="value">{{ selectedInvoice.patient?.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total Amount:</span>
              <span class="value">{{ formatCurrency(selectedInvoice.total_amount) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Paid Amount:</span>
              <span class="value">{{ formatCurrency(totalPaid) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Outstanding Balance:</span>
              <span class="value outstanding">{{ formatCurrency(outstandingBalance) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Details -->
      <div class="form-group">
        <label>Payment Date *</label>
        <input v-model="paymentData.payment_date" type="date" required>
      </div>

      <div class="form-group">
        <label>Payment Amount *</label>
        <div class="amount-input-group">
          <input 
            v-model="paymentData.amount" 
            type="number" 
            step="0.01" 
            :max="outstandingBalance"
            required
            class="amount-input"
          >
          <button @click="payFullAmount" type="button" class="full-amount-btn">
            Pay Full Amount
          </button>
        </div>
        <div class="amount-help">
          Maximum: {{ formatCurrency(outstandingBalance) }}
        </div>
      </div>

      <div class="form-group">
        <label>Payment Method *</label>
        <select v-model="paymentData.payment_method" required>
          <option value="">Select Method</option>
          <option value="cash">Cash</option>
          <option value="card">Credit/Debit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
          <option value="insurance">Insurance</option>
        </select>
      </div>

      <!-- Reference Number -->
      <div class="form-group">
        <label>Reference Number</label>
        <input 
          v-model="paymentData.reference_number" 
          type="text" 
          :placeholder="getReferencePlaceholder()"
        >
        <div class="help-text">
          {{ getReferenceHelpText() }}
        </div>
      </div>

      <!-- Payment Notes -->
      <div class="form-group">
        <label>Notes</label>
        <textarea 
          v-model="paymentData.notes" 
          rows="3" 
          placeholder="Additional payment notes..."
        ></textarea>
      </div>

      <!-- Payment Summary -->
      <div v-if="paymentData.amount" class="payment-summary">
        <h4>Payment Summary</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Payment Amount:</span>
            <span class="value">{{ formatCurrency(paymentData.amount) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Payment Method:</span>
            <span class="value">{{ paymentData.payment_method }}</span>
          </div>
          <div v-if="paymentData.reference_number" class="summary-item">
            <span class="label">Reference:</span>
            <span class="value">{{ paymentData.reference_number }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Remaining Balance:</span>
            <span class="value">{{ formatCurrency(remainingBalance) }}</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="cancel-btn">
          Cancel
        </button>
        <button type="submit" :disabled="!isFormValid" class="submit-btn">
          <i class="fas fa-credit-card"></i>
          Record Payment
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useBillingStore } from '@/stores/billing'
import { formatCurrency } from '@/utils/billingHelpers'

export default {
  name: 'PaymentForm',
  props: {
    invoiceId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const billingStore = useBillingStore()
    
    const invoices = ref([])
    const selectedInvoice = ref(null)

    const paymentData = ref({
      invoice_id: props.invoiceId || '',
      payment_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_method: '',
      reference_number: '',
      notes: ''
    })

    const totalPaid = computed(() => {
      if (!selectedInvoice.value?.payments) return 0
      return selectedInvoice.value.payments.reduce((sum, payment) => sum + payment.amount, 0)
    })

    const outstandingBalance = computed(() => {
      if (!selectedInvoice.value) return 0
      return selectedInvoice.value.total_amount - totalPaid.value
    })

    const remainingBalance = computed(() => {
      const paymentAmount = parseFloat(paymentData.value.amount) || 0
      return outstandingBalance.value - paymentAmount
    })

    const isFormValid = computed(() => {
      return paymentData.value.invoice_id && 
             paymentData.value.payment_date && 
             paymentData.value.amount && 
             paymentData.value.payment_method &&
             parseFloat(paymentData.value.amount) > 0 &&
             parseFloat(paymentData.value.amount) <= outstandingBalance.value
    })

    const loadInvoices = async () => {
      try {
        await billingStore.fetchInvoices()
        invoices.value = billingStore.invoices.filter(invoice => 
          invoice.status !== 'cancelled' && invoice.total_amount > 0
        )
      } catch (error) {
        console.error('Error loading invoices:', error)
      }
    }

    const loadInvoiceDetails = async () => {
      if (paymentData.value.invoice_id) {
        try {
          await billingStore.fetchInvoice(paymentData.value.invoice_id)
          selectedInvoice.value = billingStore.currentInvoice
        } catch (error) {
          console.error('Error loading invoice details:', error)
        }
      } else {
        selectedInvoice.value = null
      }
    }

    const payFullAmount = () => {
      paymentData.value.amount = outstandingBalance.value
    }

    const getReferencePlaceholder = () => {
      const placeholders = {
        cash: 'Receipt number',
        card: 'Transaction ID',
        bank_transfer: 'Transaction reference',
        check: 'Check number',
        insurance: 'Claim number'
      }
      return placeholders[paymentData.value.payment_method] || 'Reference number'
    }

    const getReferenceHelpText = () => {
      const helpTexts = {
        cash: 'Enter the receipt number for cash payment',
        card: 'Enter the transaction ID from the card terminal',
        bank_transfer: 'Enter the bank transaction reference number',
        check: 'Enter the check number',
        insurance: 'Enter the insurance claim number'
      }
      return helpTexts[paymentData.value.payment_method] || ''
    }

    const submitPayment = async () => {
      try {
        await billingStore.createPayment(paymentData.value)
        emit('success', paymentData.value)
        emit('close')
      } catch (error) {
        console.error('Error recording payment:', error)
      }
    }

    // Watch for invoice ID prop change
    watch(() => props.invoiceId, (newInvoiceId) => {
      if (newInvoiceId) {
        paymentData.value.invoice_id = newInvoiceId
        loadInvoiceDetails()
      }
    })

    onMounted(() => {
      loadInvoices()
      if (props.invoiceId) {
        loadInvoiceDetails()
      }
    })

    return {
      invoices,
      selectedInvoice,
      paymentData,
      totalPaid,
      outstandingBalance,
      remainingBalance,
      isFormValid,
      loadInvoiceDetails,
      payFullAmount,
      getReferencePlaceholder,
      getReferenceHelpText,
      submitPayment,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
