<template>
  <div class="inventory-chart">
    <div class="chart-header">
      <h3 class="chart-title">تحليلات المخزون</h3>
      <div class="chart-controls">
        <select v-model="inventoryChartManager.chartType" class="chart-type-select">
          <option value="stock-levels">مستويات المخزون</option>
          <option value="category-breakdown">توزيع الفئات</option>
          <option value="supplier-analysis">تحليل الموردين</option>
          <option value="expiry-timeline">جدول انتهاء الصلاحية</option>
          <option value="stock-movements">حركة المخزون</option>
        </select>
        <select v-model="inventoryChartManager.timeRange" class="time-range-select">
          <option value="7">آخر 7 أيام</option>
          <option value="30">آخر 30 يوم</option>
          <option value="90">آخر 3 أشهر</option>
          <option value="365">آخر سنة</option>
        </select>
        <button @click="inventoryChartManager.refreshChart()" class="btn-refresh">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Chart Statistics -->
    <div class="chart-stats">
      <div class="stat-card total-value">
        <div class="stat-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4 class="stat-value">{{ inventoryChartManager.totalValue }}</h4>
          <p class="stat-label">إجمالي قيمة المخزون</p>
        </div>
      </div>

      <div class="stat-card total-items">
        <div class="stat-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4 class="stat-value">{{ inventoryChartManager.totalItems }}</h4>
          <p class="stat-label">إجمالي العناصر</p>
        </div>
      </div>

      <div class="stat-card low-stock">
        <div class="stat-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4 class="stat-value">{{ inventoryChartManager.lowStockItems }}</h4>
          <p class="stat-label">عناصر منخفضة المخزون</p>
        </div>
      </div>

      <div class="stat-card expiring-soon">
        <div class="stat-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4 class="stat-value">{{ inventoryChartManager.expiringSoonItems }}</h4>
          <p class="stat-label">تنتهي صلاحيتها قريباً</p>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="chart-container">
      <div v-if="inventoryChartManager.loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">جاري تحميل الرسم البياني...</p>
      </div>

      <div v-else-if="inventoryChartManager.error" class="chart-error">
        <svg class="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="error-text">{{ inventoryChartManager.error }}</p>
        <button @click="inventoryChartManager.refreshChart()" class="btn-retry">
          إعادة المحاولة
        </button>
      </div>

      <div v-else class="chart-content">
        <!-- Stock Levels Chart -->
        <div v-if="inventoryChartManager.chartType === 'stock-levels'" class="chart-section">
          <h4 class="chart-section-title">مستويات المخزون</h4>
          <div class="chart-canvas">
            <canvas ref="stockLevelsCanvas" width="800" height="400"></canvas>
          </div>
        </div>

        <!-- Category Breakdown Chart -->
        <div v-if="inventoryChartManager.chartType === 'category-breakdown'" class="chart-section">
          <h4 class="chart-section-title">توزيع الفئات</h4>
          <div class="chart-canvas">
            <canvas ref="categoryBreakdownCanvas" width="800" height="400"></canvas>
          </div>
        </div>

        <!-- Supplier Analysis Chart -->
        <div v-if="inventoryChartManager.chartType === 'supplier-analysis'" class="chart-section">
          <h4 class="chart-section-title">تحليل الموردين</h4>
          <div class="chart-canvas">
            <canvas ref="supplierAnalysisCanvas" width="800" height="400"></canvas>
          </div>
        </div>

        <!-- Expiry Timeline Chart -->
        <div v-if="inventoryChartManager.chartType === 'expiry-timeline'" class="chart-section">
          <h4 class="chart-section-title">جدول انتهاء الصلاحية</h4>
          <div class="chart-canvas">
            <canvas ref="expiryTimelineCanvas" width="800" height="400"></canvas>
          </div>
        </div>

        <!-- Stock Movements Chart -->
        <div v-if="inventoryChartManager.chartType === 'stock-movements'" class="chart-section">
          <h4 class="chart-section-title">حركة المخزون</h4>
          <div class="chart-canvas">
            <canvas ref="stockMovementsCanvas" width="800" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Legend -->
    <div v-if="inventoryChartManager.showLegend" class="chart-legend">
      <h4 class="legend-title">مفتاح الرسم البياني</h4>
      <div class="legend-items">
        <div v-for="item in inventoryChartManager.legendItems" :key="item.label" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="export-options">
      <h4 class="export-title">خيارات التصدير</h4>
      <div class="export-buttons">
        <button @click="inventoryChartManager.exportChartAsImage()" class="btn-export-image">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          تصدير كصورة
        </button>
        <button @click="inventoryChartManager.exportChartData()" class="btn-export-data">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          تصدير البيانات
        </button>
        <button @click="inventoryChartManager.printChart()" class="btn-print-chart">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          طباعة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useInventoryChartManager } from './InventoryChart.js'

const inventoryChartManager = useInventoryChartManager()

onMounted(async () => {
  await inventoryChartManager.initializeChart()
})

onUnmounted(() => {
  inventoryChartManager.cleanup()
})
</script>

<style scoped>
@import './InventoryChart.css';
</style>
