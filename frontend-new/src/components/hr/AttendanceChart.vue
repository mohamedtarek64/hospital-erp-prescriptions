<template>
  <div class="attendance-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-controls">
        <select v-model="selectedPeriod" @change="updateChart" class="period-select">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        
        <div class="view-toggle">
          <button 
            @click="chartType = 'bar'" 
            :class="['toggle-btn', { active: chartType === 'bar' }]"
          >
            <i class="fas fa-chart-bar"></i>
          </button>
          <button 
            @click="chartType = 'line'" 
            :class="['toggle-btn', { active: chartType === 'line' }]"
          >
            <i class="fas fa-chart-line"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="chart-content">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading attendance data...</p>
      </div>

      <div v-else-if="!chartData || chartData.length === 0" class="empty-state">
        <i class="fas fa-chart-bar"></i>
        <p>No attendance data available</p>
      </div>

      <div v-else class="chart-wrapper">
        <!-- Chart Canvas -->
        <canvas ref="chartCanvas" class="chart-canvas"></canvas>
        
        <!-- Chart Legend -->
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color present"></div>
            <span>Present</span>
            <span class="legend-count">{{ totalPresent }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color absent"></div>
            <span>Absent</span>
            <span class="legend-count">{{ totalAbsent }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color late"></div>
            <span>Late</span>
            <span class="legend-count">{{ totalLate }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color half-day"></div>
            <span>Half Day</span>
            <span class="legend-count">{{ totalHalfDay }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ attendanceRate }}%</div>
          <div class="stat-label">Attendance Rate</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ averageHours }}</div>
          <div class="stat-label">Avg Hours/Day</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalAbsent }}</div>
          <div class="stat-label">Total Absent</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalLate }}</div>
          <div class="stat-label">Late Arrivals</div>
        </div>
      </div>
    </div>

    <!-- Detailed Breakdown -->
    <div v-if="showDetails" class="detailed-breakdown">
      <h4>Detailed Breakdown</h4>
      <div class="breakdown-table">
        <div class="table-header">
          <div class="header-cell">Date</div>
          <div class="header-cell">Check In</div>
          <div class="header-cell">Check Out</div>
          <div class="header-cell">Hours</div>
          <div class="header-cell">Status</div>
        </div>
        
        <div 
          v-for="record in detailedRecords" 
          :key="record.id" 
          class="table-row"
        >
          <div class="table-cell">{{ formatDate(record.date) }}</div>
          <div class="table-cell">{{ record.check_in || '--' }}</div>
          <div class="table-cell">{{ record.check_out || '--' }}</div>
          <div class="table-cell">{{ record.total_hours || '--' }}</div>
          <div class="table-cell">
            <span :class="`status-${record.status}`">{{ formatStatus(record.status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Details Button -->
    <div class="chart-footer">
      <button @click="showDetails = !showDetails" class="toggle-details-btn">
        <i :class="showDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        {{ showDetails ? 'Hide Details' : 'Show Details' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart } from 'chart.js'
import { formatDate, formatStatus } from '@/utils/hrHelpers'
import apiClient from '@/utils/apiClient'

export default {
  name: 'AttendanceChart',
  props: {
    title: {
      type: String,
      default: 'Attendance Overview'
    },
    employeeId: {
      type: [String, Number],
      default: null
    },
    departmentId: {
      type: [String, Number],
      default: null
    },
    attendanceData: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    const chartInstance = ref(null)
    const loading = ref(false)
    const selectedPeriod = ref('month')
    const chartType = ref('bar')
    const showDetails = ref(false)
    const chartData = ref([])
    const detailedRecords = ref([])
    const dateRange = ref({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    })

    // Computed properties
    const totalPresent = computed(() => 
      chartData.value.filter(item => item.status === 'present').length
    )

    const totalAbsent = computed(() => 
      chartData.value.filter(item => item.status === 'absent').length
    )

    const totalLate = computed(() => 
      chartData.value.filter(item => item.status === 'late').length
    )

    const totalHalfDay = computed(() => 
      chartData.value.filter(item => item.status === 'half_day').length
    )

    const attendanceRate = computed(() => {
      const total = chartData.value.length
      if (total === 0) return 0
      return Math.round((totalPresent.value / total) * 100)
    })

    const averageHours = computed(() => {
      const presentRecords = chartData.value.filter(item => item.status === 'present' && item.total_hours)
      if (presentRecords.length === 0) return '0.0'
      const totalHours = presentRecords.reduce((sum, record) => sum + parseFloat(record.total_hours), 0)
      return (totalHours / presentRecords.length).toFixed(1)
    })

    // Methods
    const loadAttendanceData = async () => {
      loading.value = true
      try {
        // Load actual data from API
        const response = await apiClient.get('/api/hr/attendance', {
          params: {
            employee_id: props.employeeId,
            period: selectedPeriod.value,
            start_date: dateRange.value.start,
            end_date: dateRange.value.end
          }
        })
        
        chartData.value = response.data.data || response.data
        detailedRecords.value = chartData.value
      } catch (error) {
        console.error('Error loading attendance data:', error)
        error.value = 'فشل في تحميل بيانات الحضور'
      } finally {
        loading.value = false
      }
    }

    // Mock data function removed - using real API data

    const updateChart = () => {
      loadAttendanceData()
    }

    const createChart = () => {
      if (!chartCanvas.value || !chartData.value.length) return

      const ctx = chartCanvas.value.getContext('2d')
      
      // Destroy existing chart
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }

      const labels = chartData.value.map(item => formatDate(item.date))
      const presentData = chartData.value.map(item => item.status === 'present' ? 1 : 0)
      const absentData = chartData.value.map(item => item.status === 'absent' ? 1 : 0)
      const lateData = chartData.value.map(item => item.status === 'late' ? 1 : 0)
      const halfDayData = chartData.value.map(item => item.status === 'half_day' ? 1 : 0)

      chartInstance.value = new Chart(ctx, {
        type: chartType.value,
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Present',
              data: presentData,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1
            },
            {
              label: 'Absent',
              data: absentData,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            },
            {
              label: 'Late',
              data: lateData,
              backgroundColor: 'rgba(245, 158, 11, 0.8)',
              borderColor: 'rgba(245, 158, 11, 1)',
              borderWidth: 1
            },
            {
              label: 'Half Day',
              data: halfDayData,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return value === 1 ? 'Yes' : 'No'
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || ''
                  const value = context.parsed.y
                  return value === 1 ? label : ''
                }
              }
            }
          }
        }
      })
    }

    // Watchers
    watch(chartData, () => {
      nextTick(() => {
        createChart()
      })
    })

    watch(chartType, () => {
      nextTick(() => {
        createChart()
      })
    })

    // Lifecycle
    onMounted(() => {
      loadAttendanceData()
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
      chartType,
      showDetails,
      chartData,
      detailedRecords,
      totalPresent,
      totalAbsent,
      totalLate,
      totalHalfDay,
      attendanceRate,
      averageHours,
      updateChart,
      formatDate,
      formatStatus
    }
  }
}
</script>

