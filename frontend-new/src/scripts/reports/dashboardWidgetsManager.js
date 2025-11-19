/**
 * @module dashboardWidgetsManager
 * @description Manager for dashboard widgets functionality
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { analyticsApi } from '@/services/api/analyticsApi'

/**
 * Dashboard Widgets Manager Class
 * Handles dashboard widgets state and business logic
 */
class DashboardWidgetsManager {
  constructor() {
    this.router = useRouter()
    this.reportsStore = useReportsStore()
    
    // Reactive state
    this.isLoading = ref(false)
    this.isSaving = ref(false)
    this.error = ref(null)
    
    // Widget data
    this.widgetCategories = ref([])
    this.activeWidgets = ref([])
    this.originalLayout = ref([])
    
    // Drag and drop
    this.draggedWidget = ref(null)
    this.dragOverIndex = ref(-1)
    
    // Configuration modal
    this.showConfigModal = ref(false)
    this.selectedWidget = ref(null)
    this.widgetConfig = ref({
      title: '',
      size: 'medium',
      timeRange: 'month',
      showTrend: true
    })
    
    // Changes tracking
    this.hasChanges = ref(false)
    
    this.initializeManager()
  }

  /**
   * Initialize the dashboard widgets manager
   */
  initializeManager() {
    this.loadWidgets()
  }

  /**
   * Load available widgets
   */
  async loadWidgets() {
    try {
      this.isLoading.value = true
      this.error.value = null
      
      const response = await analyticsApi.getDashboardWidgets()
      this.widgetCategories.value = response.data || this.getMockWidgetCategories()
      
      // Load user's active widgets
      await this.loadActiveWidgets()
    } catch (err) {
      this.error.value = err.message || 'فشل في تحميل العناصر'
      console.error('Error loading widgets:', err)
      this.widgetCategories.value = this.getMockWidgetCategories()
    } finally {
      this.isLoading.value = false
    }
  }

  /**
   * Load user's active widgets
   */
  async loadActiveWidgets() {
    try {
      const response = await analyticsApi.getUserDashboardPreferences()
      this.activeWidgets.value = response.data?.widgets || this.getDefaultActiveWidgets()
      this.originalLayout.value = [...this.activeWidgets.value]
    } catch (err) {
      console.error('Error loading active widgets:', err)
      this.activeWidgets.value = this.getDefaultActiveWidgets()
      this.originalLayout.value = [...this.activeWidgets.value]
    }
  }

  /**
   * Toggle widget active state
   */
  toggleWidget(widgetId) {
    const widget = this.findWidgetById(widgetId)
    if (!widget) return
    
    const isActive = this.activeWidgets.value.some(w => w.id === widgetId)
    
    if (isActive) {
      this.removeWidget(widgetId)
    } else {
      this.addWidget(widget)
    }
    
    this.hasChanges.value = true
  }

  /**
   * Add widget to active widgets
   */
  addWidget(widget) {
    const newWidget = {
      ...widget,
      config: {
        title: widget.title,
        size: 'medium',
        timeRange: 'month',
        showTrend: true
      }
    }
    
    this.activeWidgets.value.push(newWidget)
    this.hasChanges.value = true
  }

  /**
   * Remove widget from active widgets
   */
  removeWidget(widgetId) {
    const index = this.activeWidgets.value.findIndex(w => w.id === widgetId)
    if (index !== -1) {
      this.activeWidgets.value.splice(index, 1)
      this.hasChanges.value = true
    }
  }

  /**
   * Configure widget
   */
  configureWidget(widget) {
    this.selectedWidget.value = widget
    this.widgetConfig.value = {
      title: widget.config?.title || widget.title,
      size: widget.config?.size || 'medium',
      timeRange: widget.config?.timeRange || 'month',
      showTrend: widget.config?.showTrend ?? true
    }
    this.showConfigModal.value = true
  }

  /**
   * Preview widget
   */
  previewWidget(widget) {
    // Navigate to preview page or show preview modal
    this.router.push(`/reports/widgets/preview/${widget.id}`)
  }

  /**
   * Save widget configuration
   */
  saveWidgetConfig() {
    if (!this.selectedWidget.value) return
    
    const index = this.activeWidgets.value.findIndex(w => w.id === this.selectedWidget.value.id)
    if (index !== -1) {
      this.activeWidgets.value[index].config = { ...this.widgetConfig.value }
      this.hasChanges.value = true
    }
    
    this.closeConfigModal()
  }

  /**
   * Close configuration modal
   */
  closeConfigModal() {
    this.showConfigModal.value = false
    this.selectedWidget.value = null
    this.widgetConfig.value = {
      title: '',
      size: 'medium',
      timeRange: 'month',
      showTrend: true
    }
  }

  /**
   * Save layout
   */
  async saveLayout() {
    try {
      this.isSaving.value = true
      this.error.value = null
      
      const layoutData = {
        widgets: this.activeWidgets.value.map((widget, index) => ({
          id: widget.id,
          position: index,
          config: widget.config
        }))
      }
      
      await analyticsApi.updateUserDashboardPreferences(layoutData)
      this.originalLayout.value = [...this.activeWidgets.value]
      this.hasChanges.value = false
    } catch (err) {
      this.error.value = err.message || 'فشل في حفظ التخطيط'
      console.error('Error saving layout:', err)
    } finally {
      this.isSaving.value = false
    }
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    this.activeWidgets.value = this.getDefaultActiveWidgets()
    this.hasChanges.value = true
  }

  /**
   * Start drag operation
   */
  startDrag(widget) {
    this.draggedWidget.value = widget
  }

