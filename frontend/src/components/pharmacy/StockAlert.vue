<template>
  <div class="stock-alert">
    <div class="alert-header">
      <h3 class="alert-title">تنبيهات المخزون</h3>
      <div class="alert-actions">
        <button @click="stockAlertManager.acknowledgeAllAlerts()" class="btn-acknowledge-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          تأكيد الكل
        </button>
        <button @click="stockAlertManager.clearExpiredAlerts()" class="btn-clear-expired">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          مسح منتهية الصلاحية
        </button>
      </div>
    </div>

    <!-- Alert Statistics -->
    <div class="alert-stats">
      <div class="stat-item critical">
        <span class="stat-icon">⚠️</span>
        <span class="stat-count">{{ stockAlertManager.criticalAlerts.length }}</span>
        <span class="stat-label">حرجة</span>
      </div>
      <div class="stat-item warning">
        <span class="stat-icon">🟡</span>
        <span class="stat-count">{{ stockAlertManager.warningAlerts.length }}</span>
        <span class="stat-label">تحذير</span>
      </div>
      <div class="stat-item info">
        <span class="stat-icon">ℹ️</span>
        <span class="stat-count">{{ stockAlertManager.infoAlerts.length }}</span>
        <span class="stat-label">معلومات</span>
      </div>
    </div>

    <!-- Alert Filters -->
    <div class="alert-filters">
      <div class="filter-group">
        <select v-model="stockAlertManager.severityFilter" class="filter-select">
          <option value="">جميع المستويات</option>
          <option value="critical">حرجة</option>
          <option value="warning">تحذير</option>
          <option value="info">معلومات</option>
        </select>
        <select v-model="stockAlertManager.typeFilter" class="filter-select">
          <option value="">جميع الأنواع</option>
          <option value="low_stock">مخزون منخفض</option>
          <option value="out_of_stock">نفذ المخزون</option>
          <option value="expiring_soon">ينتهي قريباً</option>
          <option value="expired">انتهت الصلاحية</option>
        </select>
        <button @click="stockAlertManager.clearFilters()" class="btn-clear-filters">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          مسح الفلاتر
        </button>
      </div>
    </div>

    <!-- Alerts List -->
    <div class="alerts-container">
      <div v-if="stockAlertManager.filteredAlerts.length === 0" class="no-alerts">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="no-alerts-text">لا توجد تنبيهات</p>
      </div>

      <div v-else class="alerts-list">
        <div 
          v-for="alert in stockAlertManager.paginatedAlerts" 
          :key="alert.id" 
          class="alert-item"
          :class="[
            `alert-${alert.severity}`,
            { 'alert-acknowledged': alert.acknowledged }
          ]"
        >
          <div class="alert-content">
            <div class="alert-header-content">
              <div class="alert-type-icon">
                <span v-if="alert.type === 'low_stock'" class="icon">📉</span>
                <span v-else-if="alert.type === 'out_of_stock'" class="icon">❌</span>
                <span v-else-if="alert.type === 'expiring_soon'" class="icon">⏰</span>
                <span v-else-if="alert.type === 'expired'" class="icon">🚫</span>
                <span v-else class="icon">ℹ️</span>
              </div>
              <div class="alert-info">
                <h4 class="alert-title-text">{{ alert.title }}</h4>
                <p class="alert-message">{{ alert.message }}</p>
                <div class="alert-meta">
                  <span class="alert-item">{{ alert.itemName }}</span>
                  <span class="alert-date">{{ stockAlertManager.formatDate(alert.createdAt) }}</span>
                  <span v-if="alert.daysUntilExpiry" class="alert-expiry">
                    ينتهي خلال {{ alert.daysUntilExpiry }} يوم
                  </span>
                </div>
              </div>
            </div>
            
            <div class="alert-actions">
              <button 
                v-if="!alert.acknowledged"
                @click="stockAlertManager.acknowledgeAlert(alert.id)" 
                class="btn-acknowledge"
                :title="'تأكيد التنبيه'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button 
                @click="stockAlertManager.viewItem(alert.itemId)" 
                class="btn-view-item"
                :title="'عرض العنصر'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <button 
                @click="stockAlertManager.removeAlert(alert.id)" 
                class="btn-remove"
                :title="'حذف التنبيه'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="alert.acknowledged" class="alert-acknowledged-badge">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            تم التأكيد
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="stockAlertManager.totalPages > 1" class="pagination">
        <button 
          @click="stockAlertManager.previousPage()" 
          :disabled="stockAlertManager.currentPage === 1" 
          class="pagination-btn"
        >
          السابق
        </button>
        <span class="pagination-info">
          صفحة {{ stockAlertManager.currentPage }} من {{ stockAlertManager.totalPages }}
        </span>
        <button 
          @click="stockAlertManager.nextPage()" 
          :disabled="stockAlertManager.currentPage === stockAlertManager.totalPages" 
          class="pagination-btn"
        >
          التالي
        </button>
      </div>
    </div>

    <!-- Export Section -->
    <div class="export-section">
      <h4 class="export-title">تصدير التنبيهات</h4>
      <div class="export-actions">
        <button @click="stockAlertManager.exportAlertsToCSV()" class="btn-export-csv">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          تصدير CSV
        </button>
        <button @click="stockAlertManager.exportAlertsToPDF()" class="btn-export-pdf">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          تصدير PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStockAlertManager } from './StockAlert.js'

const stockAlertManager = useStockAlertManager()

onMounted(async () => {
  await stockAlertManager.initializeData()
})
</script>

<style scoped>
@import './StockAlert.css';
</style>
