<template>
  <div class="attendance-management">
    <!-- Header -->
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Attendance Management</h1>
      <div class="header-actions">
        <button @click="markAttendance" class="btn-primary">
          <i class="fas fa-clock"></i>
          Mark Attendance
        </button>
        <button @click="exportAttendance" class="btn-secondary">
          <i class="fas fa-download"></i>
          Export
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <i class="fas fa-user-check text-green-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.present }}</h3>
          <p class="stat-label">Present Today</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-red-100">
          <i class="fas fa-user-times text-red-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.absent }}</h3>
          <p class="stat-label">Absent Today</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <i class="fas fa-clock text-yellow-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.late }}</h3>
          <p class="stat-label">Late Today</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <i class="fas fa-users text-blue-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.total }}</h3>
          <p class="stat-label">Total Employees</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input
          v-model="filters.date"
          type="date"
          class="filter-input"
        />
        <select v-model="filters.department" class="filter-select">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <select v-model="filters.employee" class="filter-select">
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.name }}
          </option>
        </select>
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
        </select>
        <button @click="applyFilters" class="btn-secondary">
          <i class="fas fa-search"></i>
          Filter
        </button>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="attendance-table-container">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in paginatedRecords" :key="record.id">
            <td>
              <div class="employee-info">
                <div class="employee-avatar">
                  <img :src="record.employee?.avatar || '/default-avatar.png'" :alt="record.employee?.name" />
                </div>
                <div class="employee-details">
                  <div class="employee-name">{{ record.employee?.name }}</div>
                  <div class="employee-designation">{{ record.employee?.designation }}</div>
                </div>
              </div>
            </td>
            <td>{{ record.date }}</td>
            <td>
              <span :class="`time-display ${record.check_in ? 'time-present' : 'time-absent'}`">
                {{ formatTime(record.check_in) }}
              </span>
            </td>
            <td>
              <span :class="`time-display ${record.check_out ? 'time-present' : 'time-absent'}`">
                {{ formatTime(record.check_out) }}
              </span>
            </td>
            <td>
              <span :class="`status-badge ${getStatusClass(record.status)}`">
                {{ getStatusText(record.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="editAttendance(record)" class="btn-icon" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteAttendance(record)" class="btn-icon btn-danger" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Mark Attendance Modal -->
    <div v-if="showMarkAttendanceModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Mark Attendance</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveAttendance" class="modal-body">
          <div class="form-group">
            <label>Employee</label>
            <select v-model="attendanceForm.employee_id" required>
              <option value="">Select Employee</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="attendanceForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Check In Time</label>
            <input v-model="attendanceForm.check_in" type="time" />
          </div>
          <div class="form-group">
            <label>Check Out Time</label>
            <input v-model="attendanceForm.check_out" type="time" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="attendanceForm.status" required>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="attendanceForm.notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Save Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAttendanceManagement } from '@/scripts/hr/attendanceManagement.js'

// Use composable
const {
  // attendanceRecords,
  employees,
  stats,
  filters,
  currentPage,
  totalPages,
  // itemsPerPage,
  showMarkAttendanceModal,
  // selectedEmployee,
  attendanceForm,
  // loading,
  // error,
  // filteredRecords,
  paginatedRecords,
  // loadAttendanceRecords,
  // loadEmployees,
  // loadStats,
  markAttendance,
  saveAttendance,
  // updateAttendance,
  deleteAttendance,
  exportAttendance,
  applyFilters,
  // clearFilters,
  closeModal,
  previousPage,
  nextPage,
  // goToPage,
  formatTime,
  getStatusClass,
  getStatusText
} = useAttendanceManagement()
</script>

<style scoped>
@import '@/assets/css/attendance-management.css';
</style>
