/**
 * Pharmacy Helper Functions
 */

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (short, long, time)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
    const dateObj = new Date(date)
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  }
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short)
}

/**
 * Calculate days until expiry
 * @param {string|Date} expiryDate - Expiry date
 * @returns {number} Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get stock status based on quantity and threshold
 * @param {number} quantity - Current stock quantity
 * @param {number} threshold - Low stock threshold
 * @returns {string} Stock status (low, medium, high)
 */
export const getStockStatus = (quantity, threshold = 10) => {
  if (quantity <= threshold) return 'low'
  if (quantity <= threshold * 2) return 'medium'
  return 'high'
}

/**
 * Get stock status color class
 * @param {string} status - Stock status
 * @returns {string} CSS class for stock status
 */
export const getStockStatusClass = (status) => {
  const classes = {
    low: 'stock-low',
    medium: 'stock-medium',
    high: 'stock-high'
  }
  return classes[status] || 'stock-medium'
}

/**
 * Validate medicine form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors
 */
export const validateMedicineForm = (formData) => {
  const errors = {}
  
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Medicine name is required and must be at least 2 characters'
  }
  
  if (!formData.unit_price || formData.unit_price <= 0) {
    errors.unit_price = 'Unit price must be greater than 0'
  }
  
  if (formData.category_id && !formData.category_id) {
    errors.category_id = 'Please select a category'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate purchase order form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors
 */
export const validatePurchaseOrderForm = (formData) => {
  const errors = {}
  
  if (!formData.supplier_id) {
    errors.supplier_id = 'Please select a supplier'
  }
  
  if (!formData.order_date) {
    errors.order_date = 'Order date is required'
  }
  
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one item is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Calculate total order amount
 * @param {Array} items - Order items
 * @returns {number} Total amount
 */
export const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unit_price)
  }, 0)
}

/**
 * Generate unique order number
 * @returns {string} Unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `PO-${timestamp}-${random}`.toUpperCase()
}

/**
 * Check if medicine is expiring soon
 * @param {string|Date} expiryDate - Expiry date
 * @param {number} daysThreshold - Days threshold (default: 30)
 * @returns {boolean} True if expiring soon
 */
export const isExpiringSoon = (expiryDate, daysThreshold = 30) => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0
}

/**
 * Get medicine status based on stock and expiry
 * @param {Object} medicine - Medicine object
 * @returns {string} Status (active, low_stock, expiring, expired)
 */
export const getMedicineStatus = (medicine) => {
  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date)
  const stockStatus = getStockStatus(medicine.quantity_in_stock, medicine.low_stock_threshold)
  
  if (daysUntilExpiry < 0) return 'expired'
  if (isExpiringSoon(medicine.expiry_date)) return 'expiring'
  if (stockStatus === 'low') return 'low_stock'
  return 'active'
}

/**
 * Format medicine dosage for display
 * @param {Object} prescription - Prescription object
 * @returns {string} Formatted dosage string
 */
export const formatDosage = (prescription) => {
  const { dosage, frequency, duration } = prescription
  return `${dosage} ${frequency} for ${duration}`
}

/**
 * Calculate prescription total cost
 * @param {Array} prescriptions - Array of prescriptions
 * @returns {number} Total cost
 */
export const calculatePrescriptionCost = (prescriptions) => {
  return prescriptions.reduce((total, prescription) => {
    return total + (prescription.quantity * prescription.unit_price)
  }, 0)
}

/**
 * Get prescription status color
 * @param {string} status - Prescription status
 * @returns {string} CSS class for status
 */
export const getPrescriptionStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    dispensed: 'status-dispensed',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

/**
 * Filter medicines by search term
 * @param {Array} medicines - Array of medicines
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered medicines
 */
export const filterMedicines = (medicines, searchTerm) => {
  if (!searchTerm) return medicines
  
  const term = searchTerm.toLowerCase()
  return medicines.filter(medicine => 
    medicine.name.toLowerCase().includes(term) ||
    medicine.generic_name.toLowerCase().includes(term) ||
    medicine.manufacturer.toLowerCase().includes(term)
  )
}

/**
 * Sort medicines by field
 * @param {Array} medicines - Array of medicines
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction (asc, desc)
 * @returns {Array} Sorted medicines
 */
export const sortMedicines = (medicines, field, direction = 'asc') => {
  return [...medicines].sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]
    
    // Handle string comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

/**
 * Export medicine data to CSV
 * @param {Array} medicines - Array of medicines
 * @param {string} filename - Filename for export
 */
export const exportMedicinesToCSV = (medicines, filename = 'medicines.csv') => {
  const headers = ['Name', 'Generic Name', 'Manufacturer', 'Category', 'Unit Price', 'Stock', 'Status']
  const csvContent = [
    headers.join(','),
    ...medicines.map(medicine => [
      `"${medicine.name}"`,
      `"${medicine.generic_name}"`,
      `"${medicine.manufacturer}"`,
      `"${medicine.category?.name || ''}"`,
      medicine.unit_price,
      medicine.quantity_in_stock,
      `"${getMedicineStatus(medicine)}"`
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Import medicines from CSV
 * @param {File} file - CSV file
 * @returns {Promise<Array>} Array of medicine objects
 */
export const importMedicinesFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        const medicines = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const medicine = {}
          
          headers.forEach((header, index) => {
            medicine[header.toLowerCase().replace(/\s+/g, '_')] = values[index]
          })
          
          return medicine
        }).filter(medicine => medicine.name) // Filter out empty rows
        
        resolve(medicines)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

/**
 * Get medicine statistics
 * @param {Array} medicines - Array of medicines
 * @returns {Object} Statistics object
 */
export const getMedicineStatistics = (medicines) => {
  const total = medicines.length
  const active = medicines.filter(m => getMedicineStatus(m) === 'active').length
  const lowStock = medicines.filter(m => getMedicineStatus(m) === 'low_stock').length
  const expiring = medicines.filter(m => getMedicineStatus(m) === 'expiring').length
  const expired = medicines.filter(m => getMedicineStatus(m) === 'expired').length
  
  const totalValue = medicines.reduce((sum, medicine) => {
    return sum + (medicine.quantity_in_stock * medicine.unit_price)
  }, 0)
  
  return {
    total,
    active,
    lowStock,
    expiring,
    expired,
    totalValue
  }
}