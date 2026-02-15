import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatPrice } from '@/utils/pharmacyHelpers'

export class PrescriptionManager {
  constructor() {
    // Reactive State
    this.prescriptions = ref([])
    this.doctors = ref([])
    this.patients = ref([])
    this.medicines = ref([])
    this.loading = ref(false)
    this.error = ref(null)
    
    // Modal States
    this.showNewPrescriptionModal = ref(false)
    this.showPrescriptionDetailsModal = ref(false)
    this.selectedPrescription = ref(null)
    
    // Filters
    this.searchFilter = ref('')
    this.statusFilter = ref('')
    this.doctorFilter = ref('')
    this.priorityFilter = ref('')
    
    // Pagination
    this.currentPage = ref(1)
    this.itemsPerPage = ref(10)
    this.totalItems = ref(0)
    
    // Statistics
    this.stats = ref({
      pending: 0,
      dispensing: 0,
      dispensed: 0,
      cancelled: 0,
      today: 0,
      totalRevenue: 0
    })
  }

  // Computed Properties
  get filteredPrescriptions() {
    let filtered = this.prescriptions.value

    // Search filter
    if (this.searchFilter.value) {
      const search = this.searchFilter.value.toLowerCase()
      filtered = filtered.filter(prescription => 
        prescription.prescriptionNumber.toLowerCase().includes(search) ||
        prescription.patient.name.toLowerCase().includes(search) ||
        prescription.doctor.name.toLowerCase().includes(search) ||
        prescription.status.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (this.statusFilter.value) {
      filtered = filtered.filter(prescription => prescription.status === this.statusFilter.value)
    }

    // Doctor filter
    if (this.doctorFilter.value) {
      filtered = filtered.filter(prescription => prescription.doctor.id === this.doctorFilter.value)
    }

    // Priority filter
    if (this.priorityFilter.value) {
      filtered = filtered.filter(prescription => prescription.priority === this.priorityFilter.value)
    }

    return filtered
  }

  get totalPages() {
    return Math.ceil(this.filteredPrescriptions.length / this.itemsPerPage.value)
  }

  get paginatedPrescriptions() {
    const start = (this.currentPage.value - 1) * this.itemsPerPage.value
    const end = start + this.itemsPerPage.value
    return this.filteredPrescriptions.slice(start, end)
  }

  get pendingPrescriptions() {
    return this.stats.value.pending
  }

  get dispensedPrescriptions() {
    return this.stats.value.dispensed
  }

  get todayPrescriptions() {
    return this.stats.value.today
  }

  get totalRevenue() {
    return formatPrice(this.stats.value.totalRevenue)
  }

  // API Methods
  async fetchPrescriptions(page = 1) {
    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/prescriptions?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('فشل في جلب الوصفات الطبية')
      }

      const data = await response.json()
      this.prescriptions.value = data.data
      this.totalItems.value = data.total
      this.updateStatistics()
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error fetching prescriptions:', error)
    } finally {
      this.loading.value = false
    }
  }

