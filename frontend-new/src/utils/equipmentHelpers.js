/**
 * Equipment Helper Utilities
 * Common functions for equipment management across the application
 */

/**
 * Format equipment status for display
 * @param {string} status - Equipment status
 * @returns {Object} Formatted status object with color and text
 */
export const formatEquipmentStatus = (status) => {
  const statusMap = {
    available: {
      text: 'Available',
      color: 'success',
      bgColor: '#dcfce7',
      textColor: '#166534'
    },
    in_use: {
      text: 'In Use',
      color: 'warning',
      bgColor: '#fef3c7',
      textColor: '#92400e'
    },
    maintenance: {
      text: 'Maintenance',
      color: 'danger',
      bgColor: '#fee2e2',
      textColor: '#991b1b'
    },
    out_of_order: {
      text: 'Out of Order',
      color: 'secondary',
      bgColor: '#f3f4f6',
      textColor: '#374151'
    }
  }

  return statusMap[status] || statusMap.out_of_order
}

/**
 * Calculate equipment utilization percentage
 * @param {number} usageHours - Total usage hours
 * @param {number} availableHours - Total available hours
 * @returns {number} Utilization percentage
 */
export const calculateUtilization = (usageHours, availableHours) => {
  if (availableHours === 0) return 0
  return Math.round((usageHours / availableHours) * 100)
}

/**
 * Get equipment condition rating text
 * @param {number} rating - Condition rating (1-10)
 * @returns {Object} Condition object with text and color
 */
export const getConditionRating = (rating) => {
  if (rating >= 8) {
    return {
      text: 'Excellent',
      color: 'success',
      bgColor: '#dcfce7',
      textColor: '#166534'
    }
  } else if (rating >= 6) {
    return {
      text: 'Good',
      color: 'info',
      bgColor: '#dbeafe',
      textColor: '#1e40af'
    }
  } else if (rating >= 4) {
    return {
      text: 'Fair',
      color: 'warning',
      bgColor: '#fef3c7',
      textColor: '#92400e'
    }
  } else if (rating >= 2) {
    return {
      text: 'Poor',
      color: 'danger',
      bgColor: '#fed7aa',
      textColor: '#c2410c'
    }
  } else {
    return {
      text: 'Critical',
      color: 'danger',
      bgColor: '#fee2e2',
      textColor: '#991b1b'
    }
  }
}

/**
 * Calculate days until next maintenance
 * @param {string} lastMaintenanceDate - Last maintenance date
 * @param {number} maintenanceInterval - Maintenance interval in days
 * @returns {number} Days until next maintenance
 */
