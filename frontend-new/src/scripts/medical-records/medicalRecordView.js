import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMedicalRecordsStore } from '@/stores/medicalRecords'

/**
 * Composable for Medical Record View functionality
 * Handles loading and displaying medical record details with full functionality
 */
export function useMedicalRecordView() {
  // Router and stores
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const medicalRecordsStore = useMedicalRecordsStore()

  // Reactive data
  const loading = ref(false)
  const medicalRecord = ref(null)
  const error = ref(null)

  // Computed
  const user = computed(() => authStore.user)
  const recordId = computed(() => route.params.id)
  const canEdit = computed(() => {
    return user.value?.role === 'admin' || 
           user.value?.role === 'doctor' || 
           user.value?.id === medicalRecord.value?.doctor_id
  })

  // Methods
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

  const getStatusClass = (status) => {
    const statusClasses = {
      active: 'status-active',
      completed: 'status-completed',
      pending: 'status-pending',
      cancelled: 'status-cancelled'
    }
    return statusClasses[status] || 'status-default'
  }

  const getStatusText = (status) => {
    const statusTexts = {
      active: 'نشط',
      completed: 'مكتمل',
      pending: 'في الانتظار',
      cancelled: 'ملغي'
    }
    return statusTexts[status] || 'غير محدد'
  }

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    }
    return priorityClasses[priority] || 'priority-default'
  }

  const getPriorityText = (priority) => {
    const priorityTexts = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة'
    }
    return priorityTexts[priority] || 'غير محدد'
  }

  const editRecord = () => {
    router.push(`/medical-records/${recordId.value}/edit`)
  }

  const printRecord = () => {
    window.print()
  }

  const downloadRecord = () => {
    // TODO: Implement PDF download functionality
    console.log('Downloading medical record...')
  }

  const shareRecord = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing medical record...')
  }

  const addNote = () => {
    // TODO: Implement add note functionality
    console.log('Adding note to medical record...')
  }

  const addAttachment = () => {
    // TODO: Implement add attachment functionality
    console.log('Adding attachment to medical record...')
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
    canEdit,
    
    // Methods
    loadMedicalRecord,
    formatDate,
    formatDateTime,
    getStatusClass,
    getStatusText,
    getPriorityClass,
    getPriorityText,
    editRecord,
    printRecord,
    downloadRecord,
    shareRecord,
    addNote,
    addAttachment
  }
}
