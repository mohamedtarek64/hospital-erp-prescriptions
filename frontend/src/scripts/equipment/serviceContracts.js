import { ref, computed, onMounted } from 'vue'
// import { useRouter } from 'vue-router'

export function useServiceContracts() {
  // const router = useRouter()
  
  // Reactive state
  const contracts = ref([])
  const equipmentList = ref([])
  const vendorList = ref([])
  const loading = ref(false)
  const showAddContractForm = ref(false)
  const showEditContractForm = ref(false)
  const selectedContract = ref(null)

  // Filters
  const filters = ref({
    status: '',
    type: '',
    equipment: ''
  })

  // Contract form
  const contractForm = ref({
    equipment_id: '',
    vendor_id: '',
    contract_number: '',
    contract_type: '',
    start_date: '',
    end_date: '',
    cost: '',
    payment_terms: 'one_time',
    terms: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
    status: 'active'
  })

  // Computed properties
  const filteredContracts = computed(() => {
    let filtered = contracts.value

    if (filters.value.status) {
      filtered = filtered.filter(contract => contract.status === filters.value.status)
    }

    if (filters.value.type) {
      filtered = filtered.filter(contract => contract.contract_type === filters.value.type)
    }

    if (filters.value.equipment) {
      filtered = filtered.filter(contract => contract.equipment_id === parseInt(filters.value.equipment))
    }

    return filtered
  })

  const expiringContracts = computed(() => {
    return contracts.value.filter(contract => contract.is_expiring_soon)
  })

  const totalContractValue = computed(() => {
    return contracts.value.reduce((sum, contract) => sum + parseFloat(contract.cost || 0), 0)
  })

  // Methods
  const loadContracts = async () => {
    loading.value = true
    try {
      // const response = await apiClient.get('/service-contracts')
      // contracts.value = response.data
      
      // Mock data
      contracts.value = [
        {
          id: 1,
          contract_number: 'SC-001',
          equipment_id: 1,
          vendor_id: 1,
          contract_type: 'warranty',
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          cost: 5000,
          payment_terms: 'annually',
          terms: 'Full warranty coverage',
          contact_person: 'John Smith',
          contact_phone: '+1234567890',
          contact_email: 'john@vendor.com',
          status: 'active',
          notes: 'Annual maintenance contract',
          equipment: { id: 1, name: 'X-Ray Machine' },
          vendor: { id: 1, name: 'Medical Equipment Co.' },
          is_expiring_soon: false,
          days_until_expiration: 45,
          status_color: 'success'
        }
      ]
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      loading.value = false
    }
  }

  const loadEquipmentList = async () => {
    try {
      // const response = await apiClient.get('/equipment')
      // equipmentList.value = response.data
      
      equipmentList.value = [
        { id: 1, name: 'X-Ray Machine' },
        { id: 2, name: 'MRI Scanner' }
      ]
    } catch (error) {
      console.error('Error loading equipment:', error)
    }
  }

  const loadVendorList = async () => {
    try {
      // const response = await apiClient.get('/suppliers')
      // vendorList.value = response.data
      
      vendorList.value = [
        { id: 1, name: 'Medical Equipment Co.' },
        { id: 2, name: 'Tech Solutions Inc.' }
      ]
    } catch (error) {
      console.error('Error loading vendors:', error)
    }
  }

  const filterContracts = () => {
    // Filtering is handled by computed property
  }

  const clearFilters = () => {
    filters.value = {
      status: '',
      type: '',
      equipment: ''
    }
  }

  const viewContract = (contract) => {
    selectedContract.value = contract
    // Navigate to contract details or show modal
    console.log('View contract:', contract)
  }

  const editContract = (contract) => {
    selectedContract.value = contract
    contractForm.value = { ...contract }
    showEditContractForm.value = true
  }

  const deleteContract = async (/* contract */) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        // await apiClient.delete(`/service-contracts/${contract.id}`)
        await loadContracts()
      } catch (error) {
        console.error('Error deleting contract:', error)
      }
    }
  }

  const saveContract = async () => {
    loading.value = true
    try {
      if (showEditContractForm.value) {
        // await apiClient.put(`/service-contracts/${selectedContract.value.id}`, contractForm.value)
        console.log('Update contract:', contractForm.value)
      } else {
        // await apiClient.post('/service-contracts', contractForm.value)
        console.log('Create contract:', contractForm.value)
      }
      
      await loadContracts()
      closeModal()
    } catch (error) {
      console.error('Error saving contract:', error)
    } finally {
      loading.value = false
    }
  }

  const closeModal = () => {
    showAddContractForm.value = false
    showEditContractForm.value = false
    selectedContract.value = null
    contractForm.value = {
      equipment_id: '',
      vendor_id: '',
      contract_number: '',
      contract_type: '',
      start_date: '',
      end_date: '',
      cost: '',
      payment_terms: 'one_time',
      terms: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      notes: '',
      status: 'active'
    }
  }

  const exportContracts = async () => {
    try {
      const data = filteredContracts.value.map(contract => ({
        'Contract Number': contract.contract_number,
        'Equipment': contract.equipment?.name,
        'Vendor': contract.vendor?.name,
        'Type': contract.contract_type,
        'Start Date': contract.start_date,
        'End Date': contract.end_date,
        'Cost': contract.cost,
        'Status': contract.status
      }))
      
      // Export to CSV
      const csv = convertToCSV(data)
      downloadCSV(csv, 'service-contracts.csv')
    } catch (error) {
      console.error('Error exporting contracts:', error)
    }
  }

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')
    return csvContent
  }

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getContractStatus = (contract) => {
    const now = new Date()
    const endDate = new Date(contract.end_date)
    const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'expired'
    if (daysUntilExpiry <= 30) return 'expiring'
    return 'active'
  }

  const getContractColor = (status) => {
    const colors = {
      active: 'success',
      expired: 'danger',
      expiring: 'warning',
      cancelled: 'secondary'
    }
    return colors[status] || 'secondary'
  }

  // Lifecycle
  onMounted(() => {
    loadContracts()
    loadEquipmentList()
    loadVendorList()
  })

  return {
    // State
    contracts,
    equipmentList,
    vendorList,
    loading,
    showAddContractForm,
    showEditContractForm,
    selectedContract,
    filters,
    contractForm,
    
    // Computed
    filteredContracts,
    expiringContracts,
    totalContractValue,
    
    // Methods
    loadContracts,
    filterContracts,
    clearFilters,
    viewContract,
    editContract,
    deleteContract,
    saveContract,
    closeModal,
    exportContracts,
    getContractStatus,
    getContractColor
  }
}
