import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientsStore } from '@/stores/patients'
import { useMedicalRecordsStore } from '@/stores/medicalRecords'

/**
 * Composable for Patient Medical History functionality
 * Handles loading and displaying patient's complete medical history
 */
export function usePatientMedicalHistory() {
  // Router and stores
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const patientsStore = usePatientsStore()
  const medicalRecordsStore = useMedicalRecordsStore()

  // Reactive data
  const loading = ref(false)
  const patient = ref(null)
  const medicalRecords = ref([])
  const diagnoses = ref([])
  const prescriptions = ref([])
  const medicalTests = ref([])
  const error = ref(null)

  // Computed
  const user = computed(() => authStore.user)
  const patientId = computed(() => route.params.id)

  // Methods
  const loadPatientHistory = async () => {
    if (!patientId.value) {
      error.value = 'معرف المريض غير صحيح'
      return
    }

    loading.value = true
    error.value = null

    try {
      // Load patient data
      const patientData = await patientsStore.getPatient(patientId.value)
      patient.value = patientData

      // Load medical records
      const records = await medicalRecordsStore.getPatientMedicalRecords(patientId.value)
      medicalRecords.value = records

      // Load related data
      const [diagnosesData, prescriptionsData, testsData] = await Promise.all([
        medicalRecordsStore.getPatientDiagnoses(patientId.value),
        medicalRecordsStore.getPatientPrescriptions(patientId.value),
        medicalRecordsStore.getPatientMedicalTests(patientId.value)
      ])

      diagnoses.value = diagnosesData
      prescriptions.value = prescriptionsData
      medicalTests.value = testsData

    } catch (err) {
      console.error('Failed to load patient history:', err)
      error.value = 'فشل في تحميل التاريخ الطبي'
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

  const getGenderText = (gender) => {
    const genderTexts = {
      male: 'ذكر',
      female: 'أنثى',
      other: 'آخر'
    }
    return genderTexts[gender] || 'غير محدد'
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

  const createNewRecord = () => {
    router.push(`/medical-records/create?patient_id=${patientId.value}`)
  }

  const viewRecord = (record) => {
    router.push(`/medical-records/${record.id}`)
  }

  const editRecord = (record) => {
    router.push(`/medical-records/${record.id}/edit`)
  }

  const printHistory = () => {
    window.print()
  }

  const exportHistory = () => {
    // TODO: Implement export functionality
    console.log('Exporting patient history...')
  }

  const shareHistory = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing patient history...')
  }

  // Lifecycle
  onMounted(() => {
    loadPatientHistory()
  })

  return {
    // State
    loading,
    patient,
    medicalRecords,
    diagnoses,
    prescriptions,
    medicalTests,
    error,
    user,
    patientId,
    
    // Methods
    loadPatientHistory,
    formatDate,
    formatDateTime,
    getGenderText,
    getStatusClass,
    getStatusText,
    getPriorityClass,
    getPriorityText,
    createNewRecord,
    viewRecord,
    editRecord,
    printHistory,
    exportHistory,
    shareHistory
  }
}