  /**
   * End drag operation
   */
  endDrag() {
    this.draggedWidget.value = null
    this.dragOverIndex.value = -1
  }

  /**
   * Handle drop operation
   */
  handleDrop(event) {
    event.preventDefault()
    
    if (!this.draggedWidget.value) return
    
    const dropIndex = this.calculateDropIndex(event)
    
    if (dropIndex !== -1) {
      this.reorderWidgets(this.draggedWidget.value, dropIndex)
    }
    
    this.endDrag()
  }

  /**
   * Calculate drop index
   */
  calculateDropIndex(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const itemHeight = 200 // Approximate item height
    return Math.floor(y / itemHeight)
  }

  /**
   * Reorder widgets
   */
  reorderWidgets(widget, newIndex) {
    const currentIndex = this.activeWidgets.value.findIndex(w => w.id === widget.id)
    if (currentIndex === -1) return
    
    // Remove from current position
    this.activeWidgets.value.splice(currentIndex, 1)
    
    // Insert at new position
    this.activeWidgets.value.splice(newIndex, 0, widget)
    
    this.hasChanges.value = true
  }

  /**
   * Find widget by ID
   */
  findWidgetById(widgetId) {
    for (const category of this.widgetCategories.value) {
      const widget = category.widgets.find(w => w.id === widgetId)
      if (widget) return widget
    }
    return null
  }

  /**
   * Get mock widget categories
   */
  getMockWidgetCategories() {
    return [
      {
        id: 1,
        name: 'المؤشرات الرئيسية',
        description: 'المؤشرات الأساسية لأداء المستشفى',
        widgets: [
          {
            id: 1,
            title: 'إجمالي المرضى',
            description: 'عدد المرضى المسجلين',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
            previewText: '1,247 مريض'
          },
          {
            id: 2,
            title: 'الإيرادات الشهرية',
            description: 'إجمالي الإيرادات للشهر الحالي',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
            previewText: '2,450,000 ر.س'
          },
          {
            id: 3,
            title: 'المواعيد اليوم',
            description: 'عدد المواعيد المجدولة اليوم',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            previewText: '89 موعد'
          }
        ]
      },
      {
        id: 2,
        name: 'الرسوم البيانية',
        description: 'الرسوم البيانية والتحليلات المرئية',
        widgets: [
          {
            id: 4,
            title: 'رسم الإيرادات',
            description: 'رسم بياني للإيرادات الشهرية',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            previewText: 'رسم بياني خطي'
          },
          {
            id: 5,
            title: 'رسم المرضى',
            description: 'رسم بياني لعدد المرضى',
            icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
            previewText: 'رسم بياني عمودي'
          },
          {
            id: 6,
            title: 'رسم الأقسام',
            description: 'توزيع المرضى حسب الأقسام',
            icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
            previewText: 'رسم بياني دائري'
          }
        ]
      },
      {
        id: 3,
        name: 'التقارير السريعة',
        description: 'تقارير سريعة ومختصرة',
        widgets: [
          {
            id: 7,
            title: 'تقرير اليوم',
            description: 'ملخص أنشطة اليوم',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            previewText: 'ملخص اليوم'
          },
          {
            id: 8,
            title: 'التنبيهات',
            description: 'التنبيهات والإشعارات المهمة',
            icon: 'M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17h8l-2.586-2.586a2 2 0 00-2.828 0L4.828 17z',
            previewText: '3 تنبيهات'
          }
        ]
      }
    ]
  }

  /**
   * Get default active widgets
   */
  getDefaultActiveWidgets() {
    return [
      {
        id: 1,
        title: 'إجمالي المرضى',
        description: 'عدد المرضى المسجلين',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        previewText: '1,247 مريض',
        config: {
          title: 'إجمالي المرضى',
          size: 'medium',
          timeRange: 'month',
          showTrend: true
        }
      },
      {
        id: 2,
        title: 'الإيرادات الشهرية',
        description: 'إجمالي الإيرادات للشهر الحالي',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
        previewText: '2,450,000 ر.س',
        config: {
          title: 'الإيرادات الشهرية',
          size: 'medium',
          timeRange: 'month',
          showTrend: true
        }
      }
    ]
  }

  /**
   * Get reactive data for template
   */
  getReactiveData() {
    return {
      isLoading: this.isLoading,
      error: this.error,
      isSaving: this.isSaving,
      hasChanges: this.hasChanges,
      widgetCategories: this.widgetCategories,
      activeWidgets: this.activeWidgets,
      draggedWidget: this.draggedWidget,
      showConfigModal: this.showConfigModal,
      selectedWidget: this.selectedWidget,
      widgetConfig: this.widgetConfig
    }
  }

  /**
   * Get methods for template
   */
  getMethods() {
    return {
      loadWidgets: this.loadWidgets.bind(this),
      toggleWidget: this.toggleWidget.bind(this),
      configureWidget: this.configureWidget.bind(this),
      previewWidget: this.previewWidget.bind(this),
      removeWidget: this.removeWidget.bind(this),
      saveLayout: this.saveLayout.bind(this),
      resetToDefaults: this.resetToDefaults.bind(this),
      startDrag: this.startDrag.bind(this),
      endDrag: this.endDrag.bind(this),
      handleDrop: this.handleDrop.bind(this),
      closeConfigModal: this.closeConfigModal.bind(this),
      saveWidgetConfig: this.saveWidgetConfig.bind(this)
    }
  }
}

/**
 * Composable function for using dashboard widgets manager
 */
export function useDashboardWidgetsManager() {
  const manager = new DashboardWidgetsManager()
  
  return {
    ...manager.getReactiveData(),
    ...manager.getMethods()
  }
}

export default DashboardWidgetsManager
