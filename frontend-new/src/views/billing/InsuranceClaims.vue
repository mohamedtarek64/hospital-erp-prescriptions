<template>
  <div class="insurance-claims">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Insurance Claims</h1>
      <button @click="createClaim" class="add-btn">
        <i class="fas fa-plus"></i>
        Create Claim
      </button>
    </div>

    <!-- Claims Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-file-medical text-blue-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalClaims }}</h3>
          <p class="stat-label">Total Claims</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock text-yellow-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.pendingClaims }}</h3>
          <p class="stat-label">Pending</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle text-green-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.approvedClaims }}</h3>
          <p class="stat-label">Approved</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign text-green-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ formatCurrency(stats.totalClaimAmount) }}</h3>
          <p class="stat-label">Total Claim Amount</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search claims..."
          class="search-input"
        >
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
        <select v-model="filters.provider" class="filter-select">
          <option value="">All Providers</option>
          <option v-for="provider in insuranceProviders" :key="provider" :value="provider">
            {{ provider }}
          </option>
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

    <!-- Claims Table -->
    <div class="claims-table">
      <div class="table-header">
        <div class="table-row">
          <div class="col-claim">Claim #</div>
          <div class="col-patient">Patient</div>
          <div class="col-provider">Provider</div>
          <div class="col-amount">Amount</div>
          <div class="col-status">Status</div>
          <div class="col-date">Submitted</div>
          <div class="col-actions">Actions</div>
        </div>
      </div>
      
      <div class="table-body">
        <div v-for="claim in filteredClaims" :key="claim.id" class="table-row">
          <div class="col-claim">
            <span class="claim-number">{{ claim.claim_number }}</span>
          </div>
          <div class="col-patient">
            <div class="patient-info">
              <span class="patient-name">{{ claim.patient?.name }}</span>
              <span class="patient-id">ID: {{ claim.patient?.id }}</span>
            </div>
          </div>
          <div class="col-provider">
            <span class="provider-name">{{ claim.insurance_provider }}</span>
          </div>
          <div class="col-amount">
            <span class="claim-amount">{{ formatCurrency(claim.claim_amount) }}</span>
          </div>
          <div class="col-status">
            <span :class="getStatusClass(claim.status)">{{ claim.status }}</span>
          </div>
          <div class="col-date">
            <span class="submitted-date">{{ formatDate(claim.submitted_date) }}</span>
          </div>
          <div class="col-actions">
            <button @click="viewClaim(claim)" class="action-btn view">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editClaim(claim)" class="action-btn edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="submitClaim(claim)" v-if="claim.status === 'draft'" class="action-btn submit">
              <i class="fas fa-paper-plane"></i>
            </button>
            <button @click="deleteClaim(claim.id)" class="action-btn delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Claim Modal -->
    <div v-if="showClaimModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? 'Create Claim' : 'Edit Claim' }}</h2>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveClaim" class="claim-form">
          <div class="form-group">
            <label>Patient *</label>
            <select v-model="claimForm.patient_id" required>
              <option value="">Select Patient</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.name }} - ID: {{ patient.id }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Invoice *</label>
            <select v-model="claimForm.invoice_id" required>
              <option value="">Select Invoice</option>
              <option v-for="invoice in patientInvoices" :key="invoice.id" :value="invoice.id">
                {{ invoice.invoice_number }} - {{ formatCurrency(invoice.total_amount) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Insurance Provider *</label>
            <input v-model="claimForm.insurance_provider" type="text" required>
          </div>

          <div class="form-group">
            <label>Claim Number</label>
            <input v-model="claimForm.claim_number" type="text" placeholder="Auto-generated if empty">
          </div>

          <div class="form-group">
            <label>Claim Amount *</label>
            <input v-model="claimForm.claim_amount" type="number" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="claimForm.status">
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div class="form-group">
            <label>Submitted Date</label>
            <input v-model="claimForm.submitted_date" type="date">
          </div>

          <div class="form-group">
            <label>Approved Date</label>
            <input v-model="claimForm.approved_date" type="date">
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="claimForm.notes" rows="3" placeholder="Additional notes..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBillingStore } from '@/stores/billing'
import { usePatientsStore } from '@/stores/patients'
import { formatCurrency, formatDate, generateClaimNumber } from '@/utils/billingHelpers'

export default {
  name: 'InsuranceClaims',
  setup() {
    const router = useRouter()
    const billingStore = useBillingStore()
    const patientsStore = usePatientsStore()
    
    const claims = ref([])
    const patients = ref([])
    const patientInvoices = ref([])
    const showClaimModal = ref(false)
    const showAddModal = ref(false)
    const editingClaim = ref(null)

    const stats = ref({
      totalClaims: 0,
      pendingClaims: 0,
      approvedClaims: 0,
      totalClaimAmount: 0
    })

    const filters = ref({
      search: '',
      status: '',
      provider: '',
      dateFrom: '',
      dateTo: ''
    })

    const claimForm = ref({
      patient_id: '',
      invoice_id: '',
      insurance_provider: '',
      claim_number: '',
      claim_amount: '',
      status: 'draft',
      submitted_date: '',
      approved_date: '',
      notes: ''
    })

    const insuranceProviders = computed(() => {
      const providers = [...new Set(claims.value.map(claim => claim.insurance_provider))]
      return providers.filter(provider => provider)
    })

    const filteredClaims = computed(() => {
      let filtered = claims.value

      if (filters.value.search) {
        filtered = filtered.filter(claim =>
          claim.claim_number.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          claim.patient?.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          claim.insurance_provider.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }

      if (filters.value.status) {
        filtered = filtered.filter(claim => claim.status === filters.value.status)
      }

      if (filters.value.provider) {
        filtered = filtered.filter(claim => claim.insurance_provider === filters.value.provider)
      }

      if (filters.value.dateFrom) {
        filtered = filtered.filter(claim => 
          new Date(claim.submitted_date) >= new Date(filters.value.dateFrom)
        )
      }

      if (filters.value.dateTo) {
        filtered = filtered.filter(claim => 
          new Date(claim.submitted_date) <= new Date(filters.value.dateTo)
        )
      }

      return filtered
    })

    const loadData = async () => {
      try {
        await Promise.all([
          billingStore.fetchInsuranceClaims(),
          patientsStore.fetchPatients()
        ])
        claims.value = billingStore.insuranceClaims
        patients.value = patientsStore.patients
        calculateStats()
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const calculateStats = () => {
      stats.value.totalClaims = claims.value.length
      stats.value.pendingClaims = claims.value.filter(c => c.status === 'submitted' || c.status === 'under_review').length
      stats.value.approvedClaims = claims.value.filter(c => c.status === 'approved' || c.status === 'paid').length
      stats.value.totalClaimAmount = claims.value.reduce((sum, claim) => sum + claim.claim_amount, 0)
    }

    const createClaim = () => {
      showAddModal.value = true
      showClaimModal.value = true
      claimForm.value.claim_number = generateClaimNumber()
    }

    const editClaim = (claim) => {
      editingClaim.value = claim
      claimForm.value = { ...claim }
      showClaimModal.value = true
    }

    const viewClaim = (claim) => {
      router.push(`/billing/claims/${claim.id}`)
    }

    const submitClaim = async (claim) => {
      try {
        await billingStore.updateInsuranceClaim(claim.id, { status: 'submitted', submitted_date: new Date().toISOString().split('T')[0] })
        await loadData()
      } catch (error) {
        console.error('Error submitting claim:', error)
      }
    }

    const deleteClaim = async (claimId) => {
      if (confirm('Are you sure you want to delete this claim?')) {
        try {
          await billingStore.deleteInsuranceClaim(claimId)
          await loadData()
        } catch (error) {
          console.error('Error deleting claim:', error)
        }
      }
    }

    const saveClaim = async () => {
      try {
        if (showAddModal.value) {
          await billingStore.createInsuranceClaim(claimForm.value)
        } else {
          await billingStore.updateInsuranceClaim(editingClaim.value.id, claimForm.value)
        }
        await loadData()
        closeModal()
      } catch (error) {
        console.error('Error saving claim:', error)
      }
    }

    const closeModal = () => {
      showClaimModal.value = false
      showAddModal.value = false
      editingClaim.value = null
      claimForm.value = {
        patient_id: '',
        invoice_id: '',
        insurance_provider: '',
        claim_number: '',
        claim_amount: '',
        status: 'draft',
        submitted_date: '',
        approved_date: '',
        notes: ''
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        draft: 'status-draft',
        submitted: 'status-submitted',
        under_review: 'status-review',
        approved: 'status-approved',
        rejected: 'status-rejected',
        paid: 'status-paid'
      }
      return classes[status] || 'status-draft'
    }

    // Watch for patient selection to load invoices
    watch(() => claimForm.value.patient_id, async (patientId) => {
      if (patientId) {
        try {
          await billingStore.fetchPatientInvoices(patientId)
          patientInvoices.value = billingStore.patientInvoices
        } catch (error) {
          console.error('Error loading patient invoices:', error)
        }
      } else {
        patientInvoices.value = []
      }
    })

    onMounted(() => {
      loadData()
    })

    return {
      claims,
      patients,
      patientInvoices,
      stats,
      filters,
      claimForm,
      insuranceProviders,
      filteredClaims,
      showClaimModal,
      showAddModal,
      createClaim,
      editClaim,
      viewClaim,
      submitClaim,
      deleteClaim,
      saveClaim,
      closeModal,
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
