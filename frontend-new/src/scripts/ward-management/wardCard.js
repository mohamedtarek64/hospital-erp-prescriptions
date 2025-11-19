/**
 * Ward Card JavaScript
 * Handles ward card functionality and data management
 */

import { computed } from 'vue'

/**
 * Ward Card Composable
 */
export function useWardCard(props, emit) {
  /**
   * Computed properties
   */
  const occupancyRate = computed(() => {
    if (!props.ward.capacity || props.ward.capacity === 0) return 0
    const occupied = props.ward.capacity - props.ward.available_beds
    return Math.round((occupied / props.ward.capacity) * 100)
  })

  const availableBeds = computed(() => {
    return props.ward.available_beds || 0
  })

  /**
   * Methods
   */
  const getStatusText = (status) => {
    const statusMap = {
      active: 'نشط',
      inactive: 'غير نشط',
      maintenance: 'صيانة',
      closed: 'مغلق'
    }
    return statusMap[status] || status
  }

  const viewDetails = () => {
    emit('viewDetails', props.ward)
  }

  const editWard = () => {
    emit('editWard', props.ward)
  }

  const viewLayout = () => {
    emit('viewLayout', props.ward)
  }

  return {
    // Computed properties
    occupancyRate,
    availableBeds,
    
    // Methods
    getStatusText,
    viewDetails,
    editWard,
    viewLayout
  }
}
