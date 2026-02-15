<template>
  <div class="bed-allocation">
    <!-- Header -->
    <div class="bed-allocation-header">
      <div class="bed-allocation-header-content">
        <div class="bed-allocation-header-left">
          <button @click="$router.go(-1)" class="bed-allocation-back-btn">
            <svg class="bed-allocation-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            رجوع
          </button>
          <div class="bed-allocation-title-section">
            <h1 class="bed-allocation-title">تخصيص الأسرة</h1>
            <p class="bed-allocation-subtitle">إدارة تخصيص الأسرة للمرضى</p>
          </div>
        </div>
        <div class="bed-allocation-header-right">
          <button @click="refreshData" class="bed-allocation-refresh-btn">
            <svg class="bed-allocation-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تحديث
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bed-allocation-filters">
      <div class="bed-allocation-filters-content">
        <div class="bed-allocation-filter-group">
          <label class="bed-allocation-filter-label">الجناح</label>
          <select v-model="selectedWard" @change="filterBeds" class="bed-allocation-filter-select">
            <option value="">جميع الأجنحة</option>
            <option v-for="ward in wards" :key="ward.id" :value="ward.id">
              {{ ward.name }}
            </option>
          </select>
        </div>

        <div class="bed-allocation-filter-group">
          <label class="bed-allocation-filter-label">نوع الغرفة</label>
          <select v-model="selectedRoomType" @change="filterBeds" class="bed-allocation-filter-select">
            <option value="">جميع الأنواع</option>
            <option value="single">فردي</option>
            <option value="double">مزدوج</option>
            <option value="triple">ثلاثي</option>
            <option value="private">خاص</option>
            <option value="semi-private">شبه خاص</option>
          </select>
        </div>

        <div class="bed-allocation-filter-group">
          <label class="bed-allocation-filter-label">نوع السرير</label>
          <select v-model="selectedBedType" @change="filterBeds" class="bed-allocation-filter-select">
            <option value="">جميع الأنواع</option>
            <option value="standard">عادي</option>
            <option value="electric">كهربائي</option>
            <option value="bariatric">بدانة</option>
            <option value="pediatric">أطفال</option>
          </select>
        </div>

        <div class="bed-allocation-filter-group">
          <label class="bed-allocation-filter-label">الحالة</label>
          <select v-model="selectedStatus" @change="filterBeds" class="bed-allocation-filter-select">
            <option value="">جميع الحالات</option>
            <option value="available">متاح</option>
            <option value="occupied">مشغول</option>
            <option value="maintenance">صيانة</option>
            <option value="cleaning">تنظيف</option>
          </select>
        </div>

        <div class="bed-allocation-filter-group">
          <label class="bed-allocation-filter-label">البحث</label>
          <input 
            v-model="searchQuery" 
            @input="filterBeds" 
            type="text" 
            placeholder="البحث في الأسرة..."
            class="bed-allocation-filter-input"
          >
        </div>
      </div>
    </div>

    <!-- Bed Statistics -->
    <div class="bed-allocation-stats">
      <div class="bed-allocation-stat-card">
        <div class="bed-allocation-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        </div>
        <div class="bed-allocation-stat-card-content">
          <h3 class="bed-allocation-stat-card-title">إجمالي الأسرة</h3>
          <p class="bed-allocation-stat-card-value">{{ bedStatistics?.total_beds || 0 }}</p>
        </div>
      </div>

      <div class="bed-allocation-stat-card">
        <div class="bed-allocation-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="bed-allocation-stat-card-content">
          <h3 class="bed-allocation-stat-card-title">الأسرة المتاحة</h3>
          <p class="bed-allocation-stat-card-value">{{ bedStatistics?.available_beds || 0 }}</p>
        </div>
      </div>

      <div class="bed-allocation-stat-card">
        <div class="bed-allocation-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="bed-allocation-stat-card-content">
          <h3 class="bed-allocation-stat-card-title">الأسرة المشغولة</h3>
          <p class="bed-allocation-stat-card-value">{{ bedStatistics?.occupied_beds || 0 }}</p>
        </div>
      </div>

      <div class="bed-allocation-stat-card">
        <div class="bed-allocation-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="bed-allocation-stat-card-content">
          <h3 class="bed-allocation-stat-card-title">تحتاج صيانة</h3>
          <p class="bed-allocation-stat-card-value">{{ bedStatistics?.maintenance_required || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Beds Grid -->
    <div class="bed-allocation-beds">
      <div class="bed-allocation-beds-header">
        <h2 class="bed-allocation-beds-title">الأسرة</h2>
        <div class="bed-allocation-beds-actions">
          <button @click="addBed" class="bed-allocation-add-bed-btn">
            <svg class="bed-allocation-add-bed-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            إضافة سرير
          </button>
          <select v-model="viewMode" class="bed-allocation-view-select">
            <option value="grid">عرض شبكي</option>
            <option value="list">عرض قائمة</option>
          </select>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="bed-allocation-beds-grid">
        <div 
          v-for="bed in filteredBeds" 
          :key="bed.id" 
          class="bed-allocation-bed-card"
          :class="`bed-status-${bed.status}`"
          @click="viewBedDetails(bed)"
        >
          <div class="bed-allocation-bed-card-header">
            <h3 class="bed-allocation-bed-card-title">سرير {{ bed.bed_number }}</h3>
            <span class="bed-allocation-bed-card-type" :class="`bed-type-${bed.bed_type}`">
              {{ getBedTypeName(bed.bed_type) }}
            </span>
          </div>

          <div class="bed-allocation-bed-card-content">
            <div class="bed-allocation-bed-card-info">
              <div class="bed-allocation-bed-card-info-item">
                <svg class="bed-allocation-bed-card-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>{{ bed.room?.ward?.name || 'غير محدد' }}</span>
              </div>
              <div class="bed-allocation-bed-card-info-item">
                <svg class="bed-allocation-bed-card-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                </svg>
                <span>غرفة {{ bed.room?.room_number || 'غير محدد' }}</span>
              </div>
            </div>

            <div v-if="bed.current_admission" class="bed-allocation-bed-card-patient">
              <div class="bed-allocation-bed-card-patient-info">
                <h4 class="bed-allocation-bed-card-patient-name">
                  {{ bed.current_admission.patient?.name || 'مريض' }}
                </h4>
                <p class="bed-allocation-bed-card-patient-details">
                  تاريخ الدخول: {{ formatDate(bed.current_admission.admission_date) }}
                </p>
              </div>
            </div>

            <div class="bed-allocation-bed-card-status">
              <span class="bed-allocation-bed-card-status-badge" :class="`status-${bed.status}`">
                {{ getBedStatusName(bed.status) }}
              </span>
            </div>

            <div v-if="bed.needs_maintenance" class="bed-allocation-bed-card-maintenance">
              <svg class="bed-allocation-bed-card-maintenance-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span>يحتاج صيانة</span>
            </div>
          </div>

          <div class="bed-allocation-bed-card-actions">
            <button @click.stop="editBed(bed)" class="bed-allocation-bed-action-btn">
              تعديل
            </button>
            <button @click.stop="viewBedHistory(bed)" class="bed-allocation-bed-action-btn">
              التاريخ
            </button>
            <button v-if="bed.status === 'available'" @click.stop="allocateBed(bed)" class="bed-allocation-bed-action-btn bed-allocation-bed-action-btn-primary">
              تخصيص
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bed-allocation-beds-list">
        <div class="bed-allocation-beds-list-header">
          <div class="bed-allocation-beds-list-header-item">رقم السرير</div>
          <div class="bed-allocation-beds-list-header-item">الجناح</div>
          <div class="bed-allocation-beds-list-header-item">الغرفة</div>
          <div class="bed-allocation-beds-list-header-item">نوع السرير</div>
          <div class="bed-allocation-beds-list-header-item">الحالة</div>
          <div class="bed-allocation-beds-list-header-item">المريض</div>
          <div class="bed-allocation-beds-list-header-item">الإجراءات</div>
        </div>
        <div 
          v-for="bed in filteredBeds" 
          :key="bed.id" 
          class="bed-allocation-beds-list-item"
        >
          <div class="bed-allocation-beds-list-item-cell">{{ bed.bed_number }}</div>
          <div class="bed-allocation-beds-list-item-cell">{{ bed.room?.ward?.name || 'غير محدد' }}</div>
          <div class="bed-allocation-beds-list-item-cell">{{ bed.room?.room_number || 'غير محدد' }}</div>
          <div class="bed-allocation-beds-list-item-cell">{{ getBedTypeName(bed.bed_type) }}</div>
          <div class="bed-allocation-beds-list-item-cell">
            <span class="bed-allocation-bed-status-badge" :class="`status-${bed.status}`">
              {{ getBedStatusName(bed.status) }}
            </span>
          </div>
          <div class="bed-allocation-beds-list-item-cell">
            {{ bed.current_admission?.patient?.name || 'غير محدد' }}
          </div>
          <div class="bed-allocation-beds-list-item-cell">
            <button @click="editBed(bed)" class="bed-allocation-action-btn">
              تعديل
            </button>
            <button @click="viewBedHistory(bed)" class="bed-allocation-action-btn">
              التاريخ
            </button>
            <button v-if="bed.status === 'available'" @click="allocateBed(bed)" class="bed-allocation-action-btn bed-allocation-action-btn-primary">
              تخصيص
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bed-allocation-loading">
      <div class="bed-allocation-loading-spinner"></div>
      <p class="bed-allocation-loading-text">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bed-allocation-error">
      <div class="bed-allocation-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="bed-allocation-error-title">خطأ في تحميل البيانات</h3>
      <p class="bed-allocation-error-message">{{ error }}</p>
      <button @click="refreshData" class="bed-allocation-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBedAllocation } from '@/scripts/ward-management/bedAllocation'

// Get bed allocation functionality
const {
  loading,
  error,
  wards,
  bedStatistics,
  filteredBeds,
  selectedWard,
  selectedRoomType,
  selectedBedType,
  selectedStatus,
  searchQuery,
  viewMode,
  loadBedData,
  filterBeds,
  refreshData,
  addBed,
  editBed,
  viewBedDetails,
  viewBedHistory,
  allocateBed,
  getBedTypeName,
  getBedStatusName,
  formatDate
} = useBedAllocation()

// Lifecycle
onMounted(() => {
  loadBedData()
})
</script>

<style scoped>
@import '@/assets/css/ward-management/bed-allocation.css';
</style>
