<template>
  <div class="medical-records-container">
    <!-- Header Section -->
    <div class="medical-records-header">
      <div class="header-content">
        <h1 class="header-title">السجلات الطبية</h1>
        <p class="header-description">إدارة وتتبع جميع السجلات الطبية للمرضى</p>
      </div>
      
      <div class="header-actions">
        <button 
          @click="showCreateModal = true"
          class="create-btn"
        >
          <svg class="create-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          إنشاء سجل طبي جديد
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="البحث في السجلات الطبية..."
          class="search-input"
          @input="handleSearch"
        />
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <div class="filters-section">
        <select v-model="statusFilter" @change="applyFilters" class="filter-select">
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>

        <input
          v-model="dateFromFilter"
          type="date"
          class="filter-date"
          @change="applyFilters"
        />

        <input
          v-model="dateToFilter"
          type="date"
          class="filter-date"
          @change="applyFilters"
        />

        <button @click="clearFilters" class="clear-filters-btn">
          مسح الفلاتر
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="statistics-section">
      <div class="stat-card">
        <div class="stat-icon stat-icon-total">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalRecords }}</div>
          <div class="stat-label">إجمالي السجلات</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-active">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.activeRecords }}</div>
          <div class="stat-label">السجلات النشطة</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-completed">🏁</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.completedRecords }}</div>
          <div class="stat-label">السجلات المكتملة</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-followup">⏰</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.followUpDue }}</div>
          <div class="stat-label">تحتاج متابعة</div>
        </div>
      </div>
    </div>

    <!-- Medical Records List -->
    <div class="medical-records-list">
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">جاري تحميل السجلات الطبية...</p>
      </div>

      <div v-else-if="medicalRecords.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">لا توجد سجلات طبية</h3>
        <p class="empty-description">ابدأ بإنشاء أول سجل طبي جديد</p>
        <button @click="showCreateModal = true" class="empty-action-btn">
          إنشاء سجل طبي
        </button>
      </div>

      <div v-else class="records-grid">
        <MedicalRecordCard
          v-for="record in medicalRecords"
          :key="record.id"
          :record="record"
          @view="viewRecord"
          @edit="editRecord"
          @delete="deleteRecord"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="pagination-section">
      <div class="pagination-info">
        عرض {{ pagination.from }}-{{ pagination.to }} من {{ pagination.total }} سجل
      </div>
      
      <div class="pagination-controls">
        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="pagination-btn"
        >
          السابق
        </button>

        <span class="pagination-current">{{ pagination.current_page }}</span>

        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="pagination-btn"
        >
          التالي
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <MedicalRecordModal
      v-if="showCreateModal || showEditModal"
      :record="editingRecord"
      :mode="showCreateModal ? 'create' : 'edit'"
      @close="closeModal"
      @saved="handleRecordSaved"
    />

    <!-- View Modal -->
    <MedicalRecordViewModal
      v-if="showViewModal"
      :record="viewingRecord"
      @close="closeViewModal"
      @edit="editRecord"
    />
  </div>
</template>

<script setup>
import MedicalRecordCard from '@/components/medical-records/MedicalRecordCard.vue'
import MedicalRecordModal from '@/components/medical-records/MedicalRecordModal.vue'
import MedicalRecordViewModal from '@/components/medical-records/MedicalRecordViewModal.vue'
import { useMedicalRecordsList } from '@/scripts/medical-records/medicalRecordsList.js'

// Use composable
const {
  loading,
  searchQuery,
  statusFilter,
  dateFromFilter,
  dateToFilter,
  showCreateModal,
  showEditModal,
  showViewModal,
  editingRecord,
  viewingRecord,
  medicalRecords,
  pagination,
  statistics,
  handleSearch,
  applyFilters,
  clearFilters,
  changePage,
  viewRecord,
  editRecord,
  deleteRecord,
  closeModal,
  closeViewModal,
  handleRecordSaved
} = useMedicalRecordsList()
</script>

<style scoped>
@import '@/assets/css/medical-records.css';
</style>
