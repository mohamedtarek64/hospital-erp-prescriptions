<template>
  <div class="ward-dashboard">
    <!-- Header -->
    <div class="ward-dashboard-header">
      <div class="ward-dashboard-title">
        <h1 class="ward-dashboard-title-text">إدارة الأجنحة والأسرة</h1>
        <p class="ward-dashboard-title-description">إدارة شاملة للأجنحة والغرف والأسرة في المستشفى</p>
      </div>
      <div class="ward-dashboard-actions">
        <button 
          class="ward-dashboard-action-btn ward-dashboard-action-btn-primary"
          @click="openWardForm"
        >
          <svg class="ward-dashboard-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إضافة جناح جديد
        </button>
        <button 
          class="ward-dashboard-action-btn ward-dashboard-action-btn-secondary"
          @click="refreshData"
        >
          <svg class="ward-dashboard-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          تحديث
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="ward-dashboard-stats">
      <div class="ward-dashboard-stat-card">
        <div class="ward-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <div class="ward-dashboard-stat-card-content">
          <h3 class="ward-dashboard-stat-card-title">إجمالي الأجنحة</h3>
          <p class="ward-dashboard-stat-card-value">{{ statistics?.total_wards || 0 }}</p>
        </div>
      </div>

      <div class="ward-dashboard-stat-card">
        <div class="ward-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          </svg>
        </div>
        <div class="ward-dashboard-stat-card-content">
          <h3 class="ward-dashboard-stat-card-title">إجمالي الغرف</h3>
          <p class="ward-dashboard-stat-card-value">{{ statistics?.total_rooms || 0 }}</p>
        </div>
      </div>

      <div class="ward-dashboard-stat-card">
        <div class="ward-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        </div>
        <div class="ward-dashboard-stat-card-content">
          <h3 class="ward-dashboard-stat-card-title">إجمالي الأسرة</h3>
          <p class="ward-dashboard-stat-card-value">{{ statistics?.total_beds || 0 }}</p>
        </div>
      </div>

      <div class="ward-dashboard-stat-card">
        <div class="ward-dashboard-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="ward-dashboard-stat-card-content">
          <h3 class="ward-dashboard-stat-card-title">معدل الإشغال</h3>
          <p class="ward-dashboard-stat-card-value">{{ statistics?.occupancy_rate || 0 }}%</p>
        </div>
      </div>
    </div>

    <!-- Wards Grid -->
    <div class="ward-dashboard-wards">
      <div class="ward-dashboard-wards-header">
        <h2 class="ward-dashboard-wards-title">الأجنحة</h2>
        <div class="ward-dashboard-wards-filters">
          <select v-model="selectedWardType" @change="filterWards" class="ward-dashboard-filter-select">
            <option value="">جميع الأنواع</option>
            <option value="general">عام</option>
            <option value="ICU">عناية مركزة</option>
            <option value="pediatric">أطفال</option>
            <option value="maternity">ولادة</option>
            <option value="surgical">جراحة</option>
          </select>
          <select v-model="selectedFloor" @change="filterWards" class="ward-dashboard-filter-select">
            <option value="">جميع الطوابق</option>
            <option v-for="floor in floors" :key="floor" :value="floor">الطابق {{ floor }}</option>
          </select>
        </div>
      </div>

      <div class="ward-dashboard-wards-grid">
        <div 
          v-for="ward in filteredWards" 
          :key="ward.id" 
          class="ward-dashboard-ward-card"
          @click="viewWardDetails(ward)"
        >
          <div class="ward-dashboard-ward-card-header">
            <h3 class="ward-dashboard-ward-card-title">{{ ward.name }}</h3>
            <span class="ward-dashboard-ward-card-type" :class="`ward-type-${ward.type}`">
              {{ getWardTypeName(ward.type) }}
            </span>
          </div>
          
          <div class="ward-dashboard-ward-card-content">
            <div class="ward-dashboard-ward-card-info">
              <div class="ward-dashboard-ward-card-info-item">
                <svg class="ward-dashboard-ward-card-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>الطابق {{ ward.floor }}</span>
              </div>
              <div class="ward-dashboard-ward-card-info-item">
                <svg class="ward-dashboard-ward-card-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>{{ ward.head_nurse?.name || 'غير محدد' }}</span>
              </div>
            </div>

            <div class="ward-dashboard-ward-card-stats">
              <div class="ward-dashboard-ward-card-stat">
                <span class="ward-dashboard-ward-card-stat-label">السعة</span>
                <span class="ward-dashboard-ward-card-stat-value">{{ ward.capacity }}</span>
              </div>
              <div class="ward-dashboard-ward-card-stat">
                <span class="ward-dashboard-ward-card-stat-label">الإشغال</span>
                <span class="ward-dashboard-ward-card-stat-value">{{ ward.occupancy_rate || 0 }}%</span>
              </div>
            </div>

            <div class="ward-dashboard-ward-card-status">
              <span class="ward-dashboard-ward-card-status-badge" :class="`status-${ward.status}`">
                {{ getWardStatusName(ward.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="ward-dashboard-loading">
      <div class="ward-dashboard-loading-spinner"></div>
      <p class="ward-dashboard-loading-text">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="ward-dashboard-error">
      <div class="ward-dashboard-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="ward-dashboard-error-title">خطأ في تحميل البيانات</h3>
      <p class="ward-dashboard-error-message">{{ error }}</p>
      <button @click="refreshData" class="ward-dashboard-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWardDashboard } from '@/scripts/ward-management/wardDashboard'

// Get ward dashboard functionality
const {
  loading,
  error,
  statistics,
  // wards,
  filteredWards,
  selectedWardType,
  selectedFloor,
  floors,
  // loadDashboardData,
  filterWards,
  refreshData,
  openWardForm,
  viewWardDetails,
  getWardTypeName,
  getWardStatusName,
  onMountedHandler
} = useWardDashboard()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/ward-management/wardDashboard.css';
</style>
