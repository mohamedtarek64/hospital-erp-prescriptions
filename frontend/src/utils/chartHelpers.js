// Chart Helper Functions
import { format, parseISO, subDays, subMonths } from 'date-fns'

/**
 * Generate chart configuration for different chart types
 */
export const generateChartConfig = (type, data, options = {}) => {
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: options.legendPosition || 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  switch (type) {
    case 'line':
      return generateLineChartConfig(data, { ...baseConfig, ...options })
    case 'bar':
      return generateBarChartConfig(data, { ...baseConfig, ...options })
    case 'pie':
      return generatePieChartConfig(data, { ...baseConfig, ...options })
    case 'doughnut':
      return generateDoughnutChartConfig(data, { ...baseConfig, ...options })
    case 'area':
      return generateAreaChartConfig(data, { ...baseConfig, ...options })
    case 'scatter':
      return generateScatterChartConfig(data, { ...baseConfig, ...options })
    default:
      return baseConfig
  }
}

/**
 * Generate line chart configuration
 */
export const generateLineChartConfig = (data, config) => {
  return {
    ...config,
    type: 'line',
    data: {
      labels: data.labels || [],
      datasets: data.datasets?.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.color || getDefaultColor(index),
        backgroundColor: dataset.backgroundColor || `${dataset.color || getDefaultColor(index)}20`,
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill || false,
        tension: dataset.tension || 0.4,
        pointBackgroundColor: dataset.color || getDefaultColor(index),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: dataset.pointRadius || 4,
        pointHoverRadius: 6
      })) || []
    },
    options: {
      ...config,
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  }
}

/**
 * Generate bar chart configuration
 */
export const generateBarChartConfig = (data, config) => {
  return {
    ...config,
    type: 'bar',
    data: {
      labels: data.labels || [],
      datasets: data.datasets?.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || getDefaultColor(index),
        borderColor: dataset.borderColor || getDefaultColor(index),
        borderWidth: dataset.borderWidth || 1,
        borderRadius: dataset.borderRadius || 4,
        borderSkipped: false
      })) || []
    }
  }
}

/**
 * Generate pie chart configuration
 */
export const generatePieChartConfig = (data, config) => {
  return {
    ...config,
    type: 'pie',
    data: {
      labels: data.labels || [],
      datasets: [{
        data: data.values || [],
        backgroundColor: data.colors || getDefaultColors(data.values?.length || 0),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      ...config,
      cutout: 0
    }
  }
}

/**
 * Generate doughnut chart configuration
 */
export const generateDoughnutChartConfig = (data, config) => {
  return {
    ...config,
    type: 'doughnut',
    data: {
      labels: data.labels || [],
      datasets: [{
        data: data.values || [],
        backgroundColor: data.colors || getDefaultColors(data.values?.length || 0),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      ...config,
      cutout: '60%'
    }
  }
}

/**
 * Generate area chart configuration
 */
export const generateAreaChartConfig = (data, config) => {
  return {
    ...config,
    type: 'line',
    data: {
      labels: data.labels || [],
      datasets: data.datasets?.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.color || getDefaultColor(index),
        backgroundColor: dataset.backgroundColor || `${dataset.color || getDefaultColor(index)}40`,
        borderWidth: dataset.borderWidth || 2,
        fill: true,
        tension: dataset.tension || 0.4
      })) || []
    }
  }
}

/**
 * Generate scatter chart configuration
 */
export const generateScatterChartConfig = (data, config) => {
  return {
    ...config,
    type: 'scatter',
    data: {
      datasets: data.datasets?.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.color || getDefaultColor(index),
        borderColor: dataset.color || getDefaultColor(index),
        pointRadius: dataset.pointRadius || 6,
        pointHoverRadius: 8
      })) || []
    }
  }
}

/**
 * Get default color for chart elements
 */
export const getDefaultColor = (index) => {
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ]
  return colors[index % colors.length]
}

/**
 * Get array of default colors
 */
export const getDefaultColors = (count) => {
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(getDefaultColor(i))
  }
  return colors
}

/**
 * Format data for time series charts
 */
export const formatTimeSeriesData = (data, dateField = 'date', valueField = 'value') => {
  return {
    labels: data.map(item => format(parseISO(item[dateField]), 'MMM dd')),
    datasets: [{
      label: 'Value',
      data: data.map(item => item[valueField]),
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F620',
      fill: true,
      tension: 0.4
    }]
  }
}

/**
 * Format data for category charts
 */
export const formatCategoryData = (data, labelField = 'label', valueField = 'value') => {
  return {
    labels: data.map(item => item[labelField]),
    datasets: [{
      label: 'Count',
      data: data.map(item => item[valueField]),
      backgroundColor: getDefaultColors(data.length),
      borderColor: '#fff',
      borderWidth: 2
    }]
  }
}

/**
 * Calculate chart statistics
 */
