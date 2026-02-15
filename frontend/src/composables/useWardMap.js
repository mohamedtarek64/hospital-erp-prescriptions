import { ref, computed } from 'vue'

export function useWardMap(props, { emit }) {
  const selectedWard = ref('')
  const selectedFloor = ref('')
  const selectedView = ref('beds')
  const selectedRoom = ref(null)
  const hoveredRoom = ref(null)

  const floors = computed(() => {
    const uniqueFloors = [...new Set(props.rooms.map(room => room.floor))]
    return uniqueFloors.sort((a, b) => a - b)
  })

  const filteredRooms = computed(() => {
    let filtered = [...props.rooms]

    if (selectedWard.value) {
      filtered = filtered.filter(room => room.ward_id === selectedWard.value)
    }

    if (selectedFloor.value) {
      filtered = filtered.filter(room => room.floor === selectedFloor.value)
    }

    return filtered
  })

  const mapGridStyle = computed(() => {
    const maxColumns = Math.max(...filteredRooms.value.map(room => room.position.x), 0) + 1
    const maxRows = Math.max(...filteredRooms.value.map(room => room.position.y), 0) + 1
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
      gridTemplateRows: `repeat(${maxRows}, 1fr)`,
      gap: '4px'
    }
  })

  const mapStats = computed(() => {
    const stats = {
      totalRooms: filteredRooms.value.length,
      availableRooms: 0,
      occupiedRooms: 0,
      maintenanceRooms: 0,
      cleaningRooms: 0
    }

    filteredRooms.value.forEach(room => {
      switch (room.status) {
        case 'available':
          stats.availableRooms++
          break
        case 'occupied':
          stats.occupiedRooms++
          break
        case 'maintenance':
          stats.maintenanceRooms++
          break
        case 'cleaning':
          stats.cleaningRooms++
          break
      }
    })

    return stats
  })

  const getRoomClasses = (room) => {
    const classes = ['room-cell-base']
    
    // Status classes
    switch (room.status) {
      case 'available':
        classes.push('room-available')
        break
      case 'occupied':
        classes.push('room-occupied')
        break
      case 'maintenance':
        classes.push('room-maintenance')
        break
      case 'cleaning':
        classes.push('room-cleaning')
        break
      case 'out_of_service':
        classes.push('room-out-of-service')
        break
    }

    // Selection classes
    if (selectedRoom.value && selectedRoom.value.id === room.id) {
      classes.push('room-selected')
    }

    if (hoveredRoom.value && hoveredRoom.value.id === room.id) {
      classes.push('room-hovered')
    }

    return classes
  }

  const getStatusClass = (status) => {
    const classes = {
      available: 'status-available',
      occupied: 'status-occupied',
      maintenance: 'status-maintenance',
      cleaning: 'status-cleaning',
      out_of_service: 'status-out-of-service'
    }
    return classes[status] || 'status-default'
  }

  const selectRoom = (room) => {
    selectedRoom.value = room
    emit('room-select', room)
  }

  const hoverRoom = (room) => {
    hoveredRoom.value = room
    emit('room-hover', room)
  }

  const unhoverRoom = () => {
    hoveredRoom.value = null
  }

  const closeRoomDetails = () => {
    selectedRoom.value = null
  }

  const viewRoomDetails = () => {
    if (selectedRoom.value) {
      // Navigate to room details page
      console.log('View room details:', selectedRoom.value)
    }
  }

  const editRoom = () => {
    if (selectedRoom.value) {
      // Open room edit modal
      console.log('Edit room:', selectedRoom.value)
    }
  }

  const onWardChange = () => {
    selectedFloor.value = ''
    selectedRoom.value = null
    emit('ward-change', selectedWard.value)
  }

  const onFloorChange = () => {
    selectedRoom.value = null
    emit('floor-change', selectedFloor.value)
  }

  const onViewChange = () => {
    emit('view-change', selectedView.value)
  }

  const refreshMap = () => {
    emit('refresh')
  }

  const exportMap = () => {
    emit('export', {
      ward: selectedWard.value,
      floor: selectedFloor.value,
      view: selectedView.value,
      rooms: filteredRooms.value
    })
  }

  const toggleView = () => {
    // Toggle between different view modes
    const views = ['beds', 'occupancy', 'maintenance', 'cleaning']
    const currentIndex = views.indexOf(selectedView.value)
    const nextIndex = (currentIndex + 1) % views.length
    selectedView.value = views[nextIndex]
    onViewChange()
  }

  return {
    selectedWard,
    selectedFloor,
    selectedView,
    selectedRoom,
    hoveredRoom,
    floors,
    filteredRooms,
    mapGridStyle,
    mapStats,
    getRoomClasses,
    getStatusClass,
    selectRoom,
    hoverRoom,
    unhoverRoom,
    closeRoomDetails,
    viewRoomDetails,
    editRoom,
    onWardChange,
    onFloorChange,
    onViewChange,
    refreshMap,
    exportMap,
    toggleView
  }
}
