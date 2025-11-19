import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { generateChartConfig, calculateChartStats } from '@/utils/chartHelpers'

export function useChartWidget(props, { emit }) {
  const chartCanvas = ref(null)
  const chartInstance = ref(null)
  const selectedPeriod = ref('30d')
  const selectedType = ref(props.type)

  const chartId = computed(() => `chart-${Math.random().toString(36).substr(2, 9)}`)

  const hasData = computed(() => {
    if (!props.data || !props.data.datasets) return false
    return props.data.datasets.some(dataset => dataset.data && dataset.data.length > 0)
  })

  const legendItems = computed(() => {
    if (!props.data || !props.data.datasets) return []
    
    return props.data.datasets.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      color: dataset.backgroundColor || dataset.borderColor || '#3B82F6',
      value: dataset.data ? dataset.data.reduce((sum, val) => sum + val, 0) : 0
    }))
  })

  const summaryData = computed(() => {
    if (!hasData.value) {
      return { total: 0, average: 0, growth: 0 }
    }
    
    const allValues = props.data.datasets.flatMap(dataset => dataset.data || [])
    return calculateChartStats(allValues)
  })

  const onPeriodChange = () => {
    emit('period-change', selectedPeriod.value)
  }

  const onTypeChange = () => {
    emit('type-change', selectedType.value)
    if (chartInstance.value) {
      updateChart()
    }
  }

  const refreshChart = () => {
    emit('refresh')
  }

  const updateChart = () => {
    if (!chartInstance.value || !hasData.value) return

    const config = generateChartConfig(selectedType.value, props.data, {
      responsive: true,
      maintainAspectRatio: false
    })

    chartInstance.value.data = config.data
    chartInstance.value.options = config.options
    chartInstance.value.update()
  }

  const initializeChart = async () => {
    if (!chartCanvas.value || !hasData.value) return

    await nextTick()

    const config = generateChartConfig(selectedType.value, props.data, {
      responsive: true,
      maintainAspectRatio: false
    })

    // Import Chart.js dynamically
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    chartInstance.value = new Chart(chartCanvas.value, config)
  }

  const destroyChart = () => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  }

  onMounted(() => {
    if (hasData.value) {
      initializeChart()
    }
  })

  onUnmounted(() => {
    destroyChart()
  })

  return {
    chartCanvas,
    chartId,
    hasData,
    legendItems,
    summaryData,
    selectedPeriod,
    selectedType,
    onPeriodChange,
    onTypeChange,
    refreshChart
  }
}
