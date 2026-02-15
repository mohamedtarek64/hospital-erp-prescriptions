/**
 * Bed Card JavaScript
 * Handles bed card functionality and data management
 */

import { computed } from 'vue'

/**
 * Bed Card Composable
 */
export function useBedCard(props, emit) {
  /**
   * Computed properties
   */
  const bedStatusClass = computed(() => {
    return {
      'bed-available': props.bed.status === 'available',
      'bed-occupied': props.bed.status === 'occupied',
      'bed-maintenance': props.bed.status === 'maintenance',
      'bed-out-of-order': props.bed.status === 'out_of_order'
    }
  })

  /**
   * Methods
   */
  const getBedTypeText = (type) => {
    const typeMap = {
      standard: 'عادي',
      private: 'خاص',
      icu: 'عناية مركزة',
      emergency: 'طوارئ',
      isolation: 'عزل'
    }
    return typeMap[type] || type
  }

  const getStatusText = (status) => {
    const statusMap = {
      available: 'متاح',
      occupied: 'مشغول',
      maintenance: 'صيانة',
      out_of_order: 'خارج الخدمة'
    }
    return statusMap[status] || status
  }

  const formatDate = (date) => {
    if (!date) return 'غير محدد'
    return new Date(date).toLocaleDateString('ar-SA')
  }

  const assignBed = () => {
    emit('assignBed', props.bed)
  }

  const viewPatient = () => {
    emit('viewPatient', props.bed)
  }

  const dischargePatient = () => {
    emit('dischargePatient', props.bed)
  }

  const maintenanceBed = () => {
    emit('maintenanceBed', props.bed)
  }

  return {
    // Computed properties
    bedStatusClass,
    
    // Methods
    getBedTypeText,
    getStatusText,
    formatDate,
    assignBed,
    viewPatient,
    dischargePatient,
    maintenanceBed
  }
}
