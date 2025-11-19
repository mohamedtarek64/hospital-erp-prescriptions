/**
 * Dashboard Helper Functions
 * Provides utility functions for dashboard data processing and formatting
 */

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A'
  
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with commas
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return 'N/A'
  
  return new Intl.NumberFormat('en-US').format(number)
}

/**
 * Get trend indicator
 */
export const getTrendIndicator = (currentValue, previousValue) => {
  if (currentValue === previousValue) return 'neutral'
  return currentValue > previousValue ? 'up' : 'down'
}

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (currentValue, previousValue) => {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0
  
  return ((currentValue - previousValue) / previousValue) * 100
}

/**
 * Get color based on value
 */
export const getValueColor = (value, threshold = 0) => {
  if (value > threshold) return 'green'
  if (value < threshold) return 'red'
  return 'gray'
}

/**
 * Format date
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time
 */
export const formatTime = (time) => {
  if (!time) return 'N/A'
  
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format time ago (Arabic)
 */
export const formatTimeAgo = (date) => {
  if (!date) return 'غير محدد'
  
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
  
  if (diffInSeconds < 60) return 'منذ لحظات'
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`
  if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`
  
  return new Date(date).toLocaleDateString('ar-SA')
}

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'inactive': 'red',
    'pending': 'yellow',
    'completed': 'blue',
    'cancelled': 'red'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colorMap = {
    'high': 'red',
    'medium': 'yellow',
    'low': 'green'
  }
  
  return colorMap[priority] || 'gray'
}

/**
 * Format duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get chart color
 */
export const getChartColor = (index) => {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16'  // lime
  ]
  
  return colors[index % colors.length]
}

/**
 * Calculate average
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0
  
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

/**
 * Calculate total
 */
export const calculateTotal = (values) => {
  if (!values || values.length === 0) return 0
  
  return values.reduce((acc, val) => acc + val, 0)
}

/**
 * Get top items
 */
export const getTopItems = (items, count = 5) => {
  if (!items || items.length === 0) return []
  
  return items
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
}

/**
 * Filter by date range
 */
export const filterByDateRange = (items, startDate, endDate) => {
  if (!items || items.length === 0) return []
  
  return items.filter(item => {
    const itemDate = new Date(item.date || item.created_at)
    return itemDate >= startDate && itemDate <= endDate
  })
}

/**
 * Group by date
 */
export const groupByDate = (items) => {
  if (!items || items.length === 0) return {}
  
  return items.reduce((acc, item) => {
    const date = new Date(item.date || item.created_at).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {})
}

/**
 * Get chart data
 */
export const getChartData = (items, groupBy = 'date') => {
  if (!items || items.length === 0) return []
  
  if (groupBy === 'date') {
    const grouped = groupByDate(items)
    return Object.keys(grouped).map(date => ({
      label: date,
      value: grouped[date].length
    }))
  }
  
  return items.map(item => ({
    label: item.label || item.name,
    value: item.value || item.count
  }))
}

export default {
  formatCurrency,
  formatPercentage,
  formatNumber,
  getTrendIndicator,
  calculatePercentageChange,
  getValueColor,
  formatDate,
  formatTime,
  formatTimeAgo,
  getStatusColor,
  getPriorityColor,
  formatDuration,
  getChartColor,
  calculateAverage,
  calculateTotal,
  getTopItems,
  filterByDateRange,
  groupByDate,
  getChartData
}
