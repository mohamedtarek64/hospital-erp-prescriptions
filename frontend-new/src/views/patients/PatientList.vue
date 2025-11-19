<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="patients-header">
      <div class="patients-header-content">
        <div class="patients-header-inner">
          <div class="flex items-center">
            <h1 class="patients-title">إدارة المرضى</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/patients/create"
              class="add-patient-btn"
            >
              <svg class="add-patient-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              إضافة مريض جديد
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Search and Filters -->
      <div class="px-4 py-6 sm:px-0">
        <div class="filters-container">
          <div class="filters-content">
            <div class="filters-grid">
              <!-- Search -->
              <div class="filter-group">
                <label for="search" class="filter-label">البحث</label>
                <div class="search-container">
                  <input
                    id="search"
                    v-model="searchQuery"
                    type="text"
                    placeholder="اسم المريض، بريد، هاتف..."
                    class="filter-input"
                    @input="handleSearch"
                  />
                  <div class="search-icon">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Gender Filter -->
              <div class="filter-group">
                <label for="gender" class="filter-label">الجنس</label>
                <select
                  id="gender"
                  v-model="genderFilter"
                  class="filter-select"
                  @change="handleFilterChange"
                >
                  <option value="">الكل</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                  <option value="other">آخر</option>
                </select>
              </div>

              <!-- Blood Group Filter -->
              <div class="filter-group">
                <label for="blood_group" class="filter-label">فصيلة الدم</label>
                <select
                  id="blood_group"
                  v-model="bloodGroupFilter"
                  class="filter-select"
                  @change="handleFilterChange"
                >
                  <option value="">الكل</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <div class="flex items-end">
                <button
                  @click="clearFilters"
                  class="clear-filters-btn"
                >
                  <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patients List -->
      <div class="px-4 py-6 sm:px-0">
        <div class="patients-list-container">
          <div class="patients-list-content">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="loading-text">جاري التحميل...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
              <div class="error-message">{{ error }}</div>
              <button
                @click="fetchPatients"
                class="retry-btn"
              >
                إعادة المحاولة
              </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="!hasPatients" class="empty-container">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h3 class="empty-title">لا يوجد مرضى</h3>
              <p class="empty-description">ابدأ بإضافة مريض جديد</p>
              <div class="empty-action">
                <router-link
                  to="/patients/create"
                  class="add-patient-btn"
                >
                  إضافة مريض جديد
                </router-link>
              </div>
            </div>

            <!-- Patients Table -->
            <div v-else class="overflow-x-auto">
              <table class="patients-table">
                <thead class="patients-table-header">
                  <tr>
                    <th class="patients-table-header-cell">المريض</th>
                    <th class="patients-table-header-cell">معلومات الاتصال</th>
                    <th class="patients-table-header-cell">المعلومات الشخصية</th>
                    <th class="patients-table-header-cell">الطوارئ</th>
                    <th class="patients-table-header-cell">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="patient in patients" :key="patient.id" class="patients-table-row">
                    <td class="patients-table-cell">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="patient-avatar">
                            <span class="patient-avatar-text">
                              {{ patient.first_name.charAt(0) }}{{ patient.last_name.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div class="mr-4">
                          <div class="patient-name">
                            {{ patient.first_name }} {{ patient.last_name }}
                          </div>
                          <div class="patient-id">ID: {{ patient.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="patients-table-cell">
                      <div class="patient-email">{{ patient.email || 'غير محدد' }}</div>
                      <div class="patient-phone">{{ patient.phone || 'غير محدد' }}</div>
                    </td>
                    <td class="patients-table-cell">
                      <div class="patient-dob">
                        {{ patient.date_of_birth ? formatDate(patient.date_of_birth) : 'غير محدد' }}
                      </div>
                      <div class="patient-gender">
                        {{ getGenderText(patient.gender) }} | {{ patient.blood_group || 'غير محدد' }}
                      </div>
                    </td>
                    <td class="patients-table-cell">
                      <div class="patient-emergency-name">{{ patient.emergency_contact_name || 'غير محدد' }}</div>
                      <div class="patient-emergency-phone">{{ patient.emergency_contact || 'غير محدد' }}</div>
                    </td>
                    <td class="patients-table-cell text-sm font-medium">
                      <div class="action-buttons">
                        <router-link
                          :to="`/patients/${patient.id}`"
                          class="view-btn"
                        >
                          عرض
                        </router-link>
                        <router-link
                          :to="`/patients/${patient.id}/edit`"
                          class="edit-btn"
                        >
                          تعديل
                        </router-link>
                        <button
                          @click="confirmDelete(patient)"
                          class="delete-btn"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="hasPatients && pagination.last_page > 1" class="pagination-container">
              <div class="pagination-mobile">
                <button
                  @click="changePage(pagination.current_page - 1)"
                  :disabled="pagination.current_page === 1"
                  class="pagination-btn pagination-btn-prev"
                >
                  السابق
                </button>
                <button
                  @click="changePage(pagination.current_page + 1)"
                  :disabled="pagination.current_page === pagination.last_page"
                  class="pagination-btn pagination-btn-next"
                >
                  التالي
                </button>
              </div>
              <div class="pagination-desktop">
                <div>
                  <p class="pagination-info">
                    عرض
                    <span class="font-medium">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
                    إلى
                    <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
                    من
                    <span class="font-medium">{{ pagination.total }}</span>
                    نتيجة
                  </p>
                </div>
                <div>
                  <nav class="pagination-nav">
                    <button
                      @click="changePage(pagination.current_page - 1)"
                      :disabled="pagination.current_page === 1"
                      class="pagination-btn pagination-btn-prev"
                    >
                      <span class="sr-only">السابق</span>
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    
                    <template v-for="page in getPageNumbers()" :key="page">
                      <button
                        v-if="page !== '...'"
                        @click="changePage(page)"
                        :class="[
                          page === pagination.current_page
                            ? 'pagination-btn pagination-btn-active'
                            : 'pagination-btn pagination-btn-inactive'
                        ]"
                      >
                        {{ page }}
                      </button>
                      <span
                        v-else
                        class="pagination-ellipsis"
                      >
                        ...
                      </span>
                    </template>
                    
                    <button
                      @click="changePage(pagination.current_page + 1)"
                      :disabled="pagination.current_page === pagination.last_page"
                      class="pagination-btn pagination-btn-next"
                    >
                      <span class="sr-only">التالي</span>
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="delete-modal-overlay">
      <div class="delete-modal">
        <div class="mt-3 text-center">
          <div class="delete-modal-icon">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="delete-modal-title">تأكيد الحذف</h3>
          <div class="delete-modal-content">
            <p class="delete-modal-text">
              هل أنت متأكد من حذف المريض
              <span class="font-medium text-gray-900">{{ patientToDelete?.first_name }} {{ patientToDelete?.last_name }}</span>؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div class="delete-modal-actions">
            <button
              @click="cancelDelete"
              class="cancel-btn"
            >
              إلغاء
            </button>
            <button
              @click="deletePatient"
              class="confirm-delete-btn"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import PatientListManager from '@/scripts/patients/patientList.js'

// Initialize the patient list manager
const patientManager = new PatientListManager()

// Get reactive data and methods
const {
  searchQuery,
  genderFilter,
  bloodGroupFilter,
  showDeleteModal,
  patientToDelete,
  loading,
  error,
  patients,
  hasPatients,
  pagination
} = patientManager.getReactiveData()

const {
  fetchPatients,
  handleSearch,
  handleFilterChange,
  clearFilters,
  changePage,
  getPageNumbers,
  confirmDelete,
  cancelDelete,
  deletePatient,
  formatDate,
  getGenderText
} = patientManager.getMethods()

// Lifecycle
onMounted(() => {
  patientManager.onMounted()
  patientManager.setupWatchers()
})
</script>

<style scoped>
@import '@/assets/css/patients.css';
</style>