  async loadDoctors() {
    try {
      const authStore = useAuthStore()
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.doctors.value = data.data
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  async loadPatients() {
    try {
      const authStore = useAuthStore()
      const response = await fetch('/api/patients', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.patients.value = data.data
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  async loadMedicines() {
    try {
      const authStore = useAuthStore()
      const response = await fetch('/api/pharmacy/medicines', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.medicines.value = data.data
      }
    } catch (error) {
      console.error('Error loading medicines:', error)
    }
  }

  async createPrescription(prescriptionData) {
    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch('/api/pharmacy/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      })

      if (!response.ok) {
        throw new Error('فشل في إنشاء الوصفة الطبية')
      }

      const newPrescription = await response.json()
      this.prescriptions.value.unshift(newPrescription.data)
      this.updateStatistics()
      this.closeNewPrescriptionModal()
      
      return newPrescription.data
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error creating prescription:', error)
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updatePrescription(prescriptionId, prescriptionData) {
    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث الوصفة الطبية')
      }

      const updatedPrescription = await response.json()
      const index = this.prescriptions.value.findIndex(prescription => prescription.id === prescriptionId)
      if (index !== -1) {
        this.prescriptions.value[index] = updatedPrescription.data
      }
      
      this.updateStatistics()
      return updatedPrescription.data
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error updating prescription:', error)
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async dispensePrescription(prescription) {
    if (!confirm(`هل أنت متأكد من صرف الوصفة الطبية #${prescription.prescriptionNumber}؟`)) {
      return
    }

    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/prescriptions/${prescription.id}/dispense`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('فشل في صرف الوصفة الطبية')
      }

      const dispensedPrescription = await response.json()
      const index = this.prescriptions.value.findIndex(p => p.id === prescription.id)
      if (index !== -1) {
        this.prescriptions.value[index] = dispensedPrescription.data
      }
      
      this.updateStatistics()
      
      // Show success message
      alert('تم صرف الوصفة الطبية بنجاح')
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error dispensing prescription:', error)
      alert('فشل في صرف الوصفة الطبية: ' + error.message)
    } finally {
      this.loading.value = false
    }
  }

  async cancelPrescription(prescriptionId, reason) {
    try {
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        await this.fetchPrescriptions()
      }
    } catch (error) {
      console.error('Error cancelling prescription:', error)
    }
  }

  // Utility Methods
  updateStatistics() {
    const stats = {
      pending: 0,
      dispensing: 0,
      dispensed: 0,
      cancelled: 0,
      today: 0,
      totalRevenue: 0
    }

    const today = new Date().toDateString()

    this.prescriptions.value.forEach(prescription => {
      stats[prescription.status]++
      
      if (new Date(prescription.prescriptionDate).toDateString() === today) {
        stats.today++
      }
      
      if (prescription.status === 'dispensed') {
        stats.totalRevenue += prescription.totalPrice
      }
    })

    this.stats.value = stats
  }

  getStatusText(status) {
    const statusMap = {
      pending: 'معلق',
      dispensing: 'قيد الصرف',
      dispensed: 'تم الصرف',
      cancelled: 'ملغي'
    }
    return statusMap[status] || status
  }

  getStatusClass(status) {
    const classMap = {
      pending: 'status-pending',
      dispensing: 'status-dispensing',
      dispensed: 'status-dispensed',
      cancelled: 'status-cancelled'
    }
    return classMap[status] || 'status-default'
  }

  getPriorityText(priority) {
    const priorityMap = {
      low: 'عادية',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة'
    }
    return priorityMap[priority] || priority
  }

  getPriorityClass(priority) {
    const classMap = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    }
    return classMap[priority] || 'priority-default'
  }

  formatDate(date) {
    return formatDate(date)
  }

  formatPrice(price) {
    return formatPrice(price)
  }

  // Modal Methods
  openNewPrescriptionModal() {
    this.showNewPrescriptionModal.value = true
  }

  closeNewPrescriptionModal() {
    this.showNewPrescriptionModal.value = false
  }

  openPrescriptionDetailsModal(prescription) {
    this.selectedPrescription.value = prescription
    this.showPrescriptionDetailsModal.value = true
  }

  closePrescriptionDetailsModal() {
    this.showPrescriptionDetailsModal.value = false
    this.selectedPrescription.value = null
  }

  viewPrescription(prescription) {
    this.openPrescriptionDetailsModal(prescription)
  }

  printPrescription(prescription) {
    // TODO: Implement print functionality
    console.log('Print prescription:', prescription)
    
    // For now, just show a message
    alert('سيتم إضافة وظيفة الطباعة قريباً')
  }

  // Pagination Methods
  async goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.value = page
      await this.fetchPrescriptions(page)
    }
  }

  async nextPage() {
    if (this.currentPage.value < this.totalPages) {
      await this.goToPage(this.currentPage.value + 1)
    }
  }

  async previousPage() {
    if (this.currentPage.value > 1) {
      await this.goToPage(this.currentPage.value - 1)
    }
  }

  // Filter Methods
  setSearchFilter(search) {
    this.searchFilter.value = search
    this.currentPage.value = 1
  }

  setStatusFilter(status) {
    this.statusFilter.value = status
    this.currentPage.value = 1
  }

  setDoctorFilter(doctor) {
    this.doctorFilter.value = doctor
    this.currentPage.value = 1
  }

  setPriorityFilter(priority) {
    this.priorityFilter.value = priority
    this.currentPage.value = 1
  }

  clearFilters() {
    this.searchFilter.value = ''
    this.statusFilter.value = ''
    this.doctorFilter.value = ''
    this.priorityFilter.value = ''
    this.currentPage.value = 1
  }

  // Export Methods
  exportToCSV() {
    const headers = ['رقم الوصفة', 'المريض', 'الطبيب', 'التاريخ', 'الأولوية', 'الحالة', 'إجمالي السعر']
    const csvContent = [
      headers.join(','),
      ...this.filteredPrescriptions.map(prescription => [
        prescription.prescriptionNumber,
        prescription.patient.name,
        prescription.doctor.name,
        this.formatDate(prescription.prescriptionDate),
        this.getPriorityText(prescription.priority),
        this.getStatusText(prescription.status),
        prescription.totalPrice
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `prescriptions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  exportToPDF() {
    // TODO: Implement PDF export
    console.log('Export to PDF')
  }

  exportPrescriptions() {
    this.exportToCSV()
  }

  // Initialization
  async initializeData() {
    await Promise.all([
      this.fetchPrescriptions(),
      this.loadDoctors(),
      this.loadPatients(),
      this.loadMedicines()
    ])
  }
}

export function usePrescriptionManager() {
  return new PrescriptionManager()
}