<style scoped>
.attendance-chart-container {
  @apply bg-white rounded-lg shadow-md border border-gray-200 p-6;
}

.chart-header {
  @apply flex justify-between items-center mb-6;
}

.chart-title {
  @apply text-lg font-semibold text-gray-800;
}

.chart-controls {
  @apply flex items-center space-x-4;
}

.period-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.view-toggle {
  @apply flex border border-gray-300 rounded-md overflow-hidden;
}

.toggle-btn {
  @apply px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200;
}

.toggle-btn.active {
  @apply bg-blue-100 text-blue-600;
}

.chart-content {
  @apply mb-6;
}

.loading-state, .empty-state {
  @apply flex flex-col items-center justify-center py-12 text-gray-500;
}

.loading-state i, .empty-state i {
  @apply text-2xl mb-2;
}

.chart-wrapper {
  @apply relative;
}

.chart-canvas {
  @apply w-full h-64;
}

.chart-legend {
  @apply flex justify-center space-x-6 mt-4;
}

.legend-item {
  @apply flex items-center space-x-2 text-sm;
}

.legend-color {
  @apply w-3 h-3 rounded-full;
}

.legend-color.present {
  @apply bg-green-500;
}

.legend-color.absent {
  @apply bg-red-500;
}

.legend-color.late {
  @apply bg-yellow-500;
}

.legend-color.half-day {
  @apply bg-blue-500;
}

.legend-count {
  @apply font-medium text-gray-800;
}

.summary-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-6;
}

.stat-card {
  @apply flex items-center space-x-3 p-4 bg-gray-50 rounded-lg;
}

.stat-icon {
  @apply w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-xl font-bold text-gray-800;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.detailed-breakdown {
  @apply mb-6;
}

.detailed-breakdown h4 {
  @apply text-lg font-medium text-gray-800 mb-4;
}

.breakdown-table {
  @apply bg-gray-50 rounded-lg overflow-hidden;
}

.table-header {
  @apply grid grid-cols-5 gap-4 p-4 bg-gray-100 font-medium text-gray-700;
}

.table-row {
  @apply grid grid-cols-5 gap-4 p-4 border-b border-gray-200 hover:bg-white transition-colors duration-200;
}

.table-cell {
  @apply text-sm text-gray-800;
}

.status-present {
  @apply px-2 py-1 text-xs rounded-full bg-green-100 text-green-800;
}

.status-absent {
  @apply px-2 py-1 text-xs rounded-full bg-red-100 text-red-800;
}

.status-late {
  @apply px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800;
}

.status-half_day {
  @apply px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800;
}

.chart-footer {
  @apply flex justify-center;
}

.toggle-details-btn {
  @apply px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-2;
}
</style>