export const calculateChartStats = (data) => {
  if (!data || data.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      growth: 0
    }
  }

  const values = data.map(item => typeof item === 'object' ? item.value : item)
  const total = values.reduce((sum, val) => sum + val, 0)
  const average = total / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  // Calculate growth (comparing first half to second half)
  const midPoint = Math.floor(values.length / 2)
  const firstHalf = values.slice(0, midPoint)
  const secondHalf = values.slice(midPoint)
  
  const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  const growth = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

  return {
    total,
    average: Math.round(average * 100) / 100,
    min,
    max,
    growth: Math.round(growth * 100) / 100
  }
}

/**
 * Generate date range labels
 */
export const generateDateRangeLabels = (period, count = 7) => {
  const labels = []
  const now = new Date()
  
  switch (period) {
    case '7d':
      for (let i = count - 1; i >= 0; i--) {
        const date = subDays(now, i)
        labels.push(format(date, 'MMM dd'))
      }
      break
    case '30d':
      for (let i = count - 1; i >= 0; i--) {
        const date = subDays(now, i * 4)
        labels.push(format(date, 'MMM dd'))
      }
      break
    case '90d':
      for (let i = count - 1; i >= 0; i--) {
        const date = subDays(now, i * 12)
        labels.push(format(date, 'MMM dd'))
      }
      break
    case '1y':
      for (let i = count - 1; i >= 0; i--) {
        const date = subMonths(now, i)
        labels.push(format(date, 'MMM yyyy'))
      }
      break
    default:
      for (let i = count - 1; i >= 0; i--) {
        const date = subDays(now, i)
        labels.push(format(date, 'MMM dd'))
      }
  }
  
  return labels
}

/**
 * Generate sample data for charts
 */
export const generateSampleData = (type, count = 7) => {
  const labels = generateDateRangeLabels('7d', count)
  
  switch (type) {
    case 'line':
    case 'area':
      return {
        labels,
        datasets: [{
          label: 'Sample Data',
          data: labels.map(() => Math.floor(Math.random() * 100) + 20),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F620',
          fill: type === 'area'
        }]
      }
    case 'bar':
      return {
        labels,
        datasets: [{
          label: 'Sample Data',
          data: labels.map(() => Math.floor(Math.random() * 100) + 20),
          backgroundColor: '#3B82F6'
        }]
      }
    case 'pie':
    case 'doughnut':
      return {
        labels: ['Category A', 'Category B', 'Category C', 'Category D'],
        values: [30, 25, 20, 25],
        colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
      }
    default:
      return { labels: [], datasets: [] }
  }
}

/**
 * Export chart as image
 */
export const exportChartAsImage = (chartInstance, filename = 'chart.png', format = 'png') => {
  if (!chartInstance) return
  
  const url = chartInstance.toBase64Image(format, 1.0)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

/**
 * Export chart data as CSV
 */
export const exportChartDataAsCSV = (chartData, filename = 'chart-data.csv') => {
  if (!chartData || !chartData.labels) return
  
  const headers = ['Label', ...chartData.datasets.map(dataset => dataset.label)]
  const rows = [headers.join(',')]
  
  chartData.labels.forEach((label, index) => {
    const row = [label, ...chartData.datasets.map(dataset => dataset.data[index] || '')]
    rows.push(row.join(','))
  })
  
  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  
  window.URL.revokeObjectURL(url)
}

/**
 * Validate chart data
 */
export const validateChartData = (data) => {
  const errors = []
  
  if (!data) {
    errors.push('Chart data is required')
    return errors
  }
  
  if (!data.labels || !Array.isArray(data.labels)) {
    errors.push('Labels array is required')
  }
  
  if (!data.datasets || !Array.isArray(data.datasets)) {
    errors.push('Datasets array is required')
  } else {
    data.datasets.forEach((dataset, index) => {
      if (!dataset.label) {
        errors.push(`Dataset ${index + 1} is missing a label`)
      }
      if (!dataset.data || !Array.isArray(dataset.data)) {
        errors.push(`Dataset ${index + 1} is missing data array`)
      }
    })
  }
  
  return errors
}

/**
 * Get chart type recommendations based on data
 */
export const getRecommendedChartType = (data) => {
  if (!data || !data.datasets) return 'bar'
  
  const dataset = data.datasets[0]
  if (!dataset || !dataset.data) return 'bar'
  
  const dataLength = dataset.data.length
  
  if (dataLength <= 5) {
    return 'pie'
  } else if (dataLength <= 10) {
    return 'doughnut'
  } else if (dataLength <= 20) {
    return 'bar'
  } else {
    return 'line'
  }
}

/**
 * Export all helper functions
 */
export default {
  generateChartConfig,
  generateLineChartConfig,
  generateBarChartConfig,
  generatePieChartConfig,
  generateDoughnutChartConfig,
  generateAreaChartConfig,
  generateScatterChartConfig,
  getDefaultColor,
  getDefaultColors,
  formatTimeSeriesData,
  formatCategoryData,
  calculateChartStats,
  generateDateRangeLabels,
  generateSampleData,
  exportChartAsImage,
  exportChartDataAsCSV,
  validateChartData,
  getRecommendedChartType
}
