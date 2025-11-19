<template>
  <div class="usage-chart-container">
    <!-- Chart Header -->
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="chart-controls">
        <select v-model="selectedPeriod" @change="updateChart">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
        <button @click="exportChart" class="btn-outline btn-sm">
          <i class="fas fa-download"></i>
          Export
        </button>
      </div>
    </div>

    <!-- Chart Type Selector -->
    <div class="chart-type-selector">
      <button 
        v-for="type in chartTypes" 
        :key="type.value"
        @click="changeChartType(type.value)"
        :class="['chart-type-btn', { active: chartType === type.value }]"
      >
        <i :class="type.icon"></i>
        {{ type.label }}
      </button>
    </div>

    <!-- Chart Container -->
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Chart Legend -->
    <div v-if="showLegend" class="chart-legend">
      <div v-for="item in legendItems" :key="item.label" class="legend-item">
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}</span>
      </div>
    </div>

    <!-- Chart Statistics -->
    <div v-if="showStats" class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Usage:</span>
        <span class="stat-value">{{ totalUsage }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Average Daily:</span>
        <span class="stat-value">{{ averageDaily }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak Usage:</span>
        <span class="stat-value">{{ peakUsage }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Utilization Rate:</span>
        <span class="stat-value">{{ utilizationRate }}%</span>
      </div>
    </div>

    <!-- Data Table (Optional) -->
    <div v-if="showDataTable" class="data-table">
      <h4>Detailed Data</h4>
      <table class="usage-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Usage Hours</th>
            <th>Sessions</th>
            <th>Efficiency</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dataPoint in chartData" :key="dataPoint.date">
            <td>{{ formatDate(dataPoint.date) }}</td>
            <td>{{ dataPoint.usage_hours }}</td>
            <td>{{ dataPoint.sessions }}</td>
            <td>{{ dataPoint.efficiency }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  name: 'UsageChart',
  props: {
    title: {
      type: String,
      default: 'Equipment Usage Chart'
    },
    data: {
      type: Array,
      default: () => []
    },
    chartType: {
      type: String,
      default: 'line'
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    },
    showDataTable: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 400
    }
  },
  emits: ['chart-updated', 'data-exported'],
  setup(props, { emit }) {
    const chartCanvas = ref(null)
    const selectedPeriod = ref('30')
    const currentChartType = ref(props.chartType)
    let chartInstance = null

    const chartTypes = [
      { value: 'line', label: 'Line Chart', icon: 'fas fa-chart-line' },
      { value: 'bar', label: 'Bar Chart', icon: 'fas fa-chart-bar' },
      { value: 'area', label: 'Area Chart', icon: 'fas fa-chart-area' },
      { value: 'pie', label: 'Pie Chart', icon: 'fas fa-chart-pie' }
    ]

    const chartData = computed(() => {
      // Process data based on selected period
      const days = parseInt(selectedPeriod.value)
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
      
      return props.data.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate && itemDate <= endDate
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    const legendItems = computed(() => {
      if (currentChartType.value === 'pie') {
        return chartData.value.map((item, index) => ({
          label: item.label || `Item ${index + 1}`,
          value: item.value,
          color: getColor(index)
        }))
      }
      return []
    })

    const totalUsage = computed(() => {
      return chartData.value.reduce((sum, item) => sum + (item.usage_hours || 0), 0)
    })

    const averageDaily = computed(() => {
      const days = chartData.value.length
      return days > 0 ? (totalUsage.value / days).toFixed(1) : 0
    })

    const peakUsage = computed(() => {
      return Math.max(...chartData.value.map(item => item.usage_hours || 0), 0)
    })

    const utilizationRate = computed(() => {
      const totalPossibleHours = chartData.value.length * 24 // Assuming 24/7 availability
      return totalPossibleHours > 0 ? ((totalUsage.value / totalPossibleHours) * 100).toFixed(1) : 0
    })

    const getColor = (index) => {
      const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ]
      return colors[index % colors.length]
    }

    const changeChartType = (type) => {
      currentChartType.value = type
      updateChart()
    }

    const updateChart = async () => {
      await nextTick()
      if (chartInstance) {
        chartInstance.destroy()
      }
      createChart()
      emit('chart-updated', {
        type: currentChartType.value,
        period: selectedPeriod.value,
        data: chartData.value
      })
    }

    const createChart = () => {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      const config = getChartConfig()
      
      // Import Chart.js dynamically
      import('chart.js').then(({ Chart, registerables }) => {
        Chart.register(...registerables)
        chartInstance = new Chart(ctx, config)
      })
    }

    const getChartConfig = () => {
      const baseConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: props.showLegend && currentChartType.value !== 'pie'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: currentChartType.value !== 'pie' ? {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Usage Hours'
            }
          }
        } : {}
      }

      switch (currentChartType.value) {
        case 'line':
          return {
            ...baseConfig,
            type: 'line',
            data: {
              labels: chartData.value.map(item => formatDate(item.date)),
              datasets: [{
                label: 'Usage Hours',
                data: chartData.value.map(item => item.usage_hours || 0),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: false
              }]
            }
          }

        case 'bar':
          return {
            ...baseConfig,
            type: 'bar',
            data: {
              labels: chartData.value.map(item => formatDate(item.date)),
              datasets: [{
                label: 'Usage Hours',
                data: chartData.value.map(item => item.usage_hours || 0),
                backgroundColor: '#3B82F6',
                borderColor: '#1D4ED8',
                borderWidth: 1
              }]
            }
          }

        case 'area':
          return {
            ...baseConfig,
            type: 'line',
            data: {
              labels: chartData.value.map(item => formatDate(item.date)),
              datasets: [{
                label: 'Usage Hours',
                data: chartData.value.map(item => item.usage_hours || 0),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                tension: 0.4,
                fill: true
              }]
            }
          }

        case 'pie':
          return {
            ...baseConfig,
            type: 'pie',
            data: {
              labels: chartData.value.map(item => item.label || formatDate(item.date)),
              datasets: [{
                data: chartData.value.map(item => item.usage_hours || 0),
                backgroundColor: chartData.value.map((_, index) => getColor(index)),
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            }
          }

        default:
          return baseConfig
      }
    }

    const exportChart = () => {
      if (chartInstance) {
        const url = chartInstance.toBase64Image()
        const link = document.createElement('a')
        link.download = `usage-chart-${new Date().toISOString().split('T')[0]}.png`
        link.href = url
        link.click()
      }
      
      // Export data as CSV
      const csvData = chartData.value.map(item => ({
        date: formatDate(item.date),
        usage_hours: item.usage_hours || 0,
        sessions: item.sessions || 0,
        efficiency: item.efficiency || 0
      }))
      
      emit('data-exported', csvData)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    // Watch for data changes
    watch(() => props.data, () => {
      updateChart()
    }, { deep: true })

    onMounted(() => {
      createChart()
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return {
      chartCanvas,
      selectedPeriod,
      currentChartType,
      chartTypes,
      chartData,
      legendItems,
      totalUsage,
      averageDaily,
      peakUsage,
      utilizationRate,
      changeChartType,
      updateChart,
      exportChart,
      formatDate
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/usage-chart.css';
</style>
