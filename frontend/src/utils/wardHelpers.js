// Ward Management Helper Functions

/**
 * Calculates the occupancy rate for a ward
 * @param {Object} ward - The ward object
 * @returns {number} Occupancy rate as a percentage
 */
export function calculateOccupancyRate(ward) {
  if (!ward || !ward.total_beds || ward.total_beds === 0) {
    return 0
  }
  
  const occupiedBeds = ward.total_beds - ward.available_beds
  return Math.round((occupiedBeds / ward.total_beds) * 100)
}

/**
 * Gets the status color for a bed
 * @param {string} status - The bed status
 * @returns {string} CSS color class
 */
export function getBedStatusColor(status) {
  const colors = {
    available: 'text-green-600 bg-green-100',
    occupied: 'text-red-600 bg-red-100',
    maintenance: 'text-yellow-600 bg-yellow-100',
    cleaning: 'text-blue-600 bg-blue-100',
    out_of_service: 'text-gray-600 bg-gray-100'
  }
  
  return colors[status] || colors.out_of_service
}

/**
 * Gets the priority color for a task
 * @param {string} priority - The task priority
 * @returns {string} CSS color class
 */
export function getTaskPriorityColor(priority) {
  const colors = {
    low: 'text-gray-600 bg-gray-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    urgent: 'text-red-600 bg-red-100'
  }
  
  return colors[priority] || colors.medium
}

/**
 * Formats a date for display
 * @param {string|Date} date - The date to format
 * @param {string} format - The format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return ''
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) return ''
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    case 'datetime':
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    default:
      return dateObj.toLocaleDateString()
  }
}

/**
 * Calculates the duration between two dates
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {Object} Duration object with days, hours, minutes
 */
export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return { days: 0, hours: 0, minutes: 0 }
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { days: 0, hours: 0, minutes: 0 }
  }
  
  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return {
    days: diffDays,
    hours: diffHours,
    minutes: diffMinutes
  }
}

/**
 * Validates ward data
 * @param {Object} wardData - The ward data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateWardData(wardData) {
  const errors = {}
  
  if (!wardData.name || wardData.name.trim() === '') {
    errors.name = 'Ward name is required'
  }
  
  if (!wardData.type || wardData.type.trim() === '') {
    errors.type = 'Ward type is required'
  }
  
  if (!wardData.capacity || wardData.capacity <= 0) {
    errors.capacity = 'Ward capacity must be greater than 0'
  }
  
  if (!wardData.floor || wardData.floor < 0) {
    errors.floor = 'Floor number is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates room data
 * @param {Object} roomData - The room data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateRoomData(roomData) {
  const errors = {}
  
  if (!roomData.number || roomData.number.trim() === '') {
    errors.number = 'Room number is required'
  }
  
  if (!roomData.type || roomData.type.trim() === '') {
    errors.type = 'Room type is required'
  }
  
  if (!roomData.capacity || roomData.capacity <= 0) {
    errors.capacity = 'Room capacity must be greater than 0'
  }
  
  if (!roomData.ward_id) {
    errors.ward_id = 'Ward is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates bed data
 * @param {Object} bedData - The bed data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateBedData(bedData) {
  const errors = {}
  
  if (!bedData.number || bedData.number.trim() === '') {
    errors.number = 'Bed number is required'
  }
  
  if (!bedData.type || bedData.type.trim() === '') {
    errors.type = 'Bed type is required'
  }
  
  if (!bedData.room_id) {
    errors.room_id = 'Room is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates patient admission data
 * @param {Object} admissionData - The admission data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateAdmissionData(admissionData) {
  const errors = {}
  
  if (!admissionData.patient_id) {
    errors.patient_id = 'Patient is required'
  }
  
  if (!admissionData.ward_id) {
    errors.ward_id = 'Ward is required'
  }
  
  if (!admissionData.room_id) {
    errors.room_id = 'Room is required'
  }
  
  if (!admissionData.bed_id) {
    errors.bed_id = 'Bed is required'
  }
  
  if (!admissionData.admission_date) {
    errors.admission_date = 'Admission date is required'
  }
  
  if (!admissionData.admitting_doctor_id) {
    errors.admitting_doctor_id = 'Admitting doctor is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validates task data
 * @param {Object} taskData - The task data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateTaskData(taskData) {
  const errors = {}
  
  if (!taskData.title || taskData.title.trim() === '') {
    errors.title = 'Task title is required'
  }
  
  if (!taskData.description || taskData.description.trim() === '') {
    errors.description = 'Task description is required'
  }
  
  if (!taskData.priority) {
    errors.priority = 'Task priority is required'
  }
  
  if (!taskData.assigned_to_id) {
    errors.assigned_to_id = 'Assigned staff is required'
  }
  
  if (!taskData.due_date) {
    errors.due_date = 'Due date is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Generates a unique room number
 * @param {Array} existingRooms - Array of existing rooms
 * @param {string} wardPrefix - Ward prefix for room numbering
 * @returns {string} Unique room number
 */
