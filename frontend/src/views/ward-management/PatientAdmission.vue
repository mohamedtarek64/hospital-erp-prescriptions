<template>
  <div class="patient-admission">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Patient Admission</h1>
        <p class="page-subtitle">Manage patient admissions and bed assignments</p>
      </div>
      <div class="header-actions">
        <button @click="showAdmissionForm" class="btn-primary">
          <PlusIcon class="h-5 w-5 mr-2" />
          New Admission
        </button>
      </div>
    </div>

    <!-- Admission Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <UserPlusIcon class="h-6 w-6 text-blue-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ admissionStats.totalAdmissions }}</div>
          <div class="stat-label">Total Admissions</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <CheckCircleIcon class="h-6 w-6 text-green-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ admissionStats.activeAdmissions }}</div>
          <div class="stat-label">Active Admissions</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <ClockIcon class="h-6 w-6 text-yellow-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ admissionStats.pendingAdmissions }}</div>
          <div class="stat-label">Pending Admissions</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-red-100">
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ admissionStats.overdueAdmissions }}</div>
          <div class="stat-label">Overdue Admissions</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filter-group">
        <div class="search-box">
          <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search patients..."
            class="search-input"
            @input="onSearch"
          />
        </div>
        
        <select v-model="selectedWard" @change="onWardChange" class="filter-select">
          <option value="">All Wards</option>
          <option
            v-for="ward in wards"
            :key="ward.id"
            :value="ward.id"
          >
            {{ ward.name }}
          </option>
        </select>
        
        <select v-model="selectedStatus" @change="onStatusChange" class="filter-select">
          <option value="">All Statuses</option>
          <option value="admitted">Admitted</option>
          <option value="pending">Pending</option>
          <option value="discharged">Discharged</option>
          <option value="transferred">Transferred</option>
        </select>
        
        <button @click="refreshData" class="btn-secondary">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Admissions Table -->
    <div class="table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">Loading admissions...</p>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="error-text">{{ error }}</p>
        <button @click="refreshData" class="btn-secondary mt-4">
          Try Again
        </button>
      </div>

      <div v-else class="admissions-table">
        <table class="table">
          <thead>
            <tr>
              <th class="table-header">Patient</th>
              <th class="table-header">Ward/Room</th>
              <th class="table-header">Bed</th>
              <th class="table-header">Admission Date</th>
              <th class="table-header">Status</th>
              <th class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="admission in filteredAdmissions"
              :key="admission.id"
              class="table-row"
              @click="viewAdmission(admission)"
            >
              <td class="table-cell">
                <div class="patient-info">
                  <div class="patient-avatar">
                    <img
                      :src="admission.patient.avatar || '/default-avatar.png'"
                      :alt="admission.patient.name"
                      class="avatar-img"
                    />
                  </div>
                  <div class="patient-details">
                    <div class="patient-name">{{ admission.patient.name }}</div>
                    <div class="patient-id">ID: {{ admission.patient.patient_id }}</div>
                  </div>
                </div>
              </td>
              <td class="table-cell">
                <div class="ward-info">
                  <div class="ward-name">{{ admission.ward.name }}</div>
                  <div class="room-number">Room {{ admission.room.number }}</div>
                </div>
              </td>
              <td class="table-cell">
                <div class="bed-info">
                  <div class="bed-number">Bed {{ admission.bed.number }}</div>
                  <div class="bed-type">{{ admission.bed.type }}</div>
                </div>
              </td>
              <td class="table-cell">
                <div class="date-info">
                  <div class="admission-date">{{ formatDate(admission.admission_date) }}</div>
                  <div class="admission-time">{{ formatTime(admission.admission_date) }}</div>
                </div>
              </td>
              <td class="table-cell">
                <span class="status-badge" :class="getStatusClass(admission.status)">
                  {{ admission.status }}
                </span>
              </td>
              <td class="table-cell">
                <div class="action-buttons">
                  <button @click.stop="viewAdmission(admission)" class="btn-icon">
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button @click.stop="editAdmission(admission)" class="btn-icon">
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button @click.stop="transferPatient(admission)" class="btn-icon">
                    <ArrowRightLeftIcon class="h-4 w-4" />
                  </button>
                  <button @click.stop="dischargePatient(admission)" class="btn-icon">
                    <UserMinusIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredAdmissions.length === 0" class="empty-state">
          <UserGroupIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="empty-text">No admissions found</p>
          <p class="empty-subtext">Try adjusting your search criteria or add a new admission</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalAdmissions }} admissions
        </span>
      </div>
      
      <div class="pagination-controls">
        <button
          @click="goToPage(currentPage - 1)"
          class="pagination-btn"
          :disabled="currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="page-number"
            :class="{ 'active': page === currentPage }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          class="pagination-btn"
          :disabled="currentPage === totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Admission Form Modal -->
    <div v-if="showAdmissionModal" class="modal-overlay" @click="closeAdmissionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">New Patient Admission</h3>
          <button @click="closeAdmissionModal" class="btn-close">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-body">
          <AdmissionForm
            :wards="wards"
            :beds="availableBeds"
            @submit="handleAdmissionSubmit"
            @cancel="closeAdmissionModal"
          />
        </div>
      </div>
    </div>

    <!-- Admission Details Modal -->
    <div v-if="selectedAdmission" class="modal-overlay" @click="closeAdmissionDetails">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Admission Details</h3>
          <button @click="closeAdmissionDetails" class="btn-close">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-body">
          <div class="admission-details">
            <!-- Patient Information -->
            <div class="detail-section">
              <h4 class="section-title">Patient Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Name:</label>
                  <span>{{ selectedAdmission.patient.name }}</span>
                </div>
                <div class="detail-item">
                  <label>Patient ID:</label>
                  <span>{{ selectedAdmission.patient.patient_id }}</span>
                </div>
                <div class="detail-item">
                  <label>Age:</label>
                  <span>{{ selectedAdmission.patient.age }}</span>
                </div>
                <div class="detail-item">
                  <label>Gender:</label>
                  <span>{{ selectedAdmission.patient.gender }}</span>
                </div>
              </div>
            </div>

            <!-- Admission Information -->
            <div class="detail-section">
              <h4 class="section-title">Admission Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Admission Date:</label>
                  <span>{{ formatDate(selectedAdmission.admission_date) }}</span>
                </div>
                <div class="detail-item">
                  <label>Ward:</label>
                  <span>{{ selectedAdmission.ward.name }}</span>
                </div>
                <div class="detail-item">
                  <label>Room:</label>
                  <span>{{ selectedAdmission.room.number }}</span>
                </div>
                <div class="detail-item">
                  <label>Bed:</label>
                  <span>{{ selectedAdmission.bed.number }}</span>
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div class="detail-section">
              <h4 class="section-title">Medical Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Diagnosis:</label>
                  <span>{{ selectedAdmission.diagnosis || 'Not specified' }}</span>
                </div>
                <div class="detail-item">
                  <label>Admitting Doctor:</label>
                  <span>{{ selectedAdmission.admitting_doctor || 'Not specified' }}</span>
                </div>
                <div class="detail-item">
                  <label>Special Instructions:</label>
                  <span>{{ selectedAdmission.special_instructions || 'None' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePatientAdmission } from '@/composables/usePatientAdmission'
import AdmissionForm from '@/components/ward-management/AdmissionForm.vue'
import {
  PlusIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  ArrowRightLeftIcon,
  UserMinusIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'PatientAdmission',
  components: {
    AdmissionForm,
    PlusIcon,
    UserPlusIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    EyeIcon,
    PencilIcon,
    ArrowRightLeftIcon,
    UserMinusIcon,
    UserGroupIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon
  },
  setup() {
    return usePatientAdmission()
  }
}
</script>