/**
 * @module reportHelpers
 * @description Utility functions for reports and analytics
 */

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (short, long, time)
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  }

  return dateObj.toLocaleDateString('ar-SA', options[format] || options.short)
}

/**
 * Format number with thousands separator
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(number, decimals = 0) {
  if (typeof number !== 'number' || isNaN(number)) return '0'
  
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'SAR') {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00 ر.س'
  
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  
  return new Intl.NumberFormat('ar-SA', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

/**
 * Get status color class
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
export function getStatusColor(status) {
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    processing: 'text-blue-600 bg-blue-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    cancelled: 'text-gray-600 bg-gray-100',
    scheduled: 'text-purple-600 bg-purple-100',
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100'
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-100'
}

/**
 * Get priority color class
 * @param {string} priority - Priority value
 * @returns {string} CSS class name
 */
export function getPriorityColor(priority) {
  const priorityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    urgent: 'text-red-600 bg-red-100',
    critical: 'text-red-800 bg-red-200'
  }
  
  return priorityColors[priority] || 'text-gray-600 bg-gray-100'
}

/**
 * Get report type icon
 * @param {string} type - Report type
 * @returns {string} Icon name
 */
export function getReportTypeIcon(type) {
  const typeIcons = {
    financial: 'chart-line',
    patient: 'user',
    appointment: 'calendar',
    laboratory: 'flask',
    pharmacy: 'pills',
    staff: 'users',
    inventory: 'box',
    revenue: 'dollar-sign',
    performance: 'trending-up',
    custom: 'file-text'
  }
  
  return typeIcons[type] || 'file'
}

/**
 * Calculate time difference
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Time difference description
 */
export function getTimeDifference(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  
  if (diffMs < 0) return 'منتهي'
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} يوم`
  } else if (diffHours > 0) {
    return `${diffHours} ساعة`
  } else {
    return `${diffMinutes} دقيقة`
  }
}

/**
 * Generate chart colors
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color values
 */
export function generateChartColors(count) {
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6B7280'  // gray-500
  ]
  
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  
  return result
}

/**
 * Format data for export
 * @param {Array} data - Data to format
 * @param {string} format - Export format (csv, excel, json)
 * @returns {string} Formatted data
 */
export function formatDataForExport(data, format = 'csv') {
  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }
  
  switch (format.toLowerCase()) {
    case 'csv':
      return formatAsCSV(data)
    case 'json':
      return JSON.stringify(data, null, 2)
    case 'excel':
      return formatAsCSV(data) // Simplified - in real app, use a library like xlsx
    default:
      return JSON.stringify(data, null, 2)
  }
}

/**
 * Format data as CSV
 * @param {Array} data - Data to format
 * @returns {string} CSV formatted string
 */
function formatAsCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

/**
 * Validate report parameters
 * @param {Object} parameters - Parameters to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export function validateReportParameters(parameters, schema) {
  const errors = {}
  const warnings = {}
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = parameters[key]
    
    // Required validation
    if (rules.required && (!value || value === '')) {
      errors[key] = 'هذا الحقل مطلوب'
      continue
    }
    
    // Type validation
    if (value && rules.type) {
      if (rules.type === 'date' && isNaN(new Date(value).getTime())) {
        errors[key] = 'تاريخ غير صحيح'
      } else if (rules.type === 'number' && isNaN(Number(value))) {
        errors[key] = 'رقم غير صحيح'
      } else if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[key] = 'بريد إلكتروني غير صحيح'
      }
    }
    
    // Range validation
    if (value && rules.min !== undefined && Number(value) < rules.min) {
      errors[key] = `القيمة يجب أن تكون أكبر من أو تساوي ${rules.min}`
    }
    
    if (value && rules.max !== undefined && Number(value) > rules.max) {
      errors[key] = `القيمة يجب أن تكون أقل من أو تساوي ${rules.max}`
    }
    
    // Custom validation
    if (value && rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value, parameters)
      if (customResult !== true) {
        errors[key] = customResult
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

/**
 * Generate report filename
 * @param {string} reportType - Type of report
 * @param {Object} parameters - Report parameters
 * @returns {string} Generated filename
 */
export function generateReportFilename(reportType, parameters = {}) {
  const timestamp = new Date().toISOString().split('T')[0]
  const typeNames = {
    financial: 'مالي',
    patient: 'مرضى',
    appointment: 'مواعيد',
    laboratory: 'مختبر',
    pharmacy: 'صيدلية',
    staff: 'موظفين',
    inventory: 'مخزون',
    revenue: 'إيرادات',
    performance: 'أداء',
    custom: 'مخصص'
  }
  
  const typeName = typeNames[reportType] || reportType
  const dateRange = parameters.start_date && parameters.end_date 
    ? `_${parameters.start_date}_${parameters.end_date}`
    : ''
  
  return `تقرير_${typeName}_${timestamp}${dateRange}`
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Get relative time string
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = now - targetDate
  
  if (diffMs < 0) return 'في المستقبل'
  
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffYears > 0) return `منذ ${diffYears} سنة`
  if (diffMonths > 0) return `منذ ${diffMonths} شهر`
  if (diffWeeks > 0) return `منذ ${diffWeeks} أسبوع`
  if (diffDays > 0) return `منذ ${diffDays} يوم`
  if (diffHours > 0) return `منذ ${diffHours} ساعة`
  if (diffMinutes > 0) return `منذ ${diffMinutes} دقيقة`
  
  return 'الآن'
}

export const reportHelpers = {
  formatDate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  getStatusColor,
  getPriorityColor,
  getReportTypeIcon,
  getTimeDifference,
  generateChartColors,
  formatDataForExport,
  validateReportParameters,
  generateReportFilename,
  debounce,
  throttle,
  getRelativeTime
}