export function generateRoomNumber(existingRooms, wardPrefix = '') {
  const existingNumbers = existingRooms.map(room => room.number)
  let roomNumber = 1
  
  while (existingNumbers.includes(`${wardPrefix}${roomNumber}`)) {
    roomNumber++
  }
  
  return `${wardPrefix}${roomNumber}`
}

/**
 * Generates a unique bed number
 * @param {Array} existingBeds - Array of existing beds
 * @param {string} roomPrefix - Room prefix for bed numbering
 * @returns {string} Unique bed number
 */
export function generateBedNumber(existingBeds, roomPrefix = '') {
  const existingNumbers = existingBeds.map(bed => bed.number)
  let bedNumber = 1
  
  while (existingNumbers.includes(`${roomPrefix}${bedNumber}`)) {
    bedNumber++
  }
  
  return `${roomPrefix}${bedNumber}`
}

/**
 * Sorts rooms by number
 * @param {Array} rooms - Array of rooms
 * @returns {Array} Sorted rooms array
 */
export function sortRoomsByNumber(rooms) {
  return [...rooms].sort((a, b) => {
    const aNum = parseInt(a.number.replace(/\D/g, '')) || 0
    const bNum = parseInt(b.number.replace(/\D/g, '')) || 0
    return aNum - bNum
  })
}

/**
 * Sorts beds by number
 * @param {Array} beds - Array of beds
 * @returns {Array} Sorted beds array
 */
export function sortBedsByNumber(beds) {
  return [...beds].sort((a, b) => {
    const aNum = parseInt(a.number.replace(/\D/g, '')) || 0
    const bNum = parseInt(b.number.replace(/\D/g, '')) || 0
    return aNum - bNum
  })
}

/**
 * Filters rooms by availability
 * @param {Array} rooms - Array of rooms
 * @param {boolean} availableOnly - Whether to return only available rooms
 * @returns {Array} Filtered rooms array
 */
export function filterRoomsByAvailability(rooms, availableOnly = true) {
  if (availableOnly) {
    return rooms.filter(room => room.available_beds > 0)
  }
  return rooms
}

/**
 * Filters beds by availability
 * @param {Array} beds - Array of beds
 * @param {boolean} availableOnly - Whether to return only available beds
 * @returns {Array} Filtered beds array
 */
export function filterBedsByAvailability(beds, availableOnly = true) {
  if (availableOnly) {
    return beds.filter(bed => bed.status === 'available')
  }
  return beds
}

/**
 * Calculates ward statistics
 * @param {Object} ward - The ward object
 * @returns {Object} Ward statistics
 */
export function calculateWardStats(ward) {
  if (!ward || !ward.rooms) {
    return {
      totalRooms: 0,
      totalBeds: 0,
      availableBeds: 0,
      occupiedBeds: 0,
      occupancyRate: 0
    }
  }
  
  const totalRooms = ward.rooms.length
  const totalBeds = ward.rooms.reduce((sum, room) => sum + (room.beds?.length || 0), 0)
  const availableBeds = ward.rooms.reduce((sum, room) => sum + (room.available_beds || 0), 0)
  const occupiedBeds = totalBeds - availableBeds
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
  
  return {
    totalRooms,
    totalBeds,
    availableBeds,
    occupiedBeds,
    occupancyRate
  }
}

/**
 * Gets the next available bed in a ward
 * @param {Object} ward - The ward object
 * @returns {Object|null} Next available bed or null
 */
export function getNextAvailableBed(ward) {
  if (!ward || !ward.rooms) return null
  
  for (const room of ward.rooms) {
    if (room.beds) {
      const availableBed = room.beds.find(bed => bed.status === 'available')
      if (availableBed) {
        return availableBed
      }
    }
  }
  
  return null
}

/**
 * Checks if a ward has available beds
 * @param {Object} ward - The ward object
 * @returns {boolean} True if ward has available beds
 */
export function hasAvailableBeds(ward) {
  return ward && ward.available_beds > 0
}

/**
 * Gets ward capacity status
 * @param {Object} ward - The ward object
 * @returns {string} Capacity status ('low', 'medium', 'high', 'full')
 */
export function getWardCapacityStatus(ward) {
  if (!ward || !ward.total_beds) return 'unknown'
  
  const occupancyRate = calculateOccupancyRate(ward)
  
  if (occupancyRate >= 100) return 'full'
  if (occupancyRate >= 80) return 'high'
  if (occupancyRate >= 50) return 'medium'
  return 'low'
}
