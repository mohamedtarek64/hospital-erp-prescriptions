import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMedicalRecordsStore } from '@/stores/medicalRecords'

/**
 * Composable for Medical Record Details functionality
 * Handles loading and displaying medical record details
 */
export function useMedicalRecordDetails() {
  // Router and stores
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const medicalRecordsStore = useMedicalRecordsStore()

  // Reactive data
  const loading = ref(false)
  const medicalRecord = ref({})
  const error = ref(null)

  // Computed
  const user = computed(() => authStore.user)
  const recordId = computed(() => route.params.id)

  // Methods
  const getRoleName = (role) => {
    const roleNames = {
      admin: 'مدير النظام',
      doctor: 'طبيب',
      nurse: 'ممرض',
      receptionist: 'موظف استقبال',
      pharmacist: 'صيدلي',
      lab_technician: 'فني مختبر'
    }
    return roleNames[role] || 'مستخدم'
  }

  const loadMedicalRecord = async () => {
    if (!recordId.value) {
      error.value = 'معرف السجل الطبي غير صحيح'
      return
    }

    loading.value = true
    error.value = null

    try {
      const record = await medicalRecordsStore.getMedicalRecord(recordId.value)
      medicalRecord.value = record
    } catch (err) {
      console.error('Failed to load medical record:', err)
      error.value = 'فشل في تحميل السجل الطبي'
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'غير محدد'
    const date = new Date(dateString)
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'نشط', class: 'bg-green-100 text-green-800' },
      completed: { text: 'مكتمل', class: 'bg-blue-100 text-blue-800' },
      pending: { text: 'في الانتظار', class: 'bg-yellow-100 text-yellow-800' },
      cancelled: { text: 'ملغي', class: 'bg-red-100 text-red-800' }
    }
    return statusConfig[status] || { text: 'غير محدد', class: 'bg-gray-100 text-gray-800' }
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { text: 'منخفضة', class: 'bg-gray-100 text-gray-800' },
      medium: { text: 'متوسطة', class: 'bg-blue-100 text-blue-800' },
      high: { text: 'عالية', class: 'bg-orange-100 text-orange-800' },
      urgent: { text: 'عاجلة', class: 'bg-red-100 text-red-800' }
    }
    return priorityConfig[priority] || { text: 'غير محدد', class: 'bg-gray-100 text-gray-800' }
  }

  const goBack = () => {
    router.go(-1)
  }

  const editRecord = () => {
    router.push(`/medical-records/${recordId.value}/edit`)
  }

  const printRecord = () => {
    window.print()
  }

  // Lifecycle
  onMounted(() => {
    loadMedicalRecord()
  })

  return {
    // State
    loading,
    medicalRecord,
    error,
    user,
    recordId,
    
    // Methods
    getRoleName,
    loadMedicalRecord,
    formatDate,
    formatDateTime,
    getStatusBadge,
    getPriorityBadge,
    goBack,
    editRecord,
    printRecord
  }
}
