// MedicalRecordDetails Component Utility Functions

import { formatDate, getStatusColor } from '@/utils/medicalHelpers'

// Tabs configuration
export const tabs = [
  { id: 'overview', name: 'نظرة عامة', icon: '📋' },
  { id: 'diagnoses', name: 'التشخيصات', icon: '🔍' },
  { id: 'prescriptions', name: 'الوصفات', icon: '💊' },
  { id: 'tests', name: 'الفحوصات', icon: '🔬' },
  { id: 'timeline', name: 'الجدول الزمني', icon: '📅' }
]

// Utility functions for severity colors
export const getSeverityColor = (severity) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return colors[severity] || colors.medium
}

export const getSeverityText = (severity) => {
  const texts = {
    low: 'خفيف',
    medium: 'متوسط',
    high: 'عالي',
    critical: 'حرج'
  }
  return texts[severity] || severity
}

// Utility functions for prescription status
export const getPrescriptionStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    discontinued: 'bg-red-100 text-red-800'
  }
  return colors[status] || colors.active
}

export const getPrescriptionStatusText = (status) => {
  const texts = {
    active: 'نشط',
    completed: 'مكتمل',
    discontinued: 'متوقف'
  }
  return texts[status] || status
}

// Utility functions for test status
export const getTestStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || colors.pending
}

export const getTestStatusText = (status) => {
  const texts = {
    pending: 'في الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  }
  return texts[status] || status
}

// Utility functions for priority colors
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return colors[priority] || colors.medium
}

// Export utility functions
export {
  formatDate,
  getStatusColor
}
