<template>
  <div class="invoice-list">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Invoice Management</h1>
      <button @click="createInvoice" class="add-btn">
        <i class="fas fa-plus"></i>
        Create Invoice
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search invoices..."
          class="search-input"
        >
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
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

    <!-- Invoice Table -->
    <div class="invoice-table">
      <div class="table-header">
        <div class="table-row">
          <div class="col-invoice">Invoice #</div>
          <div class="col-patient">Patient</div>
          <div class="col-date">Date</div>
          <div class="col-amount">Amount</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>
      </div>
      
      <div class="table-body">
        <div v-for="invoice in filteredInvoices" :key="invoice.id" class="table-row">
          <div class="col-invoice">
            <span class="invoice-number">{{ invoice.invoice_number }}</span>
          </div>
          <div class="col-patient">
            <div class="patient-info">
              <span class="patient-name">{{ invoice.patient?.name }}</span>
              <span class="patient-id">ID: {{ invoice.patient?.id }}</span>
            </div>
          </div>
          <div class="col-date">
            <span class="invoice-date">{{ formatDate(invoice.invoice_date) }}</span>
          </div>
          <div class="col-amount">
            <span class="amount">{{ formatCurrency(invoice.total_amount) }}</span>
          </div>
          <div class="col-status">
            <span :class="getStatusClass(invoice.status)">{{ invoice.status }}</span>
          </div>
          <div class="col-actions">
            <button @click="viewInvoice(invoice)" class="action-btn view">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editInvoice(invoice)" class="action-btn edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="printInvoice(invoice)" class="action-btn print">
              <i class="fas fa-print"></i>
            </button>
            <button @click="deleteInvoice(invoice.id)" class="action-btn delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button 
        @click="previousPage" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBillingStore } from '@/stores/billing'
import { formatCurrency, formatDate } from '@/utils/billingHelpers'

export default {
  name: 'InvoiceList',
  setup() {
    const router = useRouter()
    const billingStore = useBillingStore()
    
    const invoices = ref([])
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const filters = ref({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    })

    const filteredInvoices = computed(() => {
      let filtered = invoices.value

      if (filters.value.search) {
        filtered = filtered.filter(invoice =>
          invoice.invoice_number.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          invoice.patient?.name.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }

      if (filters.value.status) {
        filtered = filtered.filter(invoice => invoice.status === filters.value.status)
      }

      if (filters.value.dateFrom) {
        filtered = filtered.filter(invoice => 
          new Date(invoice.invoice_date) >= new Date(filters.value.dateFrom)
        )
      }

      if (filters.value.dateTo) {
        filtered = filtered.filter(invoice => 
          new Date(invoice.invoice_date) <= new Date(filters.value.dateTo)
        )
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredInvoices.value.length / itemsPerPage.value)
    })

    const loadInvoices = async () => {
      try {
        await billingStore.fetchInvoices()
        invoices.value = billingStore.invoices
      } catch (error) {
        console.error('Error loading invoices:', error)
      }
    }

    const createInvoice = () => {
      router.push('/billing/invoices/create')
    }

    const viewInvoice = (invoice) => {
      router.push(`/billing/invoices/${invoice.id}`)
    }

    const editInvoice = (invoice) => {
      router.push(`/billing/invoices/${invoice.id}/edit`)
    }

    const printInvoice = (invoice) => {
      window.open(`/billing/invoices/${invoice.id}/print`, '_blank')
    }

    const deleteInvoice = async (invoiceId) => {
      if (confirm('Are you sure you want to delete this invoice?')) {
        try {
          await billingStore.deleteInvoice(invoiceId)
          await loadInvoices()
        } catch (error) {
          console.error('Error deleting invoice:', error)
        }
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

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    onMounted(() => {
      loadInvoices()
    })

    return {
      invoices,
      filters,
      filteredInvoices,
      currentPage,
      totalPages,
      createInvoice,
      viewInvoice,
      editInvoice,
      printInvoice,
      deleteInvoice,
      getStatusClass,
      previousPage,
      nextPage,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
