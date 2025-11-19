<template>
  <div class="billing-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-controls">
        <select v-model="selectedPeriod" @change="updateChart" class="period-select">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
        <button @click="refreshChart" class="refresh-btn">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <div class="chart-container">
      <div v-if="loading" class="chart-loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading chart data...
      </div>
      
      <div v-else-if="chartData && chartData.length > 0" class="chart-content">
        <!-- Chart will be rendered here by Chart.js -->
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <div v-else class="chart-empty">
        <i class="fas fa-chart-line"></i>
        <p>No data available for the selected period</p>
      </div>
    </div>

    <!-- Chart Legend -->
    <div v-if="chartData && chartData.length > 0" class="chart-legend">
      <div class="legend-items">
        <div v-for="item in legendItems" :key="item.label" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ formatCurrency(item.value) }}</span>
        </div>
      </div>
    </div>

    <!-- Chart Summary -->
    <div v-if="chartSummary" class="chart-summary">
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Total Revenue:</span>
          <span class="summary-value">{{ formatCurrency(chartSummary.totalRevenue) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Average Daily:</span>
          <span class="summary-value">{{ formatCurrency(chartSummary.averageDaily) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Growth Rate:</span>
          <span class="summary-value" :class="getGrowthClass(chartSummary.growthRate)">
            {{ chartSummary.growthRate > 0 ? '+' : '' }}{{ chartSummary.growthRate.toFixed(1) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useBillingStore } from '@/stores/billing'
import { formatCurrency } from '@/utils/billingHelpers'

export default {
  name: 'BillingChart',
  props: {
    title: {
      type: String,
      default: 'Revenue Chart'
    },
    chartType: {
      type: String,
      default: 'line', // line, bar, pie
      validator: (value) => ['line', 'bar', 'pie'].includes(value)
    },
    dataType: {
      type: String,
      default: 'revenue', // revenue, payments, invoices
      validator: (value) => ['revenue', 'payments', 'invoices'].includes(value)
    }
  },
  setup(props) {
    const billingStore = useBillingStore()
    
    const chartCanvas = ref(null)
    const chartInstance = ref(null)
    const loading = ref(false)
    const selectedPeriod = ref(30)
    const chartData = ref([])
    const chartSummary = ref(null)

    const legendItems = computed(() => {
      if (!chartData.value || chartData.value.length === 0) return []
      
      if (props.chartType === 'pie') {
        return chartData.value.map((item, index) => ({
          label: item.label,
          value: item.value,
          color: getColor(index)
        }))
      } else {
        return [{
          label: props.dataType === 'revenue' ? 'Revenue' : 
                 props.dataType === 'payments' ? 'Payments' : 'Invoices',
          value: chartData.value.reduce((sum, item) => sum + item.value, 0),
          color: getColor(0)
        }]
      }
    })

    const loadChartData = async () => {
      loading.value = true
      try {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - selectedPeriod.value)

        let data = []
        switch (props.dataType) {
          case 'revenue':
            data = await billingStore.fetchRevenueData(startDate, endDate)
            break
          case 'payments':
            data = await billingStore.fetchPaymentData(startDate, endDate)
            break
          case 'invoices':
            data = await billingStore.fetchInvoiceData(startDate, endDate)
            break
        }

        chartData.value = data
        calculateSummary()
        await nextTick()
        renderChart()
      } catch (error) {
        console.error('Error loading chart data:', error)
      } finally {
        loading.value = false
      }
    }

    const calculateSummary = () => {
      if (!chartData.value || chartData.value.length === 0) {
        chartSummary.value = null
        return
      }

      const totalRevenue = chartData.value.reduce((sum, item) => sum + item.value, 0)
      const averageDaily = totalRevenue / chartData.value.length
      
      // Calculate growth rate
      let growthRate = 0
      if (chartData.value.length >= 2) {
        const firstHalf = chartData.value.slice(0, Math.floor(chartData.value.length / 2))
        const secondHalf = chartData.value.slice(Math.floor(chartData.value.length / 2))
        
        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length
        
        growthRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0
      }

      chartSummary.value = {
        totalRevenue,
        averageDaily,
        growthRate
      }
    }

    const renderChart = () => {
      if (!chartCanvas.value || !chartData.value || chartData.value.length === 0) return

      // Destroy existing chart
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }

      // Import Chart.js dynamically
      import('chart.js/auto').then(({ Chart }) => {
        const ctx = chartCanvas.value.getContext('2d')
        
        const config = getChartConfig()
        chartInstance.value = new Chart(ctx, config)
      }).catch(error => {
        console.error('Error loading Chart.js:', error)
      })
    }

    const getChartConfig = () => {
      const baseConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We have custom legend
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`
              }
            }
          }
        }
      }

      switch (props.chartType) {
        case 'line':
          return {
            ...baseConfig,
            type: 'line',
            data: {
              labels: chartData.value.map(item => item.label),
              datasets: [{
                label: props.dataType,
                data: chartData.value.map(item => item.value),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              ...baseConfig,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }
          }

        case 'bar':
          return {
            ...baseConfig,
            type: 'bar',
            data: {
              labels: chartData.value.map(item => item.label),
              datasets: [{
                label: props.dataType,
                data: chartData.value.map(item => item.value),
                backgroundColor: chartData.value.map((_, index) => getColor(index)),
                borderColor: chartData.value.map((_, index) => getColor(index)),
                borderWidth: 1
              }]
            },
            options: {
              ...baseConfig,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }
          }

        case 'pie':
          return {
            ...baseConfig,
            type: 'pie',
            data: {
              labels: chartData.value.map(item => item.label),
              datasets: [{
                data: chartData.value.map(item => item.value),
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

    const getColor = (index) => {
      const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ]
      return colors[index % colors.length]
    }

    const getGrowthClass = (growthRate) => {
      return growthRate > 0 ? 'growth-positive' : growthRate < 0 ? 'growth-negative' : 'growth-neutral'
    }

    const updateChart = () => {
      loadChartData()
    }

    const refreshChart = () => {
      loadChartData()
    }

    onMounted(() => {
      loadChartData()
    })

    onUnmounted(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
    })

    return {
      chartCanvas,
      loading,
      selectedPeriod,
      chartData,
      chartSummary,
      legendItems,
      updateChart,
      refreshChart,
      getGrowthClass,
      formatCurrency
    }
  }
}
</script>

<style scoped>
/* Styles are imported from billing.css */
</style>
