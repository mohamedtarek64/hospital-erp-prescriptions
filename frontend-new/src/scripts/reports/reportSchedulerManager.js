/**
 * @module reportSchedulerManager
 * @description Manager for report scheduler functionality
 */

import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { reportsApi } from '@/services/api/reportsApi'

/**
 * Report Scheduler Manager Class
 * Handles report scheduling state and business logic
 */
class ReportSchedulerManager {
  constructor() {
    this.router = useRouter()
    this.reportsStore = useReportsStore()
    
    // Reactive state
    this.isLoading = ref(false)
    this.isRunning = ref(false)
    this.error = ref(null)
    
    // Search and filters
    this.searchQuery = ref('')
    this.selectedStatus = ref('')
    this.selectedFrequency = ref('')
    this.selectedReportType = ref('')
    
    // Selection
    this.selectedSchedules = ref([])
    this.selectAll = ref(false)
    
    // Pagination
    this.currentPage = ref(1)
    this.itemsPerPage = ref(10)
    
    // Data
    this.schedules = ref([])
    this.recentExecutions = ref([])
    this.schedulerStats = ref({
      total: 0,
      active: 0,
      pending: 0,
      completed_this_month: 0
    })
    
    // Debounced search
    this.searchTimeout = null
    
    this.initializeManager()
  }

  /**
   * Initialize the report scheduler manager
   */
  initializeManager() {
    this.loadSchedules()
    this.loadRecentExecutions()
    this.loadSchedulerStats()
  }

  /**
   * Load scheduled reports
   */
  async loadSchedules() {
    try {
      this.isLoading.value = true
      this.error.value = null
      
      const params = {
        search: this.searchQuery.value,
        status: this.selectedStatus.value,
        frequency: this.selectedFrequency.value,
        report_type: this.selectedReportType.value,
        page: this.currentPage.value,
        per_page: this.itemsPerPage.value
      }
      
      const response = await reportsApi.getScheduledReports(params)
      this.schedules.value = response.data || this.getMockSchedules()
    } catch (err) {
      this.error.value = err.message || 'فشل في تحميل الجدولات'
      console.error('Error loading schedules:', err)
      this.schedules.value = this.getMockSchedules()
    } finally {
      this.isLoading.value = false
    }
  }

  /**
   * Load recent executions
   */
  async loadRecentExecutions() {
    try {
      const response = await reportsApi.getRecentExecutions({ limit: 10 })
      this.recentExecutions.value = response.data || this.getMockExecutions()
    } catch (err) {
      console.error('Error loading recent executions:', err)
      this.recentExecutions.value = this.getMockExecutions()
    }
  }

  /**
   * Load scheduler statistics
   */
  async loadSchedulerStats() {
    try {
      const response = await reportsApi.getSchedulerStats()
      this.schedulerStats.value = response.data || {
        total: this.schedules.value.length,
        active: this.schedules.value.filter(s => s.status === 'active').length,
        pending: this.schedules.value.filter(s => s.status === 'pending').length,
        completed_this_month: 45
      }
    } catch (err) {
      console.error('Error loading scheduler stats:', err)
      this.schedulerStats.value = {
        total: this.schedules.value.length,
        active: this.schedules.value.filter(s => s.status === 'active').length,
        pending: this.schedules.value.filter(s => s.status === 'pending').length,
        completed_this_month: 45
      }
    }
  }

