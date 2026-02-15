<template>
  <div class="ward-layout">
    <!-- Header -->
    <div class="ward-layout-header">
      <div class="ward-layout-header-content">
        <div class="ward-layout-header-left">
          <button @click="$router.go(-1)" class="ward-layout-back-btn">
            <svg class="ward-layout-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            رجوع
          </button>
          <div class="ward-layout-title-section">
            <h1 class="ward-layout-title">{{ ward?.name || 'جناح' }}</h1>
            <p class="ward-layout-subtitle">{{ ward?.description || 'عرض تفاصيل الجناح' }}</p>
          </div>
        </div>
        <div class="ward-layout-header-right">
          <div class="ward-layout-ward-info">
            <span class="ward-layout-ward-type" :class="`ward-type-${ward?.type}`">
              {{ getWardTypeName(ward?.type) }}
            </span>
            <span class="ward-layout-ward-floor">الطابق {{ ward?.floor }}</span>
          </div>
          <button @click="refreshData" class="ward-layout-refresh-btn">
            <svg class="ward-layout-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تحديث
          </button>
        </div>
      </div>
    </div>

    <!-- Ward Statistics -->
    <div class="ward-layout-stats">
      <div class="ward-layout-stat-card">
        <div class="ward-layout-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          </svg>
        </div>
        <div class="ward-layout-stat-card-content">
          <h3 class="ward-layout-stat-card-title">إجمالي الغرف</h3>
          <p class="ward-layout-stat-card-value">{{ wardStatistics?.total_rooms || 0 }}</p>
        </div>
      </div>

      <div class="ward-layout-stat-card">
        <div class="ward-layout-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        </div>
        <div class="ward-layout-stat-card-content">
          <h3 class="ward-layout-stat-card-title">إجمالي الأسرة</h3>
          <p class="ward-layout-stat-card-value">{{ wardStatistics?.total_beds || 0 }}</p>
        </div>
      </div>

      <div class="ward-layout-stat-card">
        <div class="ward-layout-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="ward-layout-stat-card-content">
          <h3 class="ward-layout-stat-card-title">الأسرة المشغولة</h3>
          <p class="ward-layout-stat-card-value">{{ wardStatistics?.occupied_beds || 0 }}</p>
        </div>
      </div>

      <div class="ward-layout-stat-card">
        <div class="ward-layout-stat-card-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="ward-layout-stat-card-content">
          <h3 class="ward-layout-stat-card-title">معدل الإشغال</h3>
          <p class="ward-layout-stat-card-value">{{ wardStatistics?.occupancy_rate || 0 }}%</p>
        </div>
      </div>
    </div>

    <!-- Room Layout -->
    <div class="ward-layout-rooms">
      <div class="ward-layout-rooms-header">
        <h2 class="ward-layout-rooms-title">تخطيط الغرف</h2>
        <div class="ward-layout-rooms-actions">
          <button @click="addRoom" class="ward-layout-add-room-btn">
            <svg class="ward-layout-add-room-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            إضافة غرفة
          </button>
          <select v-model="viewMode" class="ward-layout-view-select">
            <option value="grid">عرض شبكي</option>
            <option value="list">عرض قائمة</option>
          </select>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="ward-layout-rooms-grid">
        <div 
          v-for="room in rooms" 
          :key="room.id" 
          class="ward-layout-room-card"
          @click="viewRoomDetails(room)"
        >
          <div class="ward-layout-room-card-header">
            <h3 class="ward-layout-room-card-title">غرفة {{ room.room_number }}</h3>
            <span class="ward-layout-room-card-type" :class="`room-type-${room.room_type}`">
              {{ getRoomTypeName(room.room_type) }}
            </span>
          </div>

          <div class="ward-layout-room-card-content">
            <div class="ward-layout-room-card-beds">
              <div 
                v-for="bed in room.beds" 
                :key="bed.id" 
                class="ward-layout-bed-item"
                :class="`bed-status-${bed.status}`"
                @click.stop="viewBedDetails(bed)"
              >
                <div class="ward-layout-bed-number">{{ bed.bed_number }}</div>
                <div class="ward-layout-bed-status">{{ getBedStatusName(bed.status) }}</div>
                <div v-if="bed.current_admission" class="ward-layout-bed-patient">
                  {{ bed.current_admission.patient?.name || 'مريض' }}
                </div>
              </div>
            </div>

            <div class="ward-layout-room-card-stats">
              <div class="ward-layout-room-card-stat">
                <span class="ward-layout-room-card-stat-label">السعة</span>
                <span class="ward-layout-room-card-stat-value">{{ room.capacity }}</span>
              </div>
              <div class="ward-layout-room-card-stat">
                <span class="ward-layout-room-card-stat-label">الإشغال</span>
                <span class="ward-layout-room-card-stat-value">{{ room.occupancy_rate || 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="ward-layout-rooms-list">
        <div class="ward-layout-rooms-list-header">
          <div class="ward-layout-rooms-list-header-item">رقم الغرفة</div>
          <div class="ward-layout-rooms-list-header-item">نوع الغرفة</div>
          <div class="ward-layout-rooms-list-header-item">السعة</div>
          <div class="ward-layout-rooms-list-header-item">الإشغال</div>
          <div class="ward-layout-rooms-list-header-item">الحالة</div>
          <div class="ward-layout-rooms-list-header-item">الإجراءات</div>
        </div>
        <div 
          v-for="room in rooms" 
          :key="room.id" 
          class="ward-layout-rooms-list-item"
        >
          <div class="ward-layout-rooms-list-item-cell">{{ room.room_number }}</div>
          <div class="ward-layout-rooms-list-item-cell">{{ getRoomTypeName(room.room_type) }}</div>
          <div class="ward-layout-rooms-list-item-cell">{{ room.capacity }}</div>
          <div class="ward-layout-rooms-list-item-cell">{{ room.occupancy_rate || 0 }}%</div>
          <div class="ward-layout-rooms-list-item-cell">
            <span class="ward-layout-room-status-badge" :class="`status-${room.status}`">
              {{ getRoomStatusName(room.status) }}
            </span>
          </div>
          <div class="ward-layout-rooms-list-item-cell">
            <button @click="viewRoomDetails(room)" class="ward-layout-action-btn">
              عرض
            </button>
            <button @click="editRoom(room)" class="ward-layout-action-btn">
              تعديل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="ward-layout-loading">
      <div class="ward-layout-loading-spinner"></div>
      <p class="ward-layout-loading-text">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="ward-layout-error">
      <div class="ward-layout-error-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="ward-layout-error-title">خطأ في تحميل البيانات</h3>
      <p class="ward-layout-error-message">{{ error }}</p>
      <button @click="refreshData" class="ward-layout-error-retry-btn">
        إعادة المحاولة
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWardLayout } from '@/scripts/ward-management/wardLayout'

// Get route parameters
const route = useRoute()
const wardId = route.params.id

// Get ward layout functionality
const {
  loading,
  error,
  ward,
  wardStatistics,
  rooms,
  viewMode,
  loadWardData,
  refreshData,
  addRoom,
  viewRoomDetails,
  editRoom,
  viewBedDetails,
  getWardTypeName,
  getRoomTypeName,
  getRoomStatusName,
  getBedStatusName
} = useWardLayout(wardId)

// Lifecycle
onMounted(() => {
  loadWardData()
})
</script>

<style scoped>
@import '@/assets/css/ward-management/ward-layout.css';
</style>
