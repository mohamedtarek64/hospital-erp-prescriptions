<template>
  <div class="invoice-create">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Create Invoice</h1>
      <div class="header-actions">
        <button @click="saveDraft" class="btn-secondary">
          <i class="fas fa-save"></i>
          Save Draft
        </button>
        <button @click="previewInvoice" class="btn-secondary">
          <i class="fas fa-eye"></i>
          Preview
        </button>
      </div>
    </div>

    <form @submit.prevent="createInvoice" class="invoice-form">
      <!-- Patient Selection -->
      <div class="form-section">
        <h2 class="section-title">Patient Information</h2>
        <div class="form-group">
          <label>Select Patient *</label>
          <div class="patient-selector">
            <input 
              v-model="patientSearch" 
              type="text" 
              placeholder="Search patients..."
              class="search-input"
              @input="searchPatients"
            >
            <div v-if="patientSearch && filteredPatients.length" class="patient-dropdown">
              <div 
                v-for="patient in filteredPatients" 
                :key="patient.id"
                @click="selectPatient(patient)"
                class="patient-option"
              >
                <span class="patient-name">{{ patient.name }}</span>
                <span class="patient-id">ID: {{ patient.id }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedPatient" class="selected-patient">
            <span class="patient-name">{{ selectedPatient.name }}</span>
            <button @click="clearPatient" type="button" class="clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Invoice Details -->
      <div class="form-section">
        <h2 class="section-title">Invoice Details</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Invoice Number</label>
            <input v-model="invoiceForm.invoice_number" type="text" readonly>
          </div>
          <div class="form-group">
            <label>Invoice Date *</label>
            <input v-model="invoiceForm.invoice_date" type="date" required>
          </div>
          <div class="form-group">
            <label>Due Date *</label>
            <input v-model="invoiceForm.due_date" type="date" required>
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="invoiceForm.notes" rows="3" placeholder="Additional notes..."></textarea>
        </div>
      </div>

      <!-- Services -->
      <div class="form-section">
        <h2 class="section-title">Services</h2>
        <div class="services-list">
          <div v-for="(item, index) in invoiceForm.items" :key="index" class="service-item">
            <div class="service-selector">
              <select v-model="item.service_id" @change="updateServicePrice(index)" class="service-select">
                <option value="">Select Service</option>
                <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.name }} - {{ formatCurrency(service.price) }}
                </option>
              </select>
            </div>
            <div class="service-details">
              <input 
                v-model="item.quantity" 
                type="number" 
                min="1" 
                @input="calculateItemTotal(index)"
                class="quantity-input"
                placeholder="Qty"
              >
              <input 
                v-model="item.unit_price" 
                type="number" 
                step="0.01" 
                @input="calculateItemTotal(index)"
                class="price-input"
                placeholder="Price"
              >
              <span class="total-price">{{ formatCurrency(item.total_price) }}</span>
            </div>
            <button @click="removeService(index)" type="button" class="remove-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <button @click="addService" type="button" class="add-service-btn">
          <i class="fas fa-plus"></i>
          Add Service
        </button>
      </div>

      <!-- Totals -->
      <div class="form-section">
        <h2 class="section-title">Invoice Summary</h2>
        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">{{ formatCurrency(invoiceForm.subtotal) }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Discount:</span>
            <div class="discount-input">
              <input 
                v-model="invoiceForm.discount_amount" 
                type="number" 
                step="0.01" 
                @input="calculateTotals"
                class="discount-field"
                placeholder="0.00"
              >
            </div>
          </div>
          <div class="total-row">
            <span class="total-label">Tax ({{ invoiceForm.tax_rate }}%):</span>
            <span class="total-value">{{ formatCurrency(invoiceForm.tax_amount) }}</span>
          </div>
          <div class="total-row total-final">
            <span class="total-label">Total Amount:</span>
            <span class="total-value">{{ formatCurrency(invoiceForm.total_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="cancel" class="cancel-btn">Cancel</button>
        <button type="submit" class="create-btn">Create Invoice</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBillingStore } from '@/stores/billing'
import { usePatientsStore } from '@/stores/patients'
import { formatCurrency, generateInvoiceNumber } from '@/utils/billingHelpers'

export default {
  name: 'InvoiceCreate',
  setup() {
    const router = useRouter()
    const billingStore = useBillingStore()
    const patientsStore = usePatientsStore()
    
    const patients = ref([])
    const services = ref([])
    const selectedPatient = ref(null)
    const patientSearch = ref('')

    const invoiceForm = ref({
      patient_id: '',
      invoice_number: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      subtotal: 0,
      tax_rate: 10,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      notes: '',
      items: []
    })

    const filteredPatients = computed(() => {
      if (!patientSearch.value) return []
      return patients.value.filter(patient =>
        patient.name.toLowerCase().includes(patientSearch.value.toLowerCase())
      )
    })

    const loadData = async () => {
      try {
        await Promise.all([
          patientsStore.fetchPatients(),
          billingStore.fetchServices()
        ])
        patients.value = patientsStore.patients
        services.value = billingStore.services
        invoiceForm.value.invoice_number = generateInvoiceNumber()
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const searchPatients = () => {
      // Patient search is handled by computed property
    }

    const selectPatient = (patient) => {
      selectedPatient.value = patient
      invoiceForm.value.patient_id = patient.id
      patientSearch.value = ''
    }

    const clearPatient = () => {
      selectedPatient.value = null
      invoiceForm.value.patient_id = ''
    }

    const addService = () => {
      invoiceForm.value.items.push({
        service_id: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0
      })
    }

    const removeService = (index) => {
      invoiceForm.value.items.splice(index, 1)
      calculateTotals()
    }

    const updateServicePrice = (index) => {
      const service = services.value.find(s => s.id == invoiceForm.value.items[index].service_id)
      if (service) {
        invoiceForm.value.items[index].unit_price = service.price
        calculateItemTotal(index)
      }
    }

    const calculateItemTotal = (index) => {
      const item = invoiceForm.value.items[index]
      item.total_price = item.quantity * item.unit_price
      calculateTotals()
    }

    const calculateTotals = () => {
      const subtotal = invoiceForm.value.items.reduce((sum, item) => sum + item.total_price, 0)
      invoiceForm.value.subtotal = subtotal
      
      const discountAmount = parseFloat(invoiceForm.value.discount_amount) || 0
      const taxableAmount = subtotal - discountAmount
      invoiceForm.value.tax_amount = (taxableAmount * invoiceForm.value.tax_rate) / 100
      invoiceForm.value.total_amount = taxableAmount + invoiceForm.value.tax_amount
    }

    const saveDraft = async () => {
      try {
        invoiceForm.value.status = 'draft'
        await billingStore.createInvoice(invoiceForm.value)
        router.push('/billing/invoices')
      } catch (error) {
        console.error('Error saving draft:', error)
      }
    }

    const previewInvoice = () => {
      // Open preview in new window
      window.open(`/billing/invoices/preview`, '_blank')
    }

    const createInvoice = async () => {
      try {
        if (!selectedPatient.value) {
          alert('Please select a patient')
          return
        }
        
        if (invoiceForm.value.items.length === 0) {
          alert('Please add at least one service')
          return
        }

        invoiceForm.value.status = 'sent'
        await billingStore.createInvoice(invoiceForm.value)
        router.push('/billing/invoices')
      } catch (error) {
        console.error('Error creating invoice:', error)
      }
    }

    const cancel = () => {
      router.push('/billing/invoices')
    }

    onMounted(() => {
      loadData()
      addService() // Add one empty service item
    })

    return {
      patients,
      services,
      selectedPatient,
      patientSearch,
      invoiceForm,
      filteredPatients,
      searchPatients,
      selectPatient,
      clearPatient,
      addService,
      removeService,
      updateServicePrice,
      calculateItemTotal,
      saveDraft,
      previewInvoice,
      createInvoice,
      cancel,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
