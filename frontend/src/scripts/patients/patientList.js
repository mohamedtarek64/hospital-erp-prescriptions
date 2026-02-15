import { ref, computed, watch } from 'vue'
import { usePatientsStore } from '@/stores/patients'
import { useRouter } from 'vue-router'

// Patient List Management Class
export class PatientListManager {
  constructor() {
    this.router = useRouter()
    this.patientsStore = usePatientsStore()
    
    // Local state
    this.searchQuery = ref('')
    this.genderFilter = ref('')
    this.bloodGroupFilter = ref('')
    this.showDeleteModal = ref(false)
    this.patientToDelete = ref(null)
    
    // Computed properties
    this.loading = computed(() => this.patientsStore.loading)
    this.error = computed(() => this.patientsStore.error)
    this.patients = computed(() => this.patientsStore.patients)
    this.hasPatients = computed(() => this.patientsStore.hasPatients)
    this.pagination = computed(() => this.patientsStore.pagination)
  }

  // Methods
  async fetchPatients(page = 1) {
    await this.patientsStore.fetchPatients(page)
  }

  handleSearch() {
    this.patientsStore.updateFilters({ search: this.searchQuery.value })
    this.fetchPatients(1)
  }

  handleFilterChange() {
    this.patientsStore.updateFilters({
      gender: this.genderFilter.value,
      blood_group: this.bloodGroupFilter.value
    })
    this.fetchPatients(1)
  }

  clearFilters() {
    this.patientsStore.clearFilters()
    this.searchQuery.value = ''
    this.genderFilter.value = ''
    this.bloodGroupFilter.value = ''
    this.fetchPatients(1)
  }

  changePage(page) {
    if (page >= 1 && page <= this.pagination.value.last_page) {
      this.fetchPatients(page)
    }
  }

  getPageNumbers() {
    const current = this.pagination.value.current_page
    const last = this.pagination.value.last_page
    const delta = 2
    const range = []
    
    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
      range.push(i)
    }
    
    if (current - delta > 2) {
      range.unshift('...')
    }
    if (current + delta < last - 1) {
      range.push('...')
    }
    
    range.unshift(1)
    if (last !== 1) {
      range.push(last)
    }
    
    return range
  }

  confirmDelete(patient) {
    this.patientToDelete.value = patient
    this.showDeleteModal.value = true
  }

  cancelDelete() {
    this.showDeleteModal.value = false
    this.patientToDelete.value = null
  }

  async deletePatient() {
    if (this.patientToDelete.value) {
      const result = await this.patientsStore.deletePatient(this.patientToDelete.value.id)
      if (result.success) {
        this.showDeleteModal.value = false
        this.patientToDelete.value = null
      }
    }
  }

  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG')
  }

  getGenderText(gender) {
    const genders = {
      male: 'ذكر',
      female: 'أنثى',
      other: 'آخر'
    }
    return genders[gender] || gender
  }

  // Lifecycle methods
  onMounted() {
    this.fetchPatients()
  }

  setupWatchers() {
    watch(() => this.patientsStore.error, (newError) => {
      if (newError) {
        // Auto-clear error after 5 seconds
        setTimeout(() => {
          this.patientsStore.clearError()
        }, 5000)
      }
    })
  }

  // Get all reactive references
  getReactiveData() {
    return {
      searchQuery: this.searchQuery,
      genderFilter: this.genderFilter,
      bloodGroupFilter: this.bloodGroupFilter,
      showDeleteModal: this.showDeleteModal,
      patientToDelete: this.patientToDelete,
      loading: this.loading,
      error: this.error,
      patients: this.patients,
      hasPatients: this.hasPatients,
      pagination: this.pagination
    }
  }

  // Get all methods
  getMethods() {
    return {
      fetchPatients: this.fetchPatients.bind(this),
      handleSearch: this.handleSearch.bind(this),
      handleFilterChange: this.handleFilterChange.bind(this),
      clearFilters: this.clearFilters.bind(this),
      changePage: this.changePage.bind(this),
      getPageNumbers: this.getPageNumbers.bind(this),
      confirmDelete: this.confirmDelete.bind(this),
      cancelDelete: this.cancelDelete.bind(this),
      deletePatient: this.deletePatient.bind(this),
      formatDate: this.formatDate.bind(this),
      getGenderText: this.getGenderText.bind(this)
    }
  }
}

// Utility functions
export const patientUtils = {
  // Calculate patient age from date of birth
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null
    
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  },

  // Format phone number
  formatPhoneNumber(phone) {
    if (!phone) return ''
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format Egyptian phone numbers
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return `+20 ${cleaned.slice(1)}`
    }
    
    return phone
  },

  // Validate email format
  isValidEmail(email) {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Get blood group color
  getBloodGroupColor(bloodGroup) {
    const colors = {
      'A+': 'text-red-600 bg-red-100',
      'A-': 'text-red-700 bg-red-200',
      'B+': 'text-blue-600 bg-blue-100',
      'B-': 'text-blue-700 bg-blue-200',
      'AB+': 'text-purple-600 bg-purple-100',
      'AB-': 'text-purple-700 bg-purple-200',
      'O+': 'text-green-600 bg-green-100',
      'O-': 'text-green-700 bg-green-200'
    }
    return colors[bloodGroup] || 'text-gray-600 bg-gray-100'
  },

  // Get gender icon
  getGenderIcon(gender) {
    const icons = {
      male: '👨',
      female: '👩',
      other: '👤'
    }
    return icons[gender] || '👤'
  },

  // Format address
  formatAddress(address) {
    if (!address) return 'غير محدد'
    return address.length > 50 ? address.substring(0, 50) + '...' : address
  },

  // Get emergency contact status
  getEmergencyContactStatus(patient) {
    if (patient.emergency_contact && patient.emergency_contact_name) {
      return 'complete'
    } else if (patient.emergency_contact || patient.emergency_contact_name) {
      return 'partial'
    } else {
      return 'missing'
    }
  }
}

// Export default instance
export default PatientListManager
