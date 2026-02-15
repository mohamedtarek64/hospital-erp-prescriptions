/**
 * Billing & Financial Management Utility Functions
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '$0.00'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style ('short', 'long', 'relative')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'relative':
      return getRelativeTimeString(dateObj)
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
  }
}

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (date) => {
  const now = new Date()
  const diffInMs = now - date
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays === -1) return 'Tomorrow'
  if (diffInDays > 0) return `${diffInDays} days ago`
  if (diffInDays < 0) return `In ${Math.abs(diffInDays)} days`
  
  return formatDate(date)
}

/**
 * Calculate invoice totals
 * @param {Array} items - Invoice items
 * @param {number} discountAmount - Discount amount
 * @returns {Object} Calculated totals
 */
export const calculateInvoiceTotals = (items, discountAmount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.unit_price * item.quantity)
  }, 0)
  
  const taxAmount = items.reduce((sum, item) => {
    const itemTotal = item.unit_price * item.quantity
    const itemTax = itemTotal * (item.tax_rate / 100)
    return sum + itemTax
  }, 0)
  
  const totalAmount = subtotal + taxAmount - discountAmount
  
  return {
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount
  }
}

/**
 * Get invoice status color class
 * @param {string} status - Invoice status
 * @returns {string} CSS class for status color
 */
export const getInvoiceStatusColor = (status) => {
  const statusColors = {
    draft: 'status-draft',
    sent: 'status-sent',
    paid: 'status-paid',
    overdue: 'status-overdue',
    cancelled: 'status-cancelled'
  }
  
  return statusColors[status] || 'status-draft'
}

/**
 * Get payment method color class
 * @param {string} method - Payment method
 * @returns {string} CSS class for payment method color
 */
export const getPaymentMethodColor = (method) => {
  const methodColors = {
    cash: 'method-cash',
    card: 'method-card',
    bank_transfer: 'method-bank_transfer',
    check: 'method-check',
    insurance: 'method-insurance'
  }
  
  return methodColors[method] || 'method-cash'
}

/**
 * Get insurance claim status color class
 * @param {string} status - Insurance claim status
 * @returns {string} CSS class for status color
 */
export const getInsuranceClaimStatusColor = (status) => {
  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700'
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-700'
}

/**
 * Validate invoice data
 * @param {Object} invoiceData - Invoice data to validate
 * @returns {Object} Validation result
 */
