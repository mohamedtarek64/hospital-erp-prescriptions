// Laboratory utility functions and helpers

export const laboratoryHelpers = {
  // Status colors and styling
  getStatusColor(status) {
    const statusColors = {
      // Order statuses
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      collected: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      
      // Result statuses
      normal: 'bg-green-100 text-green-800 border-green-200',
      abnormal: 'bg-red-100 text-red-800 border-red-200',
      critical: 'bg-red-200 text-red-900 border-red-300',
      pending_verification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      verified: 'bg-green-100 text-green-800 border-green-200',
      
      // Specimen statuses
      not_collected: 'bg-gray-100 text-gray-800 border-gray-200',
      received: 'bg-green-100 text-green-800 border-green-200',
      disposed: 'bg-gray-100 text-gray-800 border-gray-200',
      
      // Priority levels
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  },

  // Date formatting
  formatDate(date, format = 'short') {
    if (!date) return ''
    
    const dateObj = new Date(date)
    
    if (isNaN(dateObj.getTime())) return ''
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString()
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'datetime':
        return dateObj.toLocaleString()
      case 'time':
        return dateObj.toLocaleTimeString()
      case 'relative':
        return this.getRelativeTime(dateObj)
      default:
        return dateObj.toLocaleDateString()
    }
  },

  // Relative time formatting
  getRelativeTime(date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return this.formatDate(date, 'short')
    }
  },

  // Currency formatting
  formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return '$0.00'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  // Number formatting
  formatNumber(number, decimals = 2) {
    if (number === null || number === undefined) return '0'
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  },

  // Generate order number
  generateOrderNumber() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getTime()).slice(-6)
    
    return `LAB-${year}${month}${day}-${time}`
  },

  // Generate specimen ID
  generateSpecimenId() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getTime()).slice(-6)
    
    return `SP-${year}${month}${day}-${time}`
  },

  // Validation functions
  validateOrderData(data) {
    const errors = []
    
    if (!data.patient_id) {
      errors.push('Patient is required')
    }
    
    if (!data.doctor_id) {
      errors.push('Doctor is required')
    }
    
    if (!data.order_date) {
      errors.push('Order date is required')
    }
    
    if (!data.items || data.items.length === 0) {
      errors.push('At least one test item is required')
    }
    
    if (data.items) {
      data.items.forEach((item, index) => {
        if (!item.lab_test_id) {
          errors.push(`Test is required for item ${index + 1}`)
        }
        if (!item.price || item.price <= 0) {
          errors.push(`Valid price is required for item ${index + 1}`)
        }
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  validateResultData(data) {
    const errors = []
    
    if (!data.lab_order_item_id) {
      errors.push('Lab order item is required')
    }
    
    if (!data.test_name) {
      errors.push('Test name is required')
    }
    
    if (data.result_value === null || data.result_value === undefined || data.result_value === '') {
      errors.push('Result value is required')
    }
    
    if (!data.unit) {
      errors.push('Unit is required')
    }
    
    if (!data.normal_range) {
      errors.push('Normal range is required')
    }
    
    if (!data.result_status) {
      errors.push('Result status is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  validateSpecimenData(data) {
    const errors = []
    
    if (!data.lab_order_id) {
      errors.push('Lab order is required')
    }
    
    if (!data.specimen_type) {
      errors.push('Specimen type is required')
    }
    
    if (!data.collection_status) {
      errors.push('Collection status is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Data transformation
  transformOrderForAPI(orderData) {
    return {
      patient_id: orderData.patient_id,
      doctor_id: orderData.doctor_id,
      order_date: orderData.order_date,
      collection_date: orderData.collection_date,
      due_date: orderData.due_date,
      priority: orderData.priority || 'normal',
      status: orderData.status || 'pending',
      clinical_notes: orderData.clinical_notes,
      collection_notes: orderData.collection_notes,
      items: orderData.items.map(item => ({
        lab_test_id: item.lab_test_id,
        price: item.price,
        notes: item.notes
      }))
    }
  },

  transformResultForAPI(resultData) {
    return {
      lab_order_item_id: resultData.lab_order_item_id,
      test_name: resultData.test_name,
      result_value: resultData.result_value,
      unit: resultData.unit,
      normal_range: resultData.normal_range,
      result_status: resultData.result_status,
      interpretation: resultData.interpretation,
      comments: resultData.comments,
      performed_by: resultData.performed_by,
      performed_at: resultData.performed_at
    }
  },

  transformSpecimenForAPI(specimenData) {
    return {
      lab_order_id: specimenData.lab_order_id,
      specimen_type: specimenData.specimen_type,
      collection_status: specimenData.collection_status,
      collection_time: specimenData.collection_time,
      collected_by: specimenData.collected_by,
      collection_notes: specimenData.collection_notes,
      storage_conditions: specimenData.storage_conditions,
      expiry_date: specimenData.expiry_date
    }
  },

  // Chart data preparation
  prepareStatusChartData(orders) {
    const statusCounts = {
      pending: 0,
      collected: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    }
    
    orders.forEach(order => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, order.status)) {
        statusCounts[order.status]++
      }
    })
    
    return {
      labels: Object.keys(statusCounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#FCD34D', // yellow for pending
          '#3B82F6', // blue for collected
          '#F97316', // orange for processing
          '#10B981', // green for completed
          '#EF4444'  // red for cancelled
        ]
      }]
    }
  },

  prepareTrendChartData(orders, days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    const labels = []
    const data = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.order_date)
        return orderDate.toDateString() === date.toDateString()
      })
      
      data.push(dayOrders.length)
    }
    
    return {
      labels,
      datasets: [{
        label: 'Orders',
        data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    }
  },

  // Search and filter helpers
  searchOrders(orders, query) {
    if (!query) return orders
    
    const lowercaseQuery = query.toLowerCase()
    
    return orders.filter(order => 
      order.order_number?.toLowerCase().includes(lowercaseQuery) ||
      order.patient_name?.toLowerCase().includes(lowercaseQuery) ||
      order.doctor_name?.toLowerCase().includes(lowercaseQuery) ||
      order.status?.toLowerCase().includes(lowercaseQuery)
    )
  },

  searchTests(tests, query) {
    if (!query) return tests
    
    const lowercaseQuery = query.toLowerCase()
    
    return tests.filter(test => 
      test.name?.toLowerCase().includes(lowercaseQuery) ||
      test.code?.toLowerCase().includes(lowercaseQuery) ||
      test.description?.toLowerCase().includes(lowercaseQuery) ||
      test.category?.name?.toLowerCase().includes(lowercaseQuery)
    )
  },

  searchResults(results, query) {
    if (!query) return results
    
    const lowercaseQuery = query.toLowerCase()
    
    return results.filter(result => 
      result.test_name?.toLowerCase().includes(lowercaseQuery) ||
      result.patient_name?.toLowerCase().includes(lowercaseQuery) ||
      result.result_status?.toLowerCase().includes(lowercaseQuery) ||
      result.interpretation?.toLowerCase().includes(lowercaseQuery)
    )
  },

  // Export helpers
  exportToCSV(data, filename) {
    if (!data || data.length === 0) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  },

  // File helpers
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  },

  // Notification helpers
  showSuccess(message) {
    // This would integrate with your notification system
    console.log('Success:', message)
  },

  showError(message) {
    // This would integrate with your notification system
    console.error('Error:', message)
  },

  showWarning(message) {
    // This would integrate with your notification system
    console.warn('Warning:', message)
  },

  showInfo(message) {
    // This would integrate with your notification system
    console.info('Info:', message)
  }
}
