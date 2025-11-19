/**
 * Utility functions for medical records management
 */

/**
 * Format date to Arabic locale
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '-'
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      locale: 'ar-SA'
    }
    
    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    
    return dateObj.toLocaleDateString('ar-SA', options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} Short formatted date
 */
export const formatShortDate = (date) => {
  if (!date) return '-'
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting short date:', error)
    return '-'
  }
}

/**
 * Calculate days difference between two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Days difference
 */
export const getDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return 0
  
  try {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
    
    const diffTime = Math.abs(d2 - d1)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch (error) {
    console.error('Error calculating days difference:', error)
    return 0
  }
}

/**
 * Check if date is overdue
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if overdue
 */
export const isOverdue = (date) => {
  if (!date) return false
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return false
    
    return dateObj < new Date()
  } catch (error) {
    console.error('Error checking if date is overdue:', error)
    return false
  }
}

/**
 * Get status color for medical record status
 * @param {string} status - Status value
 * @returns {string} CSS color class
 */
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'text-green-600 bg-green-100',
    completed: 'text-blue-600 bg-blue-100',
    cancelled: 'text-red-600 bg-red-100',
    pending: 'text-yellow-600 bg-yellow-100',
    in_progress: 'text-orange-600 bg-orange-100',
    resolved: 'text-green-600 bg-green-100',
    chronic: 'text-purple-600 bg-purple-100',
    discontinued: 'text-gray-600 bg-gray-100',
    archived: 'text-gray-600 bg-gray-100',
    deleted: 'text-red-600 bg-red-100'
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-100'
}

/**
 * Get severity color for diagnosis
 * @param {string} severity - Severity value
 * @returns {string} CSS color class
 */
export const getSeverityColor = (severity) => {
  const severityColors = {
    mild: 'text-green-600 bg-green-100',
    moderate: 'text-yellow-600 bg-yellow-100',
    severe: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100'
  }
  
  return severityColors[severity] || 'text-gray-600 bg-gray-100'
}

/**
 * Get test type icon
 * @param {string} testType - Test type
 * @returns {string} Icon emoji or text
 */
export const getTestTypeIcon = (testType) => {
  const testTypeIcons = {
    blood: '🩸',
    urine: '💧',
    imaging: '📷',
    cardiac: '❤️',
    neurological: '🧠',
    other: '🔬'
  }
  
  return testTypeIcons[testType] || '🔬'
}

/**
 * Get file type icon
 * @param {string} fileType - File MIME type
 * @returns {string} Icon emoji
 */
export const getFileTypeIcon = (fileType) => {
  if (!fileType) return '📄'
  
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType.startsWith('application/pdf')) return '📄'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
  if (fileType.startsWith('text/')) return '📄'
  
  return '📄'
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate medical record data
 * @param {object} data - Medical record data
 * @returns {object} Validation result
 */