export const getDaysUntilMaintenance = (lastMaintenanceDate, maintenanceInterval) => {
  if (!lastMaintenanceDate || !maintenanceInterval) return null
  
  const lastDate = new Date(lastMaintenanceDate)
  const nextDate = new Date(lastDate.getTime() + (maintenanceInterval * 24 * 60 * 60 * 1000))
  const now = new Date()
  const diffTime = nextDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Check if equipment needs maintenance
 * @param {string} lastMaintenanceDate - Last maintenance date
 * @param {number} maintenanceInterval - Maintenance interval in days
 * @param {number} warningDays - Days before maintenance to show warning
 * @returns {Object} Maintenance status object
 */
export const checkMaintenanceStatus = (lastMaintenanceDate, maintenanceInterval, warningDays = 7) => {
  const daysUntil = getDaysUntilMaintenance(lastMaintenanceDate, maintenanceInterval)
  
  if (daysUntil === null) {
    return {
      status: 'unknown',
      text: 'Unknown',
      color: 'secondary',
      urgent: false
    }
  }
  
  if (daysUntil <= 0) {
    return {
      status: 'overdue',
      text: 'Overdue',
      color: 'danger',
      urgent: true,
      days: Math.abs(daysUntil)
    }
  } else if (daysUntil <= warningDays) {
    return {
      status: 'warning',
      text: 'Due Soon',
      color: 'warning',
      urgent: true,
      days: daysUntil
    }
  } else {
    return {
      status: 'ok',
      text: 'OK',
      color: 'success',
      urgent: false,
      days: daysUntil
    }
  }
}

/**
 * Format equipment serial number for display
 * @param {string} serialNumber - Equipment serial number
 * @returns {string} Formatted serial number
 */
export const formatSerialNumber = (serialNumber) => {
  if (!serialNumber) return 'N/A'
  return serialNumber.toUpperCase()
}

/**
 * Get equipment icon based on category
 * @param {string} category - Equipment category
 * @returns {string} Font Awesome icon class
 */
export const getEquipmentIcon = (category) => {
  const iconMap = {
    'Medical': 'fas fa-stethoscope',
    'Surgical': 'fas fa-cut',
    'Diagnostic': 'fas fa-search',
    'Monitoring': 'fas fa-heartbeat',
    'Laboratory': 'fas fa-flask',
    'Imaging': 'fas fa-x-ray',
    'Therapy': 'fas fa-hand-holding-medical',
    'Emergency': 'fas fa-ambulance',
    'Respiratory': 'fas fa-lungs',
    'Cardiac': 'fas fa-heart',
    'Neurological': 'fas fa-brain',
    'Orthopedic': 'fas fa-bone',
    'Dental': 'fas fa-tooth',
    'Ophthalmic': 'fas fa-eye',
    'Dermatology': 'fas fa-hand-paper',
    'Urology': 'fas fa-kidneys',
    'Gynecology': 'fas fa-female',
    'Pediatrics': 'fas fa-baby',
    'Geriatrics': 'fas fa-wheelchair',
    'Oncology': 'fas fa-ribbon',
    'default': 'fas fa-cog'
  }
  
  return iconMap[category] || iconMap.default
}

/**
 * Calculate equipment value depreciation
 * @param {number} purchasePrice - Original purchase price
 * @param {string} purchaseDate - Purchase date
 * @param {number} depreciationRate - Annual depreciation rate (percentage)
 * @returns {Object} Depreciation information
 */
export const calculateDepreciation = (purchasePrice, purchaseDate, depreciationRate = 10) => {
  if (!purchasePrice || !purchaseDate) return null
  
  const purchase = new Date(purchaseDate)
  const now = new Date()
  const yearsOld = (now - purchase) / (1000 * 60 * 60 * 24 * 365)
  
  const annualDepreciation = purchasePrice * (depreciationRate / 100)
  const totalDepreciation = annualDepreciation * yearsOld
  const currentValue = Math.max(0, purchasePrice - totalDepreciation)
  
  return {
    originalValue: purchasePrice,
    currentValue: Math.round(currentValue),
    totalDepreciation: Math.round(totalDepreciation),
    yearsOld: Math.round(yearsOld * 10) / 10,
    depreciationRate
  }
}

/**
 * Generate equipment QR code data
 * @param {Object} equipment - Equipment object
 * @returns {string} QR code data string
 */
export const generateQRCodeData = (equipment) => {
  const data = {
    id: equipment.id,
    name: equipment.name,
    serial: equipment.serial_number,
    type: equipment.category?.name,
    location: equipment.location?.name
  }
  
  return JSON.stringify(data)
}

/**
 * Validate equipment data
 * @param {Object} equipment - Equipment data to validate
 * @returns {Object} Validation result with errors array
 */
export const validateEquipmentData = (equipment) => {
  const errors = []
  
  if (!equipment.name || equipment.name.trim().length < 2) {
    errors.push('Equipment name must be at least 2 characters long')
  }
  
  if (!equipment.serial_number || equipment.serial_number.trim().length < 3) {
    errors.push('Serial number must be at least 3 characters long')
  }
  
  if (!equipment.category_id) {
    errors.push('Equipment category is required')
  }
  
  if (!equipment.location_id) {
    errors.push('Equipment location is required')
  }
  
  if (equipment.purchase_price && equipment.purchase_price < 0) {
    errors.push('Purchase price cannot be negative')
  }
  
  if (equipment.condition_rating && (equipment.condition_rating < 1 || equipment.condition_rating > 10)) {
    errors.push('Condition rating must be between 1 and 10')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sort equipment by various criteria
 * @param {Array} equipmentList - Array of equipment objects
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Array} Sorted equipment array
 */
export const sortEquipment = (equipmentList, sortBy = 'name', sortOrder = 'asc') => {
  return [...equipmentList].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    // Handle nested properties
    if (sortBy.includes('.')) {
      const keys = sortBy.split('.')
      aValue = keys.reduce((obj, key) => obj?.[key], a)
      bValue = keys.reduce((obj, key) => obj?.[key], b)
    }
    
    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1
    } else {
      return aValue > bValue ? 1 : -1
    }
  })
}

