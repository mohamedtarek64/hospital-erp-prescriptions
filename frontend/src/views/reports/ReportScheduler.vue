<template>
  <div class="report-scheduler-container">
    <!-- Header -->
    <div class="report-scheduler-header">
      <div class="report-scheduler-title-section">
        <h1 class="report-scheduler-title">جدولة التقارير</h1>
        <p class="report-scheduler-subtitle">إدارة التقارير المجدولة والتشغيل التلقائي</p>
      </div>
      
      <div class="report-scheduler-actions">
        <button 
          @click="createSchedule" 
          class="report-scheduler-action-btn report-scheduler-create-btn"
        >
          <svg class="report-scheduler-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إنشاء جدولة جديدة
        </button>
        
        <button 
          @click="refreshData" 
          class="report-scheduler-action-btn report-scheduler-refresh-btn"
          :disabled="isLoading"
        >
          <svg 
            class="report-scheduler-action-icon" 
            :class="{ 'report-scheduler-spinning': isLoading }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="report-scheduler-stats">
      <div class="report-scheduler-stat-card">
        <div class="report-scheduler-stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div class="report-scheduler-stat-content">
          <h3 class="report-scheduler-stat-title">إجمالي الجدولات</h3>
          <p class="report-scheduler-stat-value">{{ totalSchedules || 0 }}</p>
        </div>
      </div>
      
      <div class="report-scheduler-stat-card">
        <div class="report-scheduler-stat-icon report-scheduler-stat-icon-active">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="report-scheduler-stat-content">
          <h3 class="report-scheduler-stat-title">الجدولات النشطة</h3>
          <p class="report-scheduler-stat-value">{{ activeSchedules || 0 }}</p>
        </div>
      </div>
      
      <div class="report-scheduler-stat-card">
        <div class="report-scheduler-stat-icon report-scheduler-stat-icon-pending">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="report-scheduler-stat-content">
          <h3 class="report-scheduler-stat-title">في الانتظار</h3>
          <p class="report-scheduler-stat-value">{{ pendingSchedules || 0 }}</p>
        </div>
      </div>
      
      <div class="report-scheduler-stat-card">
        <div class="report-scheduler-stat-icon report-scheduler-stat-icon-completed">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="report-scheduler-stat-content">
          <h3 class="report-scheduler-stat-title">مكتملة هذا الشهر</h3>
          <p class="report-scheduler-stat-value">{{ completedThisMonth || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="report-scheduler-filters">
      <div class="report-scheduler-filters-grid">
        <div class="report-scheduler-filter-group">
          <label class="report-scheduler-filter-label">البحث</label>
          <input 
            type="text"
            v-model="searchQuery"
            @input="debouncedSearch"
            class="report-scheduler-filter-input"
            placeholder="البحث في الجدولات..."
          />
        </div>
        
        <div class="report-scheduler-filter-group">
          <label class="report-scheduler-filter-label">الحالة</label>
          <select v-model="selectedStatus" @change="applyFilters" class="report-scheduler-filter-select">
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="paused">متوقف</option>
            <option value="completed">مكتمل</option>
            <option value="failed">فشل</option>
          </select>
        </div>
        
        <div class="report-scheduler-filter-group">
          <label class="report-scheduler-filter-label">التكرار</label>
          <select v-model="selectedFrequency" @change="applyFilters" class="report-scheduler-filter-select">
            <option value="">جميع الأنواع</option>
            <option value="hourly">كل ساعة</option>
            <option value="daily">يومياً</option>
            <option value="weekly">أسبوعياً</option>
            <option value="monthly">شهرياً</option>
            <option value="quarterly">ربعياً</option>
            <option value="yearly">سنوياً</option>
          </select>
        </div>
        
        <div class="report-scheduler-filter-group">
          <label class="report-scheduler-filter-label">نوع التقرير</label>
          <select v-model="selectedReportType" @change="applyFilters" class="report-scheduler-filter-select">
            <option value="">جميع الأنواع</option>
            <option value="patient">تقارير المرضى</option>
            <option value="financial">التقارير المالية</option>
            <option value="laboratory">تقارير المختبر</option>
            <option value="pharmacy">تقارير الصيدلية</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Scheduled Reports Table -->
    <div class="report-scheduler-table-card">
      <div class="report-scheduler-table-header">
        <h3 class="report-scheduler-table-title">الجدولات المُعرَّفة</h3>
        <div class="report-scheduler-table-actions">
          <button 
            @click="bulkAction('enable')"
            :disabled="selectedSchedules.length === 0"
            class="report-scheduler-bulk-action"
          >
            تفعيل المحدد
          </button>
          <button 
            @click="bulkAction('disable')"
            :disabled="selectedSchedules.length === 0"
            class="report-scheduler-bulk-action"
          >
            تعطيل المحدد
          </button>
        </div>
      </div>
      
      <div class="report-scheduler-table-container">
        <table class="report-scheduler-table">
          <thead>
            <tr>
              <th class="report-scheduler-table-th">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  @change="toggleSelectAll"
                  class="report-scheduler-checkbox"
                />
              </th>
              <th class="report-scheduler-table-th">اسم التقرير</th>
              <th class="report-scheduler-table-th">التكرار</th>
              <th class="report-scheduler-table-th">التشغيل التالي</th>
              <th class="report-scheduler-table-th">آخر تشغيل</th>
              <th class="report-scheduler-table-th">الحالة</th>
              <th class="report-scheduler-table-th">المستلمون</th>
              <th class="report-scheduler-table-th">العمليات</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="schedule in paginatedSchedules" 
              :key="schedule.id"
              class="report-scheduler-table-row"
            >
              <td class="report-scheduler-table-td">
                <input
                  type="checkbox"
                  :value="schedule.id"
                  v-model="selectedSchedules"
                  class="report-scheduler-checkbox"
                />
              </td>
              <td class="report-scheduler-table-td">
                <div class="report-scheduler-report-info">
                  <h4 class="report-scheduler-report-name">{{ schedule.report?.title || 'تقرير غير محدد' }}</h4>
                  <p class="report-scheduler-report-description">{{ schedule.description || 'لا يوجد وصف' }}</p>
                </div>
              </td>
              <td class="report-scheduler-table-td">
                <span class="report-scheduler-frequency-badge">
                  {{ getFrequencyText(schedule.frequency) }}
                </span>
              </td>
              <td class="report-scheduler-table-td">
                <span class="report-scheduler-next-run">{{ formatDateTime(schedule.next_run_at) }}</span>
              </td>
              <td class="report-scheduler-table-td">
                <span class="report-scheduler-last-run">{{ formatDateTime(schedule.last_run_at) || 'لم يتم التشغيل' }}</span>
              </td>
              <td class="report-scheduler-table-td">
                <span 
                  class="report-scheduler-status-badge"
                  :class="getStatusClass(schedule.status)"
                >
                  {{ getStatusText(schedule.status) }}
                </span>
              </td>
              <td class="report-scheduler-table-td">
                <div class="report-scheduler-recipients">
                  <span class="report-scheduler-recipients-count">{{ schedule.recipients?.length || 0 }} مستلم</span>
                </div>
              </td>
              <td class="report-scheduler-table-td">
                <div class="report-scheduler-actions">
                  <button 
                    @click="editSchedule(schedule)"
                    class="report-scheduler-action report-scheduler-action-edit"
                    title="تعديل الجدولة"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    @click="runNow(schedule)"
                    class="report-scheduler-action report-scheduler-action-run"
                    title="تشغيل الآن"
                    :disabled="isRunning"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-10-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    @click="toggleScheduleStatus(schedule)"
                    class="report-scheduler-action"
                    :class="schedule.status === 'active' ? 'report-scheduler-action-pause' : 'report-scheduler-action-play'"
                    :title="schedule.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'"
                  >
                    <svg v-if="schedule.status === 'active'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-10-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    @click="deleteSchedule(schedule)"
                    class="report-scheduler-action report-scheduler-action-delete"
                    title="حذف الجدولة"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="report-scheduler-pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="report-scheduler-pagination-btn"
        >
          السابق
        </button>
        
        <div class="report-scheduler-pagination-pages">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="currentPage = page"
            :class="[
              'report-scheduler-pagination-page',
              { 'report-scheduler-pagination-page-active': currentPage === page }
            ]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="report-scheduler-pagination-btn"
        >
          التالي
        </button>
      </div>
    </div>

    <!-- Recent Executions -->
    <div class="report-scheduler-recent-card">
      <div class="report-scheduler-recent-header">
        <h3 class="report-scheduler-recent-title">آخر التشغيلات</h3>
        <button 
          @click="refreshExecutions"
          class="report-scheduler-recent-refresh"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
      
      <div class="report-scheduler-recent-list">
        <div 
          v-for="execution in recentExecutions" 
          :key="execution.id"
          class="report-scheduler-recent-item"
        >
          <div class="report-scheduler-recent-icon">
            <svg 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              :class="getExecutionIconClass(execution.status)"
            >
              <path 
                v-if="execution.status === 'success'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
              <path 
                v-else-if="execution.status === 'failed'"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          
          <div class="report-scheduler-recent-content">
            <h4 class="report-scheduler-recent-name">{{ execution.report?.title || 'تقرير غير محدد' }}</h4>
            <p class="report-scheduler-recent-time">{{ formatDateTime(execution.executed_at) }}</p>
            <p class="report-scheduler-recent-duration">مدة التشغيل: {{ execution.duration || 'غير محدد' }}</p>
          </div>
          
          <div class="report-scheduler-recent-status">
            <span 
              class="report-scheduler-execution-status"
              :class="getExecutionStatusClass(execution.status)"
            >
              {{ getExecutionStatusText(execution.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="report-scheduler-loading">
      <div class="report-scheduler-loading-spinner"></div>
      <p class="report-scheduler-loading-text">جاري تحميل الجدولات...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="report-scheduler-error">
      <svg class="report-scheduler-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="report-scheduler-error-text">{{ error }}</p>
      <button @click="refreshData" class="report-scheduler-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReportSchedulerManager } from '@/scripts/reports/reportSchedulerManager'

// Use the report scheduler manager
const {
  isLoading,
  isRunning,
  error,
  searchQuery,
  selectedStatus,
  selectedFrequency,
  selectedReportType,
  selectedSchedules,
  selectAll,
  currentPage,
  totalSchedules,
  activeSchedules,
  pendingSchedules,
  completedThisMonth,
  paginatedSchedules,
  totalPages,
  visiblePages,
  recentExecutions,
  debouncedSearch,
  applyFilters,
  toggleSelectAll,
  bulkAction,
  createSchedule,
  editSchedule,
  runNow,
  toggleScheduleStatus,
  deleteSchedule,
  refreshData,
  refreshExecutions,
  getFrequencyText,
  getStatusClass,
  getStatusText,
  getExecutionIconClass,
  getExecutionStatusClass,
  getExecutionStatusText,
  formatDateTime
} = useReportSchedulerManager()

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
@import '@/assets/css/reports/reportScheduler.css';
</style>