export const validateInvoiceData = (invoiceData) => {
  const errors = {}
  
  if (!invoiceData.patient_id) {
    errors.patient_id = 'Patient is required'
  }
  
  if (!invoiceData.invoice_date) {
    errors.invoice_date = 'Invoice date is required'
  }
  
  if (!invoiceData.due_date) {
    errors.due_date = 'Due date is required'
  }
  
  if (invoiceData.due_date && invoiceData.invoice_date) {
    const dueDate = new Date(invoiceData.due_date)
    const invoiceDate = new Date(invoiceData.invoice_date)
    
    if (dueDate < invoiceDate) {
      errors.due_date = 'Due date cannot be before invoice date'
    }
  }
  
  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.items = 'At least one item is required'
  }
  
  if (invoiceData.items) {
    invoiceData.items.forEach((item, index) => {
      if (!item.service_id) {
        errors[`items.${index}.service_id`] = 'Service is required'
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${index}.quantity`] = 'Quantity must be greater than 0'
      }
    })
  }
  
  if (invoiceData.discount_amount && invoiceData.discount_amount < 0) {
    errors.discount_amount = 'Discount amount cannot be negative'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate payment data
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} Validation result
 */
export const validatePaymentData = (paymentData) => {
  const errors = {}
  
  if (!paymentData.invoice_id) {
    errors.invoice_id = 'Invoice is required'
  }
  
  if (!paymentData.payment_date) {
    errors.payment_date = 'Payment date is required'
  }
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  }
  
  if (!paymentData.payment_method) {
    errors.payment_method = 'Payment method is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Generate invoice number
 * @param {number} sequence - Sequence number
 * @param {string} prefix - Prefix for invoice number
 * @returns {string} Generated invoice number
 */
export const generateInvoiceNumber = (sequence, prefix = 'INV') => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const sequenceStr = String(sequence).padStart(4, '0')
  
  return `${prefix}-${year}${month}-${sequenceStr}`
}

/**
 * Calculate outstanding balance
 * @param {number} totalAmount - Total invoice amount
 * @param {Array} payments - Array of payments
 * @returns {number} Outstanding balance
 */
export const calculateOutstandingBalance = (totalAmount, payments) => {
  const totalPaid = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0)
  
  return Math.max(0, totalAmount - totalPaid)
}

/**
 * Check if invoice is overdue
 * @param {string|Date} dueDate - Invoice due date
 * @param {string} status - Invoice status
 * @returns {boolean} True if invoice is overdue
 */
export const isInvoiceOverdue = (dueDate, status) => {
  if (status === 'paid' || status === 'cancelled') return false
  
  const due = new Date(dueDate)
  const now = new Date()
  
  return due < now
}

/**
 * Get days overdue
 * @param {string|Date} dueDate - Invoice due date
 * @returns {number} Days overdue (negative if not overdue)
 */
export const getDaysOverdue = (dueDate) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = now - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
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
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
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
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export const generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleaned = phone.replace(/\D/g, '')
  return phoneRegex.test(cleaned)
}

/**
 * Generate unique invoice number (alternative method)
 * @returns {string} Unique invoice number
 */
export const generateInvoiceNumberAlt = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `INV-${timestamp}-${random}`.toUpperCase()
}

/**
 * Generate unique claim number
 * @returns {string} Unique claim number
 */
export const generateClaimNumber = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `CLM-${timestamp}-${random}`.toUpperCase()
}

/**
 * Calculate invoice totals
 * @param {Array} items - Invoice items
 * @param {number} taxRate - Tax rate percentage
 * @param {number} discountAmount - Discount amount
 * @returns {Object} Totals breakdown
 */
export const calculateInvoiceTotalsEnhanced = (items, taxRate = 0, discountAmount = 0) => {
  // Ensure items is an array and contains valid objects
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array')
  }

  // Calculate subtotal, ensuring quantity and unit_price are numbers
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unit_price) || 0
    return sum + (quantity * unitPrice)
  }, 0)

  // Discount cannot exceed subtotal
  const validDiscount = Math.max(0, Math.min(Number(discountAmount) || 0, subtotal))

  // Taxable amount cannot be negative
  const taxableAmount = Math.max(0, subtotal - validDiscount)

  // Tax rate should be a non-negative number
  const validTaxRate = Math.max(0, Number(taxRate) || 0)

  // Calculate tax amount
  const taxAmount = (taxableAmount * validTaxRate) / 100

  // Total amount is taxable amount plus tax
  const totalAmount = taxableAmount + taxAmount

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount
  }
}

/**
 * Validate invoice form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors
 */
export const validateInvoiceForm = (formData) => {
  const errors = {}
  
  if (!formData.patient_id) {
    errors.patient_id = 'Please select a patient'
  }
  
  if (!formData.invoice_date) {
    errors.invoice_date = 'Invoice date is required'
  }
  
  if (!formData.due_date) {
    errors.due_date = 'Due date is required'
  }
  
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one service item is required'
  }
  
  if (formData.items) {
    formData.items.forEach((item, index) => {
      if (!item.service_id) {
        errors[`items.${index}.service_id`] = 'Please select a service'
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${index}.quantity`] = 'Quantity must be greater than 0'
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors[`items.${index}.unit_price`] = 'Unit price must be greater than 0'
      }
    })
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate payment form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors
 */
export const validatePaymentForm = (formData) => {
  const errors = {}
  
  if (!formData.invoice_id) {
    errors.invoice_id = 'Please select an invoice'
  }
  
  if (!formData.payment_date) {
    errors.payment_date = 'Payment date is required'
  }
  
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Payment amount must be greater than 0'
  }
  
  if (!formData.payment_method) {
    errors.payment_method = 'Please select a payment method'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Get invoice status based on dates and payments
 * @param {Object} invoice - Invoice object
 * @returns {string} Invoice status
 */
export const getInvoiceStatus = (invoice) => {
  if (invoice.status === 'cancelled') return 'cancelled'
  
  const today = new Date()
  const dueDate = new Date(invoice.due_date)
  const totalPaid = invoice.payments ? invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0
  
  if (totalPaid >= invoice.total_amount) {
    return 'paid'
  } else if (today > dueDate) {
    return 'overdue'
  } else if (invoice.status === 'sent') {
    return 'sent'
  } else {
    return 'draft'
  }
}

/**
 * Calculate outstanding balance
 * @param {Object} invoice - Invoice object
 * @returns {number} Outstanding balance
 */
export const calculateOutstandingBalanceEnhanced = (invoice) => {
  const totalPaid = invoice.payments ? invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0
  return Math.max(0, invoice.total_amount - totalPaid)
}

/**
 * Format invoice status for display
 * @param {string} status - Invoice status
 * @returns {string} Formatted status
 */
export const formatInvoiceStatus = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'sent': 'Sent',
    'paid': 'Paid',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

/**
 * Get invoice status color class
 * @param {string} status - Invoice status
 * @returns {string} CSS class for status
 */
export const getInvoiceStatusClass = (status) => {
  const classes = {
    'draft': 'status-draft',
    'sent': 'status-sent',
    'paid': 'status-paid',
    'overdue': 'status-overdue',
    'cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-draft'
}