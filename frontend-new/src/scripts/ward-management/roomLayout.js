/**
 * Room Layout JavaScript
 * Handles room layout functionality and data management
 */

// import { computed } from 'vue'

/**
 * Room Layout Composable
 */
export function useRoomLayout(props, emit) {
  /**
   * Computed properties
   */
  const getGridClass = (capacity) => {
    if (capacity <= 2) return 'grid-2'
    if (capacity <= 4) return 'grid-4'
    if (capacity <= 6) return 'grid-6'
    return 'grid-8'
  }

  /**
   * Methods
   */
  const getRoomTypeText = (type) => {
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

  const getAmenityText = (amenity) => {
    const amenityMap = {
      tv: 'تلفزيون',
      wifi: 'واي فاي',
      air_conditioning: 'تكييف',
      private_bathroom: 'حمام خاص',
      refrigerator: 'ثلاجة',
      phone: 'هاتف',
      nurse_call: 'استدعاء ممرضة',
      oxygen: 'أكسجين',
      monitor: 'مراقب'
    }
    return amenityMap[amenity] || amenity
  }

  const handleAssignBed = (bed) => {
    emit('assignBed', { room: props.room, bed })
  }

  const handleViewPatient = (bed) => {
    emit('viewPatient', { room: props.room, bed })
  }

  const handleDischargePatient = (bed) => {
    emit('dischargePatient', { room: props.room, bed })
  }

  const handleMaintenanceBed = (bed) => {
    emit('maintenanceBed', { room: props.room, bed })
  }

  const addBed = () => {
    emit('addBed', props.room)
  }

  const editRoom = () => {
    emit('editRoom', props.room)
  }

  const viewHousekeeping = () => {
    emit('viewHousekeeping', props.room)
  }

  return {
    // Computed properties
    getGridClass,
    
    // Methods
    getRoomTypeText,
    getAmenityText,
    handleAssignBed,
    handleViewPatient,
    handleDischargePatient,
    handleMaintenanceBed,
    addBed,
    editRoom,
    viewHousekeeping
  }
}
