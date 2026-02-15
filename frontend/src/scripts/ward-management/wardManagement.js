/**
 * Ward Management JavaScript
 * Handles ward dashboard functionality and data management
 */

import { ref, computed } from 'vue'
import { useWardManagementStore } from '@/stores/wardManagement'

/**
 * Ward Management Composable
 */
export function useWardManagement() {
  // Store
  const wardStore = useWardManagementStore()

  // Reactive data
  const selectedWardType = ref('')
  const selectedFloor = ref('')
  const floors = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  // Computed properties
  const loading = computed(() => wardStore.loading)
  const error = computed(() => wardStore.error)
  const wards = computed(() => wardStore.wards)
  const statistics = computed(() => ({
    total_wards: wardStore.wards.length,
    total_rooms: wardStore.rooms.length,
    total_beds: wardStore.beds.length,
    occupancy_rate: wardStore.occupancyRate,
    available_beds: wardStore.availableBeds.length,
    occupied_beds: wardStore.occupiedBeds.length
  }))

  const filteredWards = computed(() => {
    let filtered = wardStore.wards

    if (selectedWardType.value) {
      filtered = filtered.filter(ward => ward.type === selectedWardType.value)
    }

    if (selectedFloor.value) {
      filtered = filtered.filter(ward => ward.floor === parseInt(selectedFloor.value))
    }

    return filtered
  })

  // Methods
  const loadDashboardData = async () => {
    try {
      await Promise.all([
        wardStore.fetchWards(),
        wardStore.fetchRooms(),
        wardStore.fetchBeds(),
        wardStore.fetchAdmissions()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const filterWards = () => {
    // Filtering is handled by computed property
    console.log('Filtering wards by type:', selectedWardType.value, 'floor:', selectedFloor.value)
  }

  const refreshData = async () => {
    await loadDashboardData()
  }

  const openWardForm = () => {
    // Navigate to ward form or open modal
    console.log('Opening ward form')
  }

  const viewWardDetails = (ward) => {
    // Navigate to ward details
    console.log('Viewing ward details:', ward)
  }

  const getWardTypeName = (type) => {
    const typeMap = {
      general: 'عام',
      ICU: 'عناية مركزة',
      pediatric: 'أطفال',
      maternity: 'ولادة',
      surgical: 'جراحة',
      emergency: 'طوارئ',
      isolation: 'عزل',
      cardiac: 'قلب',
      neurology: 'أعصاب',
      oncology: 'أورام'
    }
    return typeMap[type] || type
  }

  const getWardStatusName = (status) => {
    const statusMap = {
      active: 'نشط',
      inactive: 'غير نشط',
      maintenance: 'صيانة',
      closed: 'مغلق'
    }
    return statusMap[status] || status
  }

  const getRoomTypeName = (type) => {
    const typeMap = {
      private: 'خاصة',
      semi_private: 'شبه خاصة',
      ward: 'جناح',
      icu: 'عناية مركزة',
      emergency: 'طوارئ',
      isolation: 'عزل'
    }
    return typeMap[type] || type
  }

  const getBedTypeName = (type) => {
    const typeMap = {
      standard: 'عادي',
      private: 'خاص',
      icu: 'عناية مركزة',
      emergency: 'طوارئ',
      isolation: 'عزل'
    }
    return typeMap[type] || type
  }

  const getBedStatusName = (status) => {
    const statusMap = {
      available: 'متاح',
      occupied: 'مشغول',
      maintenance: 'صيانة',
      out_of_order: 'خارج الخدمة'
    }
    return statusMap[status] || status
  }

  const getAdmissionTypeName = (type) => {
    const typeMap = {
      emergency: 'طوارئ',
      elective: 'مجدول',
      transfer: 'نقل',
      observation: 'مراقبة'
    }
    return typeMap[type] || type
  }

  const getAdmissionStatusName = (status) => {
    const statusMap = {
      admitted: 'مقبول',
      discharged: 'خرج',
      transferred: 'منقول',
      pending: 'في الانتظار'
    }
    return statusMap[status] || status
  }

  const formatDate = (date) => {
    if (!date) return 'غير محدد'
    return new Date(date).toLocaleDateString('ar-SA')
  }

  const formatTime = (time) => {
    if (!time) return 'غير محدد'
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (date, time) => {
    if (!date) return 'غير محدد'
    const dateTime = time ? `${date}T${time}` : date
    return new Date(dateTime).toLocaleString('ar-SA')
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getPriorityColor = (priority) => {
    const colorMap = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    }
    return colorMap[priority] || 'text-gray-600 bg-gray-100'
  }

  const getPriorityName = (priority) => {
    const priorityMap = {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      urgent: 'عاجل'
    }
    return priorityMap[priority] || priority
  }

  const getTaskTypeName = (type) => {
    const typeMap = {
      cleaning: 'تنظيف',
      maintenance: 'صيانة',
      disinfection: 'تعقيم',
      inspection: 'فحص',
      repair: 'إصلاح'
    }
    return typeMap[type] || type
  }

  const getTaskStatusName = (status) => {
    const statusMap = {
      pending: 'في الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }
    return statusMap[status] || status
  }

  // Return reactive data and methods
  return {
    // Reactive data
    selectedWardType,
    selectedFloor,
    floors,
    
    // Computed properties
    loading,
    error,
    wards,
    statistics,
    filteredWards,
    
    // Methods
    loadDashboardData,
    filterWards,
    refreshData,
    openWardForm,
    viewWardDetails,
    getWardTypeName,
    getWardStatusName,
    getRoomTypeName,
    getBedTypeName,
    getBedStatusName,
    getAdmissionTypeName,
    getAdmissionStatusName,
    formatDate,
    formatTime,
    formatDateTime,
    calculateAge,
    getPriorityColor,
    getPriorityName,
    getTaskTypeName,
    getTaskStatusName
  }
}