  /**
   * Debounced search function
   */
  debouncedSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage.value = 1
      this.loadSchedules()
    }, 300)
  }

  /**
   * Apply filters
   */
  async applyFilters() {
    this.currentPage.value = 1
    await this.loadSchedules()
  }

  /**
   * Toggle select all
   */
  toggleSelectAll() {
    if (this.selectAll.value) {
      this.selectedSchedules.value = this.paginatedSchedules.value.map(s => s.id)
    } else {
      this.selectedSchedules.value = []
    }
  }

  /**
   * Bulk action on selected schedules
   */
  async bulkAction(action) {
    if (this.selectedSchedules.value.length === 0) return
    
    try {
      this.isLoading.value = true
      
      const promises = this.selectedSchedules.value.map(scheduleId => {
        if (action === 'enable') {
          return this.enableSchedule(scheduleId)
        } else if (action === 'disable') {
          return this.disableSchedule(scheduleId)
        } else if (action === 'delete') {
          return this.deleteSchedule({ id: scheduleId })
        }
      })
      
      await Promise.all(promises)
      
      this.selectedSchedules.value = []
      this.selectAll.value = false
      await this.loadSchedules()
    } catch (err) {
      this.error.value = err.message || `فشل في تنفيذ العملية: ${action}`
    } finally {
      this.isLoading.value = false
    }
  }

  /**
   * Create new schedule
   */
  createSchedule() {
    this.router.push('/reports/scheduler/create')
  }

  /**
   * Edit schedule
   */
  editSchedule(schedule) {
    this.router.push(`/reports/scheduler/${schedule.id}/edit`)
  }

  /**
   * Run schedule now
   */
  async runNow(schedule) {
    try {
      this.isRunning.value = true
      this.error.value = null
      
      await reportsApi.runScheduleNow(schedule.id)
      
      // Refresh data after successful run
      await this.loadSchedules()
      await this.loadRecentExecutions()
    } catch (err) {
      this.error.value = err.message || 'فشل في تشغيل الجدولة'
      console.error('Error running schedule:', err)
    } finally {
      this.isRunning.value = false
    }
  }

  /**
   * Toggle schedule status (active/paused)
   */
  async toggleScheduleStatus(schedule) {
    try {
      const newStatus = schedule.status === 'active' ? 'paused' : 'active'
      
      await reportsApi.updateScheduleStatus(schedule.id, { status: newStatus })
      
      // Update local state
      const index = this.schedules.value.findIndex(s => s.id === schedule.id)
      if (index !== -1) {
        this.schedules.value[index].status = newStatus
      }
      
      await this.loadSchedulerStats()
    } catch (err) {
      this.error.value = err.message || 'فشل في تحديث حالة الجدولة'
      console.error('Error toggling schedule status:', err)
    }
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(schedule) {
    if (!confirm('هل أنت متأكد من حذف هذه الجدولة؟')) return
    
    try {
      await reportsApi.deleteSchedule(schedule.id)
      
      // Remove from local state
      const index = this.schedules.value.findIndex(s => s.id === schedule.id)
      if (index !== -1) {
        this.schedules.value.splice(index, 1)
      }
      
      await this.loadSchedulerStats()
    } catch (err) {
      this.error.value = err.message || 'فشل في حذف الجدولة'
      console.error('Error deleting schedule:', err)
    }
  }

  /**
   * Enable schedule
   */
  async enableSchedule(scheduleId) {
    return reportsApi.updateScheduleStatus(scheduleId, { status: 'active' })
  }

  /**
   * Disable schedule
   */
  async disableSchedule(scheduleId) {
    return reportsApi.updateScheduleStatus(scheduleId, { status: 'paused' })
  }

  /**
   * Refresh all data
   */
  async refreshData() {
    await Promise.all([
      this.loadSchedules(),
      this.loadRecentExecutions(),
      this.loadSchedulerStats()
    ])
  }

  /**
   * Refresh executions only
   */
  async refreshExecutions() {
    await this.loadRecentExecutions()
  }

  /**
   * Get frequency text
   */
  getFrequencyText(frequency) {
    const frequencies = {
      hourly: 'كل ساعة',
      daily: 'يومياً',
      weekly: 'أسبوعياً',
      monthly: 'شهرياً',
      quarterly: 'ربعياً',
      yearly: 'سنوياً'
    }
    return frequencies[frequency] || frequency
  }

  /**
   * Get status class
   */
  getStatusClass(status) {
    const classes = {
      active: 'report-scheduler-status-active',
      paused: 'report-scheduler-status-paused',
      completed: 'report-scheduler-status-completed',
      failed: 'report-scheduler-status-failed',
      pending: 'report-scheduler-status-pending'
    }
    return classes[status] || 'report-scheduler-status-unknown'
  }

  /**
   * Get status text
   */
  getStatusText(status) {
    const statuses = {
      active: 'نشط',
      paused: 'متوقف',
      completed: 'مكتمل',
      failed: 'فشل',
      pending: 'في الانتظار'
    }
    return statuses[status] || status
  }

  /**
   * Get execution icon class
   */
  getExecutionIconClass(status) {
    const classes = {
      success: 'text-green-500',
      failed: 'text-red-500',
      running: 'text-blue-500'
    }
    return classes[status] || 'text-gray-500'
  }

  /**
   * Get execution status class
   */
  getExecutionStatusClass(status) {
    const classes = {
      success: 'report-scheduler-execution-success',
      failed: 'report-scheduler-execution-failed',
      running: 'report-scheduler-execution-running'
    }
    return classes[status] || 'report-scheduler-execution-unknown'
  }

  /**
   * Get execution status text
   */
  getExecutionStatusText(status) {
    const statuses = {
      success: 'نجح',
      failed: 'فشل',
      running: 'قيد التشغيل'
    }
    return statuses[status] || status
  }

  /**
   * Format date and time
   */
  formatDateTime(dateString) {
    if (!dateString) return 'غير محدد'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'تاريخ غير صحيح'
    }
  }

  /**
   * Get mock schedules data
   */
  getMockSchedules() {
    return [
      {
        id: 1,
        report: { title: 'التقرير اليومي للمرضى' },
        description: 'تقرير يومي لإحصائيات المرضى',
        frequency: 'daily',
        next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        last_run_at: new Date().toISOString(),
        status: 'active',
        recipients: ['admin@hospital.com', 'doctor@hospital.com']
      },
      {
        id: 2,
        report: { title: 'التقرير المالي الأسبوعي' },
        description: 'تقرير أسبوعي للإيرادات والمصروفات',
        frequency: 'weekly',
        next_run_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_run_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        recipients: ['finance@hospital.com']
      },
      {
        id: 3,
        report: { title: 'تقرير المختبر الشهري' },
        description: 'تقرير شهري لنتائج المختبر',
        frequency: 'monthly',
        next_run_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_run_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paused',
        recipients: ['lab@hospital.com', 'admin@hospital.com']
      }
    ]
  }

  /**
   * Get mock executions data
   */
  getMockExecutions() {
    return [
      {
        id: 1,
        report: { title: 'التقرير اليومي للمرضى' },
        executed_at: new Date().toISOString(),
        duration: '2 دقيقة',
        status: 'success'
      },
      {
        id: 2,
        report: { title: 'التقرير المالي الأسبوعي' },
        executed_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        duration: '5 دقائق',
        status: 'success'
      },
      {
        id: 3,
        report: { title: 'تقرير الصيدلية' },
        executed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration: '1 دقيقة',
        status: 'failed'
      }
    ]
  }

  /**
   * Computed properties
   */
  get filteredSchedules() {
    return computed(() => {
      let filtered = this.schedules.value
      
      if (this.searchQuery.value) {
        const query = this.searchQuery.value.toLowerCase()
        filtered = filtered.filter(schedule => 
          schedule.report?.title?.toLowerCase().includes(query) ||
          schedule.description?.toLowerCase().includes(query)
        )
      }
      
      if (this.selectedStatus.value) {
        filtered = filtered.filter(schedule => schedule.status === this.selectedStatus.value)
      }
      
      if (this.selectedFrequency.value) {
        filtered = filtered.filter(schedule => schedule.frequency === this.selectedFrequency.value)
      }
      
      return filtered
    })
  }

  get totalSchedules() {
    return computed(() => this.schedulerStats.value.total)
  }

  get activeSchedules() {
    return computed(() => this.schedulerStats.value.active)
  }

  get pendingSchedules() {
    return computed(() => this.schedulerStats.value.pending)
  }

  get completedThisMonth() {
    return computed(() => this.schedulerStats.value.completed_this_month)
  }

  get paginatedSchedules() {
    return computed(() => {
      const start = (this.currentPage.value - 1) * this.itemsPerPage.value
      const end = start + this.itemsPerPage.value
      return this.filteredSchedules.value.slice(start, end)
    })
  }

  get totalPages() {
    return computed(() => {
      return Math.ceil(this.filteredSchedules.value.length / this.itemsPerPage.value)
    })
  }

  get visiblePages() {
    return computed(() => {
      const pages = []
      const total = this.totalPages.value
      const current = this.currentPage.value
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    })
  }

  /**
   * Get reactive data for template
   */
  getReactiveData() {
    return {
      isLoading: this.isLoading,
      isRunning: this.isRunning,
      error: this.error,
      searchQuery: this.searchQuery,
      selectedStatus: this.selectedStatus,
      selectedFrequency: this.selectedFrequency,
      selectedReportType: this.selectedReportType,
      selectedSchedules: this.selectedSchedules,
      selectAll: this.selectAll,
      currentPage: this.currentPage,
      totalSchedules: this.totalSchedules,
      activeSchedules: this.activeSchedules,
      pendingSchedules: this.pendingSchedules,
      completedThisMonth: this.completedThisMonth,
      paginatedSchedules: this.paginatedSchedules,
      totalPages: this.totalPages,
      visiblePages: this.visiblePages,
      recentExecutions: this.recentExecutions
    }
  }

  /**
   * Get methods for template
   */
  getMethods() {
    return {
      debouncedSearch: this.debouncedSearch.bind(this),
      applyFilters: this.applyFilters.bind(this),
      toggleSelectAll: this.toggleSelectAll.bind(this),
      bulkAction: this.bulkAction.bind(this),
      createSchedule: this.createSchedule.bind(this),
      editSchedule: this.editSchedule.bind(this),
      runNow: this.runNow.bind(this),
      toggleScheduleStatus: this.toggleScheduleStatus.bind(this),
      deleteSchedule: this.deleteSchedule.bind(this),
      refreshData: this.refreshData.bind(this),
      refreshExecutions: this.refreshExecutions.bind(this),
      getFrequencyText: this.getFrequencyText.bind(this),
      getStatusClass: this.getStatusClass.bind(this),
      getStatusText: this.getStatusText.bind(this),
      getExecutionIconClass: this.getExecutionIconClass.bind(this),
      getExecutionStatusClass: this.getExecutionStatusClass.bind(this),
      getExecutionStatusText: this.getExecutionStatusText.bind(this),
      formatDateTime: this.formatDateTime.bind(this)
    }
  }

  /**
   * Cleanup method
   */
  cleanup() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = null
    }
  }
}

/**
 * Composable function for using report scheduler manager
 */
export function useReportSchedulerManager() {
  const manager = new ReportSchedulerManager()
  
  // Cleanup on unmount
  onUnmounted(() => {
    manager.cleanup()
  })
  
  return {
    ...manager.getReactiveData(),
    ...manager.getMethods()
  }
}

export default ReportSchedulerManager
