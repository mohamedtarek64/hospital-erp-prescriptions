<template>
  <div class="invoice-card">
    <div class="card-header">
      <div class="invoice-info">
        <h3 class="invoice-number">{{ invoice.invoice_number }}</h3>
        <span class="invoice-date">{{ formatDate(invoice.invoice_date) }}</span>
      </div>
      <div class="invoice-status">
        <span :class="getStatusClass(invoice.status)">{{ invoice.status }}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="patient-info">
        <div class="patient-name">{{ invoice.patient?.name }}</div>
        <div class="patient-details">
          <span>ID: {{ invoice.patient?.id }}</span>
          <span>Phone: {{ invoice.patient?.phone }}</span>
        </div>
      </div>

      <div class="invoice-details">
        <div class="detail-row">
          <span class="label">Due Date:</span>
          <span class="value">{{ formatDate(invoice.due_date) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Amount:</span>
          <span class="value amount">{{ formatCurrency(invoice.total_amount) }}</span>
        </div>
        <div v-if="invoice.payments && invoice.payments.length > 0" class="detail-row">
          <span class="label">Paid Amount:</span>
          <span class="value paid">{{ formatCurrency(totalPaid) }}</span>
        </div>
        <div v-if="outstandingBalance > 0" class="detail-row">
          <span class="label">Outstanding:</span>
          <span class="value outstanding">{{ formatCurrency(outstandingBalance) }}</span>
        </div>
      </div>

      <div v-if="invoice.items && invoice.items.length > 0" class="invoice-items">
        <div class="items-header">Services:</div>
        <div class="items-list">
          <div v-for="item in invoice.items.slice(0, 3)" :key="item.id" class="item">
            <span class="item-name">{{ item.service?.name }}</span>
            <span class="item-amount">{{ formatCurrency(item.total_price) }}</span>
          </div>
          <div v-if="invoice.items.length > 3" class="more-items">
            +{{ invoice.items.length - 3 }} more items
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-actions">
        <button @click="viewInvoice" class="action-btn view">
          <i class="fas fa-eye"></i>
          View
        </button>
        <button @click="editInvoice" class="action-btn edit">
          <i class="fas fa-edit"></i>
          Edit
        </button>
        <button @click="printInvoice" class="action-btn print">
          <i class="fas fa-print"></i>
          Print
        </button>
        <button v-if="outstandingBalance > 0" @click="recordPayment" class="action-btn payment">
          <i class="fas fa-credit-card"></i>
          Payment
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatCurrency, formatDate } from '@/utils/billingHelpers'

export default {
  name: 'InvoiceCard',
  props: {
    invoice: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'edit', 'print', 'payment'],
  setup(props, { emit }) {
    const router = useRouter()

    const totalPaid = computed(() => {
      if (!props.invoice.payments) return 0
      return props.invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
    })

    const outstandingBalance = computed(() => {
      return props.invoice.total_amount - totalPaid.value
    })

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

    const viewInvoice = () => {
      emit('view', props.invoice)
      router.push(`/billing/invoices/${props.invoice.id}`)
    }

    const editInvoice = () => {
      emit('edit', props.invoice)
      router.push(`/billing/invoices/${props.invoice.id}/edit`)
    }

    const printInvoice = () => {
      emit('print', props.invoice)
      window.open(`/billing/invoices/${props.invoice.id}/print`, '_blank')
    }

    const recordPayment = () => {
      emit('payment', props.invoice)
      router.push(`/billing/payments/create?invoice_id=${props.invoice.id}`)
    }

    return {
      totalPaid,
      outstandingBalance,
      getStatusClass,
      viewInvoice,
      editInvoice,
      printInvoice,
      recordPayment,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
