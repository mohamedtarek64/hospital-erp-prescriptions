import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useSupplierManagement() {
  // Get auth store
  const authStore = useAuthStore()

  // Reactive data
  const user = computed(() => authStore.user)
  const suppliers = ref([
    {
      id: 1,
      name: 'شركة الأدوية المصرية',
      description: 'مورد رئيسي للأدوية والمستلزمات الطبية',
      contact: '01234567890',
      email: 'info@egyptian-pharma.com'
    },
    {
      id: 2,
      name: 'مؤسسة الصحة المتقدمة',
      description: 'مورد للمعدات الطبية والأجهزة',
      contact: '01234567891',
      email: 'contact@advanced-health.com'
    },
    {
      id: 3,
      name: 'شركة المستلزمات الطبية',
      description: 'مورد للمستلزمات الطبية والجراحية',
      contact: '01234567892',
      email: 'info@medical-supplies.com'
    }
  ])

  const showAddSupplierForm = ref(false)
  const newSupplier = ref({
    name: '',
    description: '',
    contact: '',
    email: ''
  })

  // Methods
  const getRoleName = (role) => {
    const roles = {
      'admin': 'مدير',
      'doctor': 'طبيب',
      'nurse': 'ممرض/ممرضة',
      'receptionist': 'موظف استقبال'
    }
    return roles[role] || role
  }

  const addSupplier = () => {
    if (newSupplier.value.name && newSupplier.value.contact) {
      const supplier = {
        id: suppliers.value.length + 1,
        ...newSupplier.value
      }
      suppliers.value.push(supplier)
      newSupplier.value = {
        name: '',
        description: '',
        contact: '',
        email: ''
      }
      showAddSupplierForm.value = false
    }
  }

  const editSupplier = (supplier) => {
    // Implementation for editing supplier
    console.log('Edit supplier:', supplier)
  }

  const deleteSupplier = (supplierId) => {
    const index = suppliers.value.findIndex(s => s.id === supplierId)
    if (index > -1) {
      suppliers.value.splice(index, 1)
    }
  }

  const closeAddForm = () => {
    showAddSupplierForm.value = false
    newSupplier.value = {
      name: '',
      description: '',
      contact: '',
      email: ''
    }
  }

  return {
    user,
    suppliers,
    showAddSupplierForm,
    newSupplier,
    getRoleName,
    addSupplier,
    editSupplier,
    deleteSupplier,
    closeAddForm
  }
}
