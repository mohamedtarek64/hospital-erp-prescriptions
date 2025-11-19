/**
 * Laboratory Helper Functions
 * Utility functions for laboratory management
 */

/**
 * Format test status
 * @param {string} status - Test status
 * @returns {string} Formatted status
 */
export const formatTestStatus = (status) => {
  const statusMap = {
    'pending': 'في الانتظار',
    'in_progress': 'قيد التنفيذ',
    'completed': 'مكتمل',
    'cancelled': 'ملغي',
    'failed': 'فشل'
  }
  return statusMap[status] || status
}

/**
 * Format test priority
 * @param {string} priority - Test priority
 * @returns {string} Formatted priority
 */
export const formatTestPriority = (priority) => {
  const priorityMap = {
    'low': 'منخفض',
    'medium': 'متوسط',
    'high': 'عالي',
    'urgent': 'عاجل'
  }
  return priorityMap[priority] || priority
}

/**
 * Format specimen type
 * @param {string} type - Specimen type
 * @returns {string} Formatted type
 */
export const formatSpecimenType = (type) => {
  const typeMap = {
    'blood': 'دم',
    'urine': 'بول',
    'stool': 'براز',
    'sputum': 'بلغم',
    'tissue': 'نسيج',
    'other': 'أخرى'
  }
  return typeMap[type] || type
}

/**
 * Format test result
 * @param {object} result - Test result
 * @returns {string} Formatted result
 */
export const formatTestResult = (result) => {
  if (!result) return 'غير متوفر'
  
  if (result.normal) {
    return 'طبيعي'
  } else if (result.abnormal) {
    return 'غير طبيعي'
  } else if (result.critical) {
    return 'حرج'
  }
  
  return 'غير محدد'
}

/**
 * Calculate test turnaround time
 * @param {string} startTime - Test start time
 * @param {string} endTime - Test end time
 * @returns {string} Formatted turnaround time
 */
export const calculateTurnaroundTime = (startTime, endTime) => {
  if (!startTime || !endTime) return 'غير محدد'
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end - start
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours} ساعة ${diffMinutes} دقيقة`
  } else {
    return `${diffMinutes} دقيقة`
  }
}

/**
 * Format date for display
 * @param {string} date - Date string
 * @returns {string} Formatted date
 */
export const formatLabDate = (date) => {
  if (!date) return 'غير محدد'
  
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get test status color
 * @param {string} status - Test status
 * @returns {string} CSS color class
 */
export const getTestStatusColor = (status) => {
  const colorMap = {
    'pending': 'text-yellow-600 bg-yellow-100',
    'in_progress': 'text-blue-600 bg-blue-100',
    'completed': 'text-green-600 bg-green-100',
    'cancelled': 'text-gray-600 bg-gray-100',
    'failed': 'text-red-600 bg-red-100'
  }
  return colorMap[status] || 'text-gray-600 bg-gray-100'
}

/**
 * Get priority color
 * @param {string} priority - Test priority
 * @returns {string} CSS color class
 */
export const getPriorityColor = (priority) => {
  const colorMap = {
    'low': 'text-green-600 bg-green-100',
    'medium': 'text-yellow-600 bg-yellow-100',
    'high': 'text-orange-600 bg-orange-100',
    'urgent': 'text-red-600 bg-red-100'
  }
  return colorMap[priority] || 'text-gray-600 bg-gray-100'
}

/**
 * Validate test values
 * @param {object} testData - Test data
 * @returns {object} Validation result
 */
export const validateTestData = (testData) => {
  const errors = []
  
  if (!testData.name) {
    errors.push('اسم الاختبار مطلوب')
  }
  
  if (!testData.category) {
    errors.push('فئة الاختبار مطلوبة')
  }
  
  if (!testData.specimen_type) {
    errors.push('نوع العينة مطلوب')
  }
  
  if (testData.turnaround_time && testData.turnaround_time < 0) {
    errors.push('وقت الاستجابة يجب أن يكون موجب')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate test reference number
 * @returns {string} Test reference number
 */
export const generateTestReference = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 4)
  return `LAB-${timestamp}-${random}`.toUpperCase()
}

/**
 * Format test values for display
 * @param {object} values - Test values
 * @returns {string} Formatted values
 */
export const formatTestValues = (values) => {
  if (!values || typeof values !== 'object') return 'غير متوفر'
  
  const formatted = Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
  
  return formatted || 'غير متوفر'
}
