<template>
  <div class="quality-assurance-dashboard-container">
    <!-- Header -->
    <div class="quality-assurance-dashboard-header">
      <div class="quality-assurance-dashboard-title-section">
        <h1 class="quality-assurance-dashboard-title">نظام ضمان الجودة والامتثال</h1>
        <p class="quality-assurance-dashboard-subtitle">إدارة شاملة لمعايير الجودة والتدقيقات والحوادث والامتثال</p>
      </div>
      <div class="quality-assurance-dashboard-actions">
        <button 
          @click="refreshData"
          :disabled="loading"
          class="quality-assurance-dashboard-refresh-btn"
        >
          <svg class="quality-assurance-dashboard-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث البيانات
        </button>
        <button 
          @click="generateReport"
          :disabled="loading"
          class="quality-assurance-dashboard-report-btn"
        >
          <svg class="quality-assurance-dashboard-report-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          إنشاء تقرير
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="quality-assurance-dashboard-loading">
      <div class="quality-assurance-dashboard-loading-spinner"></div>
      <p class="quality-assurance-dashboard-loading-text">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="quality-assurance-dashboard-error">
      <div class="quality-assurance-dashboard-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="quality-assurance-dashboard-error-title">خطأ في تحميل البيانات</h3>
      <p class="quality-assurance-dashboard-error-message">{{ error }}</p>
      <button @click="refreshData" class="quality-assurance-dashboard-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="quality-assurance-dashboard-content">
      <!-- Statistics Overview -->
      <div class="quality-assurance-dashboard-stats">
        <div class="quality-assurance-dashboard-stat-card">
          <div class="quality-assurance-dashboard-stat-icon quality-assurance-dashboard-stat-icon-standards">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="quality-assurance-dashboard-stat-content">
            <h3 class="quality-assurance-dashboard-stat-title">معايير الجودة</h3>
            <p class="quality-assurance-dashboard-stat-value">{{ statistics?.total_standards || 0 }}</p>
            <p class="quality-assurance-dashboard-stat-subtitle">{{ statistics?.active_standards || 0 }} نشط</p>
          </div>
        </div>

        <div class="quality-assurance-dashboard-stat-card">
          <div class="quality-assurance-dashboard-stat-icon quality-assurance-dashboard-stat-icon-audits">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <div class="quality-assurance-dashboard-stat-content">
            <h3 class="quality-assurance-dashboard-stat-title">التدقيقات</h3>
            <p class="quality-assurance-dashboard-stat-value">{{ statistics?.total_audits || 0 }}</p>
            <p class="quality-assurance-dashboard-stat-subtitle">{{ statistics?.completed_audits || 0 }} مكتمل</p>
          </div>
        </div>

        <div class="quality-assurance-dashboard-stat-card">
          <div class="quality-assurance-dashboard-stat-icon quality-assurance-dashboard-stat-icon-incidents">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="quality-assurance-dashboard-stat-content">
            <h3 class="quality-assurance-dashboard-stat-title">الحوادث</h3>
            <p class="quality-assurance-dashboard-stat-value">{{ statistics?.total_incidents || 0 }}</p>
            <p class="quality-assurance-dashboard-stat-subtitle">{{ statistics?.critical_incidents || 0 }} حرج</p>
          </div>
        </div>

        <div class="quality-assurance-dashboard-stat-card">
          <div class="quality-assurance-dashboard-stat-icon quality-assurance-dashboard-stat-icon-compliance">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="quality-assurance-dashboard-stat-content">
            <h3 class="quality-assurance-dashboard-stat-title">معدل الامتثال</h3>
            <p class="quality-assurance-dashboard-stat-value">{{ statistics?.compliance_rate || 0 }}%</p>
            <p class="quality-assurance-dashboard-stat-subtitle">إجمالي الامتثال</p>
          </div>
        </div>
      </div>

      <!-- Alerts Section -->
      <div v-if="alerts.length > 0" class="quality-assurance-dashboard-alerts">
        <h2 class="quality-assurance-dashboard-section-title">التنبيهات والتنبيهات</h2>
        <div class="quality-assurance-dashboard-alerts-grid">
          <div 
            v-for="alert in alerts" 
            :key="alert.title"
            class="quality-assurance-dashboard-alert-card"
            :class="`quality-assurance-dashboard-alert-${alert.type}`"
          >
            <div class="quality-assurance-dashboard-alert-icon">
              <svg v-if="alert.type === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg v-else-if="alert.type === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="quality-assurance-dashboard-alert-content">
              <h3 class="quality-assurance-dashboard-alert-title">{{ alert.title }}</h3>
              <p class="quality-assurance-dashboard-alert-message">{{ alert.message }}</p>
              <span class="quality-assurance-dashboard-alert-count">{{ alert.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quality-assurance-dashboard-actions-section">
        <h2 class="quality-assurance-dashboard-section-title">الإجراءات السريعة</h2>
        <div class="quality-assurance-dashboard-actions-grid">
          <button 
            @click="navigateToStandards"
            class="quality-assurance-dashboard-action-btn"
          >
            <svg class="quality-assurance-dashboard-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="quality-assurance-dashboard-action-text">إدارة المعايير</span>
          </button>

          <button 
            @click="navigateToAudits"
            class="quality-assurance-dashboard-action-btn"
          >
            <svg class="quality-assurance-dashboard-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <span class="quality-assurance-dashboard-action-text">إدارة التدقيقات</span>
          </button>

          <button 
            @click="navigateToIncidents"
            class="quality-assurance-dashboard-action-btn"
          >
            <svg class="quality-assurance-dashboard-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="quality-assurance-dashboard-action-text">إدارة الحوادث</span>
          </button>

          <button 
            @click="navigateToCompliance"
            class="quality-assurance-dashboard-action-btn"
          >
            <svg class="quality-assurance-dashboard-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span class="quality-assurance-dashboard-action-text">إدارة الامتثال</span>
          </button>

          <button 
            @click="navigateToTraining"
            class="quality-assurance-dashboard-action-btn"
          >
            <svg class="quality-assurance-dashboard-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <span class="quality-assurance-dashboard-action-text">إدارة التدريب</span>
          </button>
        </div>
      </div>

      <!-- Recent Activities -->
      <div v-if="recentActivities.length > 0" class="quality-assurance-dashboard-activities">
        <h2 class="quality-assurance-dashboard-section-title">الأنشطة الأخيرة</h2>
        <div class="quality-assurance-dashboard-activities-list">
          <div 
            v-for="activity in recentActivities.slice(0, 5)" 
            :key="`${activity.type}-${activity.date}`"
            class="quality-assurance-dashboard-activity-item"
          >
            <div class="quality-assurance-dashboard-activity-icon">
              <svg v-if="activity.type === 'audit'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <svg v-else-if="activity.type === 'incident'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="quality-assurance-dashboard-activity-content">
              <h4 class="quality-assurance-dashboard-activity-title">{{ activity.title }}</h4>
              <p class="quality-assurance-dashboard-activity-description">{{ activity.description }}</p>
              <div class="quality-assurance-dashboard-activity-meta">
                <span class="quality-assurance-dashboard-activity-user">{{ activity.user }}</span>
                <span class="quality-assurance-dashboard-activity-date">{{ formatDateTime(activity.date) }}</span>
              </div>
            </div>
            <div class="quality-assurance-dashboard-activity-status">
              <span 
                class="quality-assurance-dashboard-activity-status-badge"
                :class="`quality-assurance-dashboard-activity-status-${getStatusColor(activity.status)}`"
              >
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQualityAssuranceManager } from '@/scripts/qualityAssurance/qualityAssuranceManager'
import '@/assets/css/qualityAssurance/qualityAssuranceDashboard.css'

const {
  // State
  loading,
  error,
  
  // Computed
  statistics,
  alerts,
  recentActivities,
  
  // Methods
  loadDashboardData,
  navigateToStandards,
  navigateToAudits,
  navigateToIncidents,
  navigateToCompliance,
  navigateToTraining,
  generateReport,
  formatDateTime,
  getStatusColor
} = useQualityAssuranceManager()

// Local methods
const refreshData = async () => {
  await loadDashboardData()
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
@import '@/assets/css/qualityAssurance/qualityAssuranceDashboard.css';
</style>
