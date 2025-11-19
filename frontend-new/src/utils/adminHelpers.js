/**
 * Admin Helpers
 * 
 * Utility functions for admin operations
 */

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  if (!date) return 'Never'
  
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time to readable format
 */
export const formatTime = (date) => {
  if (!date) return 'Never'
  
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format date and time to readable format
 */
export const formatDateTime = (date) => {
  if (!date) return 'Never'
  
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return 'Never'
  
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

/**
 * Get status badge class
 */
export const getStatusClass = (status) => {
  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status icon
 */
export const getStatusIcon = (status) => {
  const statusIcons = {
    active: 'fas fa-check-circle',
    inactive: 'fas fa-times-circle',
    pending: 'fas fa-clock',
    completed: 'fas fa-check-circle',
    failed: 'fas fa-times-circle',
    in_progress: 'fas fa-spinner',
    scheduled: 'fas fa-calendar',
    cancelled: 'fas fa-ban'
  }
  
  return statusIcons[status] || 'fas fa-question-circle'
}

/**
 * Get action badge class
 */
export const getActionClass = (action) => {
  const actionClasses = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    view: 'bg-gray-100 text-gray-800',
    login: 'bg-green-100 text-green-800',
    logout: 'bg-orange-100 text-orange-800',
    backup: 'bg-purple-100 text-purple-800',
    restore: 'bg-indigo-100 text-indigo-800',
    export: 'bg-cyan-100 text-cyan-800',
    import: 'bg-teal-100 text-teal-800'
  }
  
  return actionClasses[action] || 'bg-gray-100 text-gray-800'
}

/**
 * Get action icon
 */
export const getActionIcon = (action) => {
  const actionIcons = {
    create: 'fas fa-plus',
    update: 'fas fa-edit',
    delete: 'fas fa-trash',
    view: 'fas fa-eye',
    login: 'fas fa-sign-in-alt',
    logout: 'fas fa-sign-out-alt',
    backup: 'fas fa-download',
    restore: 'fas fa-undo',
    export: 'fas fa-file-export',
    import: 'fas fa-file-import'
  }
  
  return actionIcons[action] || 'fas fa-question'
}

/**
 * Get action label
 */
export const getActionLabel = (action) => {
  const actionLabels = {
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    view: 'View',
    login: 'Login',
    logout: 'Logout',
    backup: 'Backup',
    restore: 'Restore',
    export: 'Export',
    import: 'Import'
  }
  
  return actionLabels[action] || action
}

/**
 * Get module badge class
 */
export const getModuleClass = (module) => {
  const moduleClasses = {
    auth: 'bg-blue-100 text-blue-800',
    dashboard: 'bg-purple-100 text-purple-800',
    patients: 'bg-green-100 text-green-800',
    appointments: 'bg-yellow-100 text-yellow-800',
    medical_records: 'bg-indigo-100 text-indigo-800',
    pharmacy: 'bg-pink-100 text-pink-800',
    laboratory: 'bg-cyan-100 text-cyan-800',
    billing: 'bg-orange-100 text-orange-800',
    wards: 'bg-teal-100 text-teal-800',
    reports: 'bg-red-100 text-red-800',
    quality: 'bg-emerald-100 text-emerald-800',
    admin: 'bg-gray-100 text-gray-800',
    settings: 'bg-slate-100 text-slate-800',
    users: 'bg-violet-100 text-violet-800',
    roles: 'bg-amber-100 text-amber-800'
  }
  
  return moduleClasses[module] || 'bg-gray-100 text-gray-800'
}

/**
 * Get module icon
 */
export const getModuleIcon = (module) => {
  const moduleIcons = {
    auth: 'fas fa-lock',
    dashboard: 'fas fa-tachometer-alt',
    patients: 'fas fa-user-injured',
    appointments: 'fas fa-calendar-check',
    medical_records: 'fas fa-file-medical',
    pharmacy: 'fas fa-pills',
    laboratory: 'fas fa-flask',
    billing: 'fas fa-receipt',
    wards: 'fas fa-bed',
    reports: 'fas fa-chart-bar',
    quality: 'fas fa-shield-alt',
    admin: 'fas fa-cogs',
    settings: 'fas fa-cog',
    users: 'fas fa-users',
    roles: 'fas fa-user-shield'
  }
  
  return moduleIcons[module] || 'fas fa-folder'
}

/**
 * Get module label
 */
export const getModuleLabel = (module) => {
  const moduleLabels = {
    auth: 'Authentication',
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
    medical_records: 'Medical Records',
    pharmacy: 'Pharmacy',
    laboratory: 'Laboratory',
    billing: 'Billing',
    wards: 'Ward Management',
    reports: 'Reports',
    quality: 'Quality Assurance',
    admin: 'Administration',
    settings: 'Settings',
    users: 'User Management',
    roles: 'Role Management'
  }
  
  return moduleLabels[module] || module
}

/**
 * Get type badge class
 */
export const getTypeClass = (type) => {
  const typeClasses = {
    string: 'bg-blue-100 text-blue-800',
    integer: 'bg-green-100 text-green-800',
    float: 'bg-yellow-100 text-yellow-800',
    boolean: 'bg-purple-100 text-purple-800',
    json: 'bg-indigo-100 text-indigo-800'
  }
  
  return typeClasses[type] || 'bg-gray-100 text-gray-800'
}

/**
 * Get type icon
 */
export const getTypeIcon = (type) => {
  const typeIcons = {
    string: 'fas fa-font',
    integer: 'fas fa-hashtag',
    float: 'fas fa-calculator',
    boolean: 'fas fa-toggle-on',
    json: 'fas fa-code'
  }
  
  return typeIcons[type] || 'fas fa-question'
}

/**
 * Get backup type class
 */
export const getBackupTypeClass = (type) => {
  const typeClasses = {
    full: 'bg-purple-100 text-purple-800',
    incremental: 'bg-blue-100 text-blue-800',
    differential: 'bg-indigo-100 text-indigo-800',
    manual: 'bg-green-100 text-green-800',
    automatic: 'bg-orange-100 text-orange-800'
  }
  
  return typeClasses[type] || 'bg-gray-100 text-gray-800'
}

/**
 * Get backup type icon
 */
export const getBackupTypeIcon = (type) => {
  const typeIcons = {
    full: 'fas fa-server',
    incremental: 'fas fa-plus-circle',
    differential: 'fas fa-layer-group',
    manual: 'fas fa-hand-paper',
    automatic: 'fas fa-robot'
  }
  
  return typeIcons[type] || 'fas fa-archive'
}

/**
 * Get backup type label
 */
export const getBackupTypeLabel = (type) => {
  const typeLabels = {
    full: 'Full Backup',
    incremental: 'Incremental',
    differential: 'Differential',
    manual: 'Manual',
    automatic: 'Automatic'
  }
  
  return typeLabels[type] || type
}

/**
 * Get category icon
 */
export const getCategoryIcon = (category) => {
  const categoryIcons = {
    general: 'fas fa-cog',
    system: 'fas fa-server',
    backup: 'fas fa-archive',
    security: 'fas fa-shield-alt',
    email: 'fas fa-envelope',
    sms: 'fas fa-sms',
    notification: 'fas fa-bell',
    appearance: 'fas fa-palette',
    integration: 'fas fa-plug',
    maintenance: 'fas fa-tools'
  }
  
  return categoryIcons[category] || 'fas fa-folder'
}

/**
 * Format category name
 */
export const formatCategoryName = (category) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get age text (e.g., "2 days ago")
 */
export const getAgeText = (date) => {
  return getRelativeTime(date)
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
}

/**
 * Generate pagination pages
 */
export const generatePaginationPages = (currentPage, lastPage, maxVisible = 5) => {
  const pages = []
  const half = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage - half)
  let end = Math.min(lastPage, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
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
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  return formatBytes(bytes)
}

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

/**
 * Check if file is image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  return imageExtensions.includes(getFileExtension(filename))
}

/**
 * Check if file is document
 */
export const isDocumentFile = (filename) => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  return documentExtensions.includes(getFileExtension(filename))
}

/**
 * Generate random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize HTML
 */
export const sanitizeHtml = (html) => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

/**
 * Get nested object value
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue
  }, obj)
}

/**
 * Set nested object value
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}
