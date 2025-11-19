import { ref, computed, reactive, nextTick } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
// import { formatDate, formatPrice } from '@/utils/pharmacyHelpers'

export function useInventoryChartManager() {
  const inventoryStore = useInventoryStore()
  
  // Reactive State
  const chartType = ref('stock-levels')
  const timeRange = ref(30)
  const isLoading = ref(false)
  const error = ref(null)
  const chartInstance = ref(null)
  const stockLevelsCanvas = ref(null)
  const categoryBreakdownCanvas = ref(null)
  const supplierAnalysisCanvas = ref(null)
  const expiryTimelineCanvas = ref(null)
  const stockMovementsCanvas = ref(null)
  
  // Chart Data
  const chartData = reactive({
    stockLevels: null,
    categoryBreakdown: null,
    supplierAnalysis: null,
    expiryTimeline: null,
    stockMovements: null
  })
  
  // Statistics
  const statistics = reactive({
    totalValue: 0,
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0
  })
  
  // Computed Properties
  const chartTitle = computed(() => {
    const titles = {
      'stock-levels': 'مستويات المخزون',
      'category-breakdown': 'توزيع الفئات',
      'supplier-analysis': 'تحليل الموردين',
      'expiry-timeline': 'جدول انتهاء الصلاحية',
      'stock-movements': 'حركة المخزون'
    }
    return titles[chartType.value] || 'تحليل المخزون'
  })
  
  const timeRangeText = computed(() => {
    const ranges = {
      7: 'آخر 7 أيام',
      30: 'آخر 30 يوم',
      90: 'آخر 3 أشهر',
      365: 'آخر سنة'
    }
    return ranges[timeRange.value] || 'آخر 30 يوم'
  })
  
  // Methods
  const initializeChart = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      await updateStatistics()
      await generateChartData()
      await renderChart()
      
    } catch (err) {
      error.value = 'حدث خطأ أثناء تحميل البيانات'
      console.error('Error initializing chart:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const updateStatistics = async () => {
    try {
      const inventory = inventoryStore.inventory
      
      statistics.totalValue = inventory.reduce((total, item) => total + (item.currentStock * item.purchasePrice), 0)
      statistics.totalItems = inventory.length
      statistics.lowStock = inventory.filter(item => item.currentStock <= item.minStock).length
      statistics.expiringSoon = inventory.filter(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      }).length
      
    } catch (err) {
      console.error('Error updating statistics:', err)
    }
  }
  
  const generateChartData = async () => {
    try {
      const inventory = inventoryStore.inventory
      
      // Stock Levels Chart Data
      chartData.stockLevels = {
        labels: inventory.map(item => item.name),
        datasets: [{
          label: 'المخزون الحالي',
          data: inventory.map(item => item.currentStock),
          backgroundColor: inventory.map(item => getStockColor(item.currentStock, item.minStock)),
          borderColor: inventory.map(item => getStockBorderColor(item.currentStock, item.minStock)),
          borderWidth: 2
        }]
      }
      
      // Category Breakdown Chart Data
      const categoryData = getCategoryBreakdown(inventory)
      chartData.categoryBreakdown = {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.values,
          backgroundColor: generateColors(categoryData.labels.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      }
      
      // Supplier Analysis Chart Data
      const supplierData = getSupplierAnalysis(inventory)
      chartData.supplierAnalysis = {
        labels: supplierData.labels,
        datasets: [{
          label: 'قيمة المخزون',
          data: supplierData.values,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }]
      }
      
      // Expiry Timeline Chart Data
      const expiryData = getExpiryTimeline(inventory)
      chartData.expiryTimeline = {
        labels: expiryData.labels,
        datasets: [{
          label: 'العناصر',
          data: expiryData.values,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          fill: true
        }]
      }
      
      // Stock Movements Chart Data
      const movementsData = getStockMovements(inventory)
      chartData.stockMovements = {
        labels: movementsData.labels,
        datasets: [{
          label: 'الوارد',
          data: movementsData.incoming,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        }, {
          label: 'المنصرف',
          data: movementsData.outgoing,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2
        }]
      }
      
    } catch (err) {
      console.error('Error generating chart data:', err)
    }
  }
  
  const renderChart = async () => {
    try {
      // Destroy existing chart if it exists
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
      
      // Wait for next tick to ensure canvas is available
      await nextTick()
      
      const canvas = getCurrentCanvas()
      if (!canvas) {
        console.error('Canvas not found for chart type:', chartType.value)
        return
      }
      
      const ctx = canvas.getContext('2d')
      const config = getChartConfig()
      
      // Import Chart.js dynamically
      const { Chart } = await import('chart.js/auto')
      chartInstance.value = new Chart(ctx, config)
      
    } catch (err) {
      console.error('Error rendering chart:', err)
      error.value = 'حدث خطأ أثناء رسم الرسم البياني'
    }
  }
  
  const getCurrentCanvas = () => {
    const canvasMap = {
      'stock-levels': stockLevelsCanvas.value,
      'category-breakdown': categoryBreakdownCanvas.value,
      'supplier-analysis': supplierAnalysisCanvas.value,
      'expiry-timeline': expiryTimelineCanvas.value,
      'stock-movements': stockMovementsCanvas.value
    }
    return canvasMap[chartType.value]
  }
  
  const getChartConfig = () => {
    const baseConfig = {
      type: getChartType(),
      data: chartData[chartType.value],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            rtl: true,
            labels: {
              font: {
                family: 'Cairo, sans-serif'
              }
            }
          },
          title: {
            display: true,
            text: `${chartTitle.value} - ${timeRangeText.value}`,
            font: {
              family: 'Cairo, sans-serif',
              size: 16
            }
          }
        },
        scales: getChartScales()
      }
    }
    
    return baseConfig
  }
  
  const getChartType = () => {
    const typeMap = {
      'stock-levels': 'bar',
      'category-breakdown': 'doughnut',
      'supplier-analysis': 'bar',
      'expiry-timeline': 'line',
      'stock-movements': 'bar'
    }
    return typeMap[chartType.value] || 'bar'
  }
  
  const getChartScales = () => {
    if (chartType.value === 'category-breakdown') {
      return {}
    }
    
    return {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      }
    }
  }
  
  const refreshChart = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      await updateStatistics()
      await generateChartData()
      await renderChart()
      
    } catch (err) {
      error.value = 'حدث خطأ أثناء تحديث الرسم البياني'
      console.error('Error refreshing chart:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  const exportChart = (format = 'image') => {
    try {
      if (!chartInstance.value) {
        throw new Error('No chart available for export')
      }
      
      switch (format) {
        case 'image': {
          const link = document.createElement('a')
          link.download = chartTitle.value + '-' + new Date().toISOString().split('T')[0] + '.png'
          link.href = chartInstance.value.toBase64Image()
          link.click()
          break
        }
          
        case 'data': {
          const dataStr = JSON.stringify(chartData[chartType.value], null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const dataUrl = URL.createObjectURL(dataBlob)
          const dataLink = document.createElement('a')
          dataLink.download = chartTitle.value + '-data.json'
          dataLink.href = dataUrl
          dataLink.click()
          URL.revokeObjectURL(dataUrl)
          break
        }
          
        case 'print':
          window.print()
          break
          
        default:
          throw new Error('Export format not supported')
      }
      
    } catch (err) {
      console.error('Error exporting chart:', err)
      error.value = 'حدث خطأ أثناء التصدير'
    }
  }
  
  // Helper Methods
  const getStockColor = (currentStock, minStock) => {
    if (currentStock === 0) return 'rgba(239, 68, 68, 0.8)'
    if (currentStock <= minStock) return 'rgba(245, 158, 11, 0.8)'
    return 'rgba(34, 197, 94, 0.8)'
  }
  
  const getStockBorderColor = (currentStock, minStock) => {
    if (currentStock === 0) return 'rgb(239, 68, 68)'
    if (currentStock <= minStock) return 'rgb(245, 158, 11)'
    return 'rgb(34, 197, 94)'
  }
  
  const generateColors = (count) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ]
    
    const result = []
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length])
    }
    return result
  }
  
  const getCategoryBreakdown = (inventory) => {
    const categories = {}
    inventory.forEach(item => {
      const category = item.category || 'غير محدد'
      if (!categories[category]) {
        categories[category] = 0
      }
      categories[category] += item.currentStock * item.purchasePrice
    })
    
    return {
      labels: Object.keys(categories),
      values: Object.values(categories)
    }
  }
  
  const getSupplierAnalysis = (inventory) => {
    const suppliers = {}
    inventory.forEach(item => {
      const supplier = item.supplier || 'غير محدد'
      if (!suppliers[supplier]) {
        suppliers[supplier] = 0
      }
      suppliers[supplier] += item.currentStock * item.purchasePrice
    })
    
    return {
      labels: Object.keys(suppliers),
      values: Object.values(suppliers)
    }
  }
  
  const getExpiryTimeline = (inventory) => {
    const timeline = {
      'أقل من 7 أيام': 0,
      '7-15 يوم': 0,
      '15-30 يوم': 0,
      '30-60 يوم': 0,
      'أكثر من 60 يوم': 0
    }
    
    inventory.forEach(item => {
      const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)
      if (daysUntilExpiry <= 7) timeline['أقل من 7 أيام']++
      else if (daysUntilExpiry <= 15) timeline['7-15 يوم']++
      else if (daysUntilExpiry <= 30) timeline['15-30 يوم']++
      else if (daysUntilExpiry <= 60) timeline['30-60 يوم']++
      else timeline['أكثر من 60 يوم']++
    })
    
    return {
      labels: Object.keys(timeline),
      values: Object.values(timeline)
    }
  }
  
  const getStockMovements = () => {
    // Mock data for stock movements - replace with actual data
    const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    const incoming = [120, 150, 180, 200, 160, 190]
    const outgoing = [100, 130, 160, 180, 140, 170]
    
    return { labels, incoming, outgoing }
  }
  
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return Infinity
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  
  const cleanup = () => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  }
  
  // Watch for changes
  const handleChartTypeChange = async () => {
    await renderChart()
  }
  
  const handleTimeRangeChange = async () => {
    await refreshChart()
  }
  
  return {
    // State
    chartType,
    timeRange,
    isLoading,
    error,
    statistics,
    
    // Computed
    chartTitle,
    timeRangeText,
    
    // Methods
    initializeChart,
    refreshChart,
    exportChart,
    cleanup,
    handleChartTypeChange,
    handleTimeRangeChange,
    
    // Canvas refs
    stockLevelsCanvas,
    categoryBreakdownCanvas,
    supplierAnalysisCanvas,
    expiryTimelineCanvas,
    stockMovementsCanvas
  }
}
