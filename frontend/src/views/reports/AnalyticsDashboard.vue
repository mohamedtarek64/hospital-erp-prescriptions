<template>
  <div class="analytics-dashboard-container">
    <!-- Header -->
    <div class="analytics-dashboard-header">
      <div class="analytics-dashboard-title-section">
        <h1 class="analytics-dashboard-title">لوحة التحليلات</h1>
        <p class="analytics-dashboard-subtitle">تحليل شامل لبيانات المستشفى والأداء</p>
      </div>
      
      <div class="analytics-dashboard-actions">
        <div class="analytics-dashboard-date-range">
          <label class="analytics-dashboard-date-label">الفترة الزمنية:</label>
          <select 
            v-model="selectedDateRange" 
            @change="updateDateRange"
            class="analytics-dashboard-date-select"
          >
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="quarter">هذا الربع</option>
            <option value="year">هذا العام</option>
            <option value="custom">مخصص</option>
          </select>
        </div>
        
        <button 
          @click="refreshData" 
          class="analytics-dashboard-refresh-btn"
          :disabled="isLoading"
        >
          <svg 
            class="analytics-dashboard-refresh-icon" 
            :class="{ 'analytics-dashboard-spinning': isLoading }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث البيانات
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="analytics-dashboard-kpis">
      <div 
        v-for="kpi in kpiMetrics" 
        :key="kpi.id"
        class="analytics-dashboard-kpi-card"
        :class="kpi.trend > 0 ? 'analytics-dashboard-kpi-positive' : kpi.trend < 0 ? 'analytics-dashboard-kpi-negative' : ''"
      >
        <div class="analytics-dashboard-kpi-header">
          <div class="analytics-dashboard-kpi-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path :d="kpi.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
          <div class="analytics-dashboard-kpi-trend" v-if="kpi.trend !== 0">
            <svg 
              class="analytics-dashboard-trend-icon" 
              :class="kpi.trend > 0 ? 'analytics-dashboard-trend-up' : 'analytics-dashboard-trend-down'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17l9.2-9.2M17 17V7H7"></path>
            </svg>
            <span class="analytics-dashboard-trend-text">{{ Math.abs(kpi.trend) }}%</span>
          </div>
        </div>
        
        <div class="analytics-dashboard-kpi-content">
          <h3 class="analytics-dashboard-kpi-title">{{ kpi.title }}</h3>
          <p class="analytics-dashboard-kpi-value">{{ formatNumber(kpi.value) }}</p>
          <p class="analytics-dashboard-kpi-description">{{ kpi.description }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="analytics-dashboard-charts">
      <!-- Revenue Chart -->
      <div class="analytics-dashboard-chart-card">
        <div class="analytics-dashboard-chart-header">
          <h3 class="analytics-dashboard-chart-title">الإيرادات الشهرية</h3>
          <div class="analytics-dashboard-chart-actions">
            <button 
              @click="exportChart('revenue')"
              class="analytics-dashboard-chart-action"
              title="تصدير الرسم البياني"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="analytics-dashboard-chart-container">
          <canvas ref="revenueChart" class="analytics-dashboard-chart"></canvas>
        </div>
      </div>

      <!-- Patient Visits Chart -->
      <div class="analytics-dashboard-chart-card">
        <div class="analytics-dashboard-chart-header">
          <h3 class="analytics-dashboard-chart-title">زيارات المرضى</h3>
          <div class="analytics-dashboard-chart-actions">
            <button 
              @click="exportChart('patients')"
              class="analytics-dashboard-chart-action"
              title="تصدير الرسم البياني"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="analytics-dashboard-chart-container">
          <canvas ref="patientsChart" class="analytics-dashboard-chart"></canvas>
        </div>
      </div>

      <!-- Department Performance Chart -->
      <div class="analytics-dashboard-chart-card">
        <div class="analytics-dashboard-chart-header">
          <h3 class="analytics-dashboard-chart-title">أداء الأقسام</h3>
          <div class="analytics-dashboard-chart-actions">
            <button 
              @click="exportChart('departments')"
              class="analytics-dashboard-chart-action"
              title="تصدير الرسم البياني"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="analytics-dashboard-chart-container">
          <canvas ref="departmentsChart" class="analytics-dashboard-chart"></canvas>
        </div>
      </div>

      <!-- Appointment Trends Chart -->
      <div class="analytics-dashboard-chart-card">
        <div class="analytics-dashboard-chart-header">
          <h3 class="analytics-dashboard-chart-title">اتجاهات المواعيد</h3>
          <div class="analytics-dashboard-chart-actions">
            <button 
              @click="exportChart('appointments')"
              class="analytics-dashboard-chart-action"
              title="تصدير الرسم البياني"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="analytics-dashboard-chart-container">
          <canvas ref="appointmentsChart" class="analytics-dashboard-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Data Tables -->
    <div class="analytics-dashboard-tables">
      <!-- Top Departments -->
      <div class="analytics-dashboard-table-card">
        <div class="analytics-dashboard-table-header">
          <h3 class="analytics-dashboard-table-title">أفضل الأقسام</h3>
          <button 
            @click="exportTable('departments')"
            class="analytics-dashboard-table-export"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            تصدير
          </button>
        </div>
        <div class="analytics-dashboard-table-container">
          <table class="analytics-dashboard-table">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>اسم القسم</th>
                <th>عدد المرضى</th>
                <th>الإيرادات</th>
                <th>معدل الرضا</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dept, index) in topDepartments" :key="dept.id">
                <td class="analytics-dashboard-table-rank">
                  <span class="analytics-dashboard-rank-badge" :class="getRankClass(index + 1)">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="analytics-dashboard-table-name">{{ dept.name }}</td>
                <td class="analytics-dashboard-table-value">{{ formatNumber(dept.patients) }}</td>
                <td class="analytics-dashboard-table-value">{{ formatCurrency(dept.revenue) }}</td>
                <td class="analytics-dashboard-table-rating">
                  <div class="analytics-dashboard-rating">
                    <div class="analytics-dashboard-rating-stars">
                      <span 
                        v-for="star in 5" 
                        :key="star"
                        class="analytics-dashboard-star"
                        :class="{ 'analytics-dashboard-star-filled': star <= dept.rating }"
                      >
                        ★
                      </span>
                    </div>
                    <span class="analytics-dashboard-rating-value">{{ dept.rating.toFixed(1) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="analytics-dashboard-table-card">
        <div class="analytics-dashboard-table-header">
          <h3 class="analytics-dashboard-table-title">الأنشطة الأخيرة</h3>
          <button 
            @click="exportTable('activities')"
            class="analytics-dashboard-table-export"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            تصدير
          </button>
        </div>
        <div class="analytics-dashboard-table-container">
          <div class="analytics-dashboard-activities">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="analytics-dashboard-activity"
            >
              <div class="analytics-dashboard-activity-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path :d="activity.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
              <div class="analytics-dashboard-activity-content">
                <p class="analytics-dashboard-activity-text">{{ activity.description }}</p>
                <span class="analytics-dashboard-activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
              <div class="analytics-dashboard-activity-value">
                <span class="analytics-dashboard-activity-amount">{{ formatNumber(activity.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="analytics-dashboard-loading">
      <div class="analytics-dashboard-loading-spinner"></div>
      <p class="analytics-dashboard-loading-text">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="analytics-dashboard-error">
      <svg class="analytics-dashboard-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="analytics-dashboard-error-text">{{ error }}</p>
      <button @click="refreshData" class="analytics-dashboard-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAnalyticsManager } from '@/scripts/reports/analyticsManager'
import Chart from 'chart.js/auto'

// Use the analytics manager
const {
  isLoading,
  error,
  selectedDateRange,
  kpiMetrics,
  topDepartments,
  recentActivities,
  updateDateRange,
  refreshData,
  exportChart,
  exportTable
} = useAnalyticsManager()

// Chart references
const revenueChart = ref(null)
const patientsChart = ref(null)
const departmentsChart = ref(null)
const appointmentsChart = ref(null)

// Chart instances
let revenueChartInstance = null
let patientsChartInstance = null
let departmentsChartInstance = null
let appointmentsChartInstance = null

// Methods
const formatNumber = (value) => {
  if (typeof value !== 'number') return '0'
  return new Intl.NumberFormat('ar-SA').format(value)
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '0 ر.س'
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(value)
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'الآن'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} دقيقة`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ساعة`
  return date.toLocaleDateString('ar-SA')
}

const getRankClass = (rank) => {
  if (rank === 1) return 'analytics-dashboard-rank-gold'
  if (rank === 2) return 'analytics-dashboard-rank-silver'
  if (rank === 3) return 'analytics-dashboard-rank-bronze'
  return 'analytics-dashboard-rank-default'
}

const initializeCharts = async () => {
  await nextTick()
  
  // Revenue Chart
  if (revenueChart.value) {
    revenueChartInstance = new Chart(revenueChart.value, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [{
          label: 'الإيرادات (ر.س)',
          data: [120000, 150000, 180000, 160000, 200000, 220000],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('ar-SA').format(value) + ' ر.س'
              }
            }
          }
        }
      }
    })
  }

  // Patients Chart
  if (patientsChart.value) {
    patientsChartInstance = new Chart(patientsChart.value, {
      type: 'bar',
      data: {
        labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
        datasets: [{
          label: 'عدد المرضى',
          data: [45, 52, 48, 61, 55, 67, 43],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  // Departments Chart
  if (departmentsChart.value) {
    departmentsChartInstance = new Chart(departmentsChart.value, {
      type: 'doughnut',
      data: {
        labels: ['الطوارئ', 'العيادات الخارجية', 'الجراحة', 'النساء والولادة', 'الأطفال'],
        datasets: [{
          data: [25, 30, 20, 15, 10],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  // Appointments Chart
  if (appointmentsChart.value) {
    appointmentsChartInstance = new Chart(appointmentsChart.value, {
      type: 'line',
      data: {
        labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
        datasets: [{
          label: 'المواعيد المجدولة',
          data: [12, 19, 25, 22, 18, 15],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'المواعيد المكتملة',
          data: [10, 16, 20, 18, 15, 12],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

const destroyCharts = () => {
  if (revenueChartInstance) {
    revenueChartInstance.destroy()
    revenueChartInstance = null
  }
  if (patientsChartInstance) {
    patientsChartInstance.destroy()
    patientsChartInstance = null
  }
  if (departmentsChartInstance) {
    departmentsChartInstance.destroy()
    departmentsChartInstance = null
  }
  if (appointmentsChartInstance) {
    appointmentsChartInstance.destroy()
    appointmentsChartInstance = null
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  await initializeCharts()
})

onUnmounted(() => {
  destroyCharts()
})
</script>

<style scoped>
@import '@/assets/css/reports/analyticsDashboard.css';
</style>