export const validateMedicalRecord = (data) => {
  const errors = {}
  
  if (!data.patient_id) {
    errors.patient_id = 'معرف المريض مطلوب'
  }
  
  if (!data.doctor_id) {
    errors.doctor_id = 'معرف الطبيب مطلوب'
  }
  
  if (!data.chief_complaint || data.chief_complaint.trim().length < 10) {
    errors.chief_complaint = 'الشكوى الرئيسية يجب أن تكون 10 أحرف على الأقل'
  }
  
  if (!data.examination_notes || data.examination_notes.trim().length < 20) {
    errors.examination_notes = 'ملاحظات الفحص يجب أن تكون 20 حرف على الأقل'
  }
  
  if (!data.diagnosis || data.diagnosis.trim().length < 10) {
    errors.diagnosis = 'التشخيص يجب أن يكون 10 أحرف على الأقل'
  }
  
  if (!data.treatment_plan || data.treatment_plan.trim().length < 20) {
    errors.treatment_plan = 'خطة العلاج يجب أن تكون 20 حرف على الأقل'
  }
  
  if (data.follow_up_date) {
    const followUpDate = new Date(data.follow_up_date)
    const today = new Date()
    
    if (followUpDate < today) {
      errors.follow_up_date = 'تاريخ المتابعة يجب أن يكون في المستقبل'
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate prescription data
 * @param {object} data - Prescription data
 * @returns {object} Validation result
 */
export const validatePrescription = (data) => {
  const errors = {}
  
  if (!data.medication_name || data.medication_name.trim().length < 3) {
    errors.medication_name = 'اسم الدواء يجب أن يكون 3 أحرف على الأقل'
  }
  
  if (!data.dosage || data.dosage.trim().length < 2) {
    errors.dosage = 'الجرعة مطلوبة'
  }
  
  if (!data.frequency || data.frequency.trim().length < 2) {
    errors.frequency = 'التكرار مطلوب'
  }
  
  if (!data.duration || data.duration.trim().length < 2) {
    errors.duration = 'المدة مطلوبة'
  }
  
  if (!data.start_date) {
    errors.start_date = 'تاريخ البدء مطلوب'
  }
  
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    
    if (endDate <= startDate) {
      errors.end_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate medical test data
 * @param {object} data - Medical test data
 * @returns {object} Validation result
 */
export const validateMedicalTest = (data) => {
  const errors = {}
  
  if (!data.test_name || data.test_name.trim().length < 3) {
    errors.test_name = 'اسم الفحص يجب أن يكون 3 أحرف على الأقل'
  }
  
  if (!data.test_type) {
    errors.test_type = 'نوع الفحص مطلوب'
  }
  
  if (!data.test_date) {
    errors.test_date = 'تاريخ الفحص مطلوب'
  }
  
  if (data.test_date) {
    const testDate = new Date(data.test_date)
    const today = new Date()
    
    if (testDate > today) {
      errors.test_date = 'تاريخ الفحص لا يمكن أن يكون في المستقبل'
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Generate medical record number
 * @returns {string} Medical record number
 */
export const generateMedicalRecordNumber = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `MR-${timestamp}-${random}`
}

/**
 * Check if user can edit medical record
 * @param {object} record - Medical record
 * @param {object} user - Current user
 * @returns {boolean} True if user can edit
 */
export const canEditMedicalRecord = (record, user) => {
  if (!record || !user) return false
  
  // Admin can edit all records
  if (user.role === 'admin') return true
  
  // Doctor can edit their own records
  if (user.role === 'doctor' && record.doctor_id === user.id) return true
  
  // Nurse can edit records in their department
  if (user.role === 'nurse' && record.patient?.department === user.department) return true
  
  return false
}

/**
 * Check if user can delete medical record
 * @param {object} record - Medical record
 * @param {object} user - Current user
 * @returns {boolean} True if user can delete
 */
export const canDeleteMedicalRecord = (record, user) => {
  if (!record || !user) return false
  
  // Only admin can delete records
  if (user.role === 'admin') return true
  
  // Doctor can delete their own records if they're not completed
  if (user.role === 'doctor' && 
      record.doctor_id === user.id && 
      record.status !== 'completed') return true
  
  return false
}

/**
 * Get medical record summary
 * @param {object} record - Medical record
 * @returns {string} Summary text
 */
export const getMedicalRecordSummary = (record) => {
  if (!record) return ''
  
  const chiefComplaint = record.chief_complaint?.substring(0, 100) || ''
  const diagnosis = record.diagnosis?.substring(0, 100) || ''
  
  return `${chiefComplaint} - ${diagnosis}`
}

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0
  
  try {
    const birth = new Date(birthDate)
    const today = new Date()
    
    if (isNaN(birth.getTime())) return 0
    
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    console.error('Error calculating age:', error)
    return 0
  }
}

/**
 * Get urgency level for medical record
 * @param {object} record - Medical record
 * @returns {string} Urgency level
 */
export const getUrgencyLevel = (record) => {
  if (!record) return 'normal'
  
  // Check if follow-up is overdue
  if (record.follow_up_date && isOverdue(record.follow_up_date)) {
    return 'urgent'
  }
  
  // Check diagnosis severity
  if (record.diagnoses && record.diagnoses.length > 0) {
    const criticalDiagnosis = record.diagnoses.find(d => d.severity === 'critical')
    if (criticalDiagnosis) return 'critical'
    
    const severeDiagnosis = record.diagnoses.find(d => d.severity === 'severe')
    if (severeDiagnosis) return 'high'
  }
  
  return 'normal'
}

/**
 * Get urgency color
 * @param {string} urgency - Urgency level
 * @returns {string} CSS color class
 */
export const getUrgencyColor = (urgency) => {
  const urgencyColors = {
    normal: 'text-green-600 bg-green-100',
    high: 'text-orange-600 bg-orange-100',
    urgent: 'text-red-600 bg-red-100',
    critical: 'text-red-800 bg-red-200'
  }
  
  return urgencyColors[urgency] || 'text-gray-600 bg-gray-100'
}
