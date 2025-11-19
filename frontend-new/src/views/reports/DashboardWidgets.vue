<template>
  <div class="dashboard-widgets-container">
    <!-- Header -->
    <div class="dashboard-widgets-header">
      <div class="dashboard-widgets-title-section">
        <h1 class="dashboard-widgets-title">إدارة عناصر لوحة التحكم</h1>
        <p class="dashboard-widgets-subtitle">تخصيص وتنظيم عناصر لوحة التحكم حسب احتياجاتك</p>
      </div>
      
      <div class="dashboard-widgets-actions">
        <button 
          @click="resetToDefaults" 
          class="dashboard-widgets-action-btn dashboard-widgets-reset-btn"
        >
          <svg class="dashboard-widgets-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          إعادة تعيين
        </button>
        
        <button 
          @click="saveLayout" 
          class="dashboard-widgets-action-btn dashboard-widgets-save-btn"
          :disabled="!hasChanges || isSaving"
        >
          <svg 
            v-if="!isSaving"
            class="dashboard-widgets-action-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg 
            v-else
            class="dashboard-widgets-action-icon dashboard-widgets-spinning" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isSaving ? 'جاري الحفظ...' : 'حفظ التخطيط' }}
        </button>
      </div>
    </div>

    <!-- Widget Categories -->
    <div class="dashboard-widgets-categories">
      <div 
        v-for="category in widgetCategories" 
        :key="category.id"
        class="dashboard-widgets-category"
      >
        <h3 class="dashboard-widgets-category-title">{{ category.name }}</h3>
        <p class="dashboard-widgets-category-description">{{ category.description }}</p>
        
        <div class="dashboard-widgets-grid">
          <div 
            v-for="widget in category.widgets" 
            :key="widget.id"
            class="dashboard-widgets-widget"
            :class="{ 
              'dashboard-widgets-widget-active': isWidgetActive(widget.id),
              'dashboard-widgets-widget-dragging': draggedWidget?.id === widget.id
            }"
            draggable="true"
            @dragstart="startDrag(widget)"
            @dragend="endDrag"
          >
            <div class="dashboard-widgets-widget-header">
              <div class="dashboard-widgets-widget-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path :d="widget.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
              <div class="dashboard-widgets-widget-toggle">
                <input
                  :id="`widget-${widget.id}`"
                  type="checkbox"
                  :checked="isWidgetActive(widget.id)"
                  @change="toggleWidget(widget.id)"
                  class="dashboard-widgets-widget-checkbox"
                />
                <label :for="`widget-${widget.id}`" class="dashboard-widgets-widget-label">
                  <span class="dashboard-widgets-widget-switch"></span>
                </label>
              </div>
            </div>
            
            <div class="dashboard-widgets-widget-content">
              <h4 class="dashboard-widgets-widget-title">{{ widget.title }}</h4>
              <p class="dashboard-widgets-widget-description">{{ widget.description }}</p>
              
              <div class="dashboard-widgets-widget-preview">
                <div class="dashboard-widgets-preview-content">
                  <div class="dashboard-widgets-preview-chart"></div>
                  <div class="dashboard-widgets-preview-text">{{ widget.previewText }}</div>
                </div>
              </div>
            </div>
            
            <div class="dashboard-widgets-widget-actions">
              <button 
                @click="configureWidget(widget)"
                class="dashboard-widgets-widget-action"
                title="تكوين العنصر"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              
              <button 
                @click="previewWidget(widget)"
                class="dashboard-widgets-widget-action"
                title="معاينة العنصر"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Widgets Layout -->
    <div class="dashboard-widgets-layout">
      <h3 class="dashboard-widgets-layout-title">تخطيط العناصر النشطة</h3>
      <p class="dashboard-widgets-layout-description">اسحب العناصر لترتيبها حسب تفضيلك</p>
      
      <div 
        class="dashboard-widgets-layout-grid"
        @dragover.prevent
        @drop="handleDrop"
      >
        <div 
          v-for="widget in activeWidgets" 
          :key="widget.id"
          class="dashboard-widgets-layout-item"
          :class="{ 'dashboard-widgets-layout-item-dragging': draggedWidget?.id === widget.id }"
          draggable="true"
          @dragstart="startDrag(widget)"
          @dragend="endDrag"
        >
          <div class="dashboard-widgets-layout-item-header">
            <div class="dashboard-widgets-layout-item-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path :d="widget.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <h4 class="dashboard-widgets-layout-item-title">{{ widget.title }}</h4>
            <div class="dashboard-widgets-layout-item-actions">
              <button 
                @click="configureWidget(widget)"
                class="dashboard-widgets-layout-action"
                title="تكوين"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              
              <button 
                @click="removeWidget(widget.id)"
                class="dashboard-widgets-layout-action dashboard-widgets-layout-action-remove"
                title="إزالة"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="dashboard-widgets-layout-item-content">
            <div class="dashboard-widgets-layout-preview">
              <div class="dashboard-widgets-layout-preview-chart"></div>
              <div class="dashboard-widgets-layout-preview-text">{{ widget.previewText }}</div>
            </div>
          </div>
        </div>
        
        <!-- Drop Zone -->
        <div 
          v-if="activeWidgets.length === 0"
          class="dashboard-widgets-drop-zone"
        >
          <svg class="dashboard-widgets-drop-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <p class="dashboard-widgets-drop-text">اسحب العناصر هنا لبدء تخصيص لوحة التحكم</p>
        </div>
      </div>
    </div>

    <!-- Widget Configuration Modal -->
    <div 
      v-if="showConfigModal" 
      class="dashboard-widgets-modal-overlay"
      @click="closeConfigModal"
    >
      <div 
        class="dashboard-widgets-modal"
        @click.stop
      >
        <div class="dashboard-widgets-modal-header">
          <h3 class="dashboard-widgets-modal-title">تكوين العنصر</h3>
          <button 
            @click="closeConfigModal"
            class="dashboard-widgets-modal-close"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="dashboard-widgets-modal-content">
          <div v-if="selectedWidget" class="dashboard-widgets-config-form">
            <div class="dashboard-widgets-config-field">
              <label class="dashboard-widgets-config-label">عنوان العنصر</label>
              <input
                v-model="widgetConfig.title"
                type="text"
                class="dashboard-widgets-config-input"
                placeholder="أدخل عنوان العنصر"
              />
            </div>
            
            <div class="dashboard-widgets-config-field">
              <label class="dashboard-widgets-config-label">حجم العنصر</label>
              <select v-model="widgetConfig.size" class="dashboard-widgets-config-select">
                <option value="small">صغير</option>
                <option value="medium">متوسط</option>
                <option value="large">كبير</option>
                <option value="full">كامل العرض</option>
              </select>
            </div>
            
            <div class="dashboard-widgets-config-field">
              <label class="dashboard-widgets-config-label">الفترة الزمنية</label>
              <select v-model="widgetConfig.timeRange" class="dashboard-widgets-config-select">
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="quarter">هذا الربع</option>
                <option value="year">هذا العام</option>
              </select>
            </div>
            
            <div class="dashboard-widgets-config-field">
              <label class="dashboard-widgets-config-checkbox-label">
                <input
                  v-model="widgetConfig.showTrend"
                  type="checkbox"
                  class="dashboard-widgets-config-checkbox"
                />
                <span class="dashboard-widgets-config-checkbox-text">إظهار الاتجاه</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="dashboard-widgets-modal-footer">
          <button 
            @click="closeConfigModal"
            class="dashboard-widgets-modal-btn dashboard-widgets-modal-btn-cancel"
          >
            إلغاء
          </button>
          <button 
            @click="saveWidgetConfig"
            class="dashboard-widgets-modal-btn dashboard-widgets-modal-btn-save"
          >
            حفظ التكوين
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="dashboard-widgets-loading">
      <div class="dashboard-widgets-loading-spinner"></div>
      <p class="dashboard-widgets-loading-text">جاري تحميل العناصر...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="dashboard-widgets-error">
      <svg class="dashboard-widgets-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="dashboard-widgets-error-text">{{ error }}</p>
      <button @click="loadWidgets" class="dashboard-widgets-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardWidgetsManager } from '@/scripts/reports/dashboardWidgetsManager'

// Use the dashboard widgets manager
const {
  isLoading,
  error,
  isSaving,
  hasChanges,
  widgetCategories,
  activeWidgets,
  draggedWidget,
  showConfigModal,
  selectedWidget,
  widgetConfig,
  loadWidgets,
  toggleWidget,
  configureWidget,
  previewWidget,
  removeWidget,
  saveLayout,
  resetToDefaults,
  startDrag,
  endDrag,
  handleDrop,
  closeConfigModal,
  saveWidgetConfig
} = useDashboardWidgetsManager()

// Computed properties
const isWidgetActive = (widgetId) => {
  return activeWidgets.value.some(widget => widget.id === widgetId)
}

// Lifecycle
onMounted(() => {
  loadWidgets()
})
</script>

<style scoped>
@import '@/assets/css/reports/dashboardWidgets.css';
</style>