/**
 * Filter equipment by search criteria
 * @param {Array} equipmentList - Array of equipment objects
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered equipment array
 */
export const filterEquipment = (equipmentList, searchQuery = '', filters = {}) => {
  return equipmentList.filter(equipment => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchFields = [
        equipment.name,
        equipment.model,
        equipment.serial_number,
        equipment.category?.name,
        equipment.location?.name
      ]
      
      const matchesSearch = searchFields.some(field => 
        field && field.toLowerCase().includes(query)
      )
      
      if (!matchesSearch) return false
    }
    
    // Status filter
    if (filters.status && equipment.status !== filters.status) {
      return false
    }
    
    // Category filter
    if (filters.category_id && equipment.category_id !== filters.category_id) {
      return false
    }
    
    // Location filter
    if (filters.location_id && equipment.location_id !== filters.location_id) {
      return false
    }
    
    // Condition filter
    if (filters.condition_rating) {
      const rating = parseInt(filters.condition_rating)
      if (equipment.condition_rating < rating) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Export equipment data to CSV
 * @param {Array} equipmentList - Array of equipment objects
 * @param {Array} fields - Fields to export
 * @returns {string} CSV data string
 */
export const exportEquipmentToCSV = (equipmentList, fields = []) => {
  const defaultFields = [
    'name',
    'model',
    'serial_number',
    'category.name',
    'location.name',
    'status',
    'condition_rating',
    'purchase_date',
    'purchase_price'
  ]
  
  const exportFields = fields.length > 0 ? fields : defaultFields
  
  // Create header row
  const headers = exportFields.map(field => {
    return field.replace('.', ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  })
  
  // Create data rows
  const rows = equipmentList.map(equipment => {
    return exportFields.map(field => {
      let value = equipment
      const keys = field.split('.')
      
      for (const key of keys) {
        value = value?.[key]
      }
      
      // Format value for CSV
      if (value === null || value === undefined) {
        return ''
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    })
  })
  
  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')
  
  return csvContent
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Date format (short, long, time)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A'
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  }
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short)
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Generate equipment statistics
 * @param {Array} equipmentList - Array of equipment objects
 * @returns {Object} Statistics object
 */
export const generateEquipmentStats = (equipmentList) => {
  const total = equipmentList.length
  const byStatus = equipmentList.reduce((acc, equipment) => {
    acc[equipment.status] = (acc[equipment.status] || 0) + 1
    return acc
  }, {})
  
  const byCategory = equipmentList.reduce((acc, equipment) => {
    const category = equipment.category?.name || 'Unknown'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})
  
  const totalValue = equipmentList.reduce((sum, equipment) => {
    return sum + (equipment.purchase_price || 0)
  }, 0)
  
  const averageCondition = equipmentList.reduce((sum, equipment) => {
    return sum + (equipment.condition_rating || 0)
  }, 0) / total
  
  return {
    total,
    byStatus,
    byCategory,
    totalValue,
    averageCondition: Math.round(averageCondition * 10) / 10
  }
}
