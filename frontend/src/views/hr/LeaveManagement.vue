<template>
  <div class="leave-management">
    <!-- Header -->
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Leave Management</h1>
      <button @click="showRequestForm = true" class="btn-primary">
        <i class="fas fa-plus"></i>
        Request Leave
      </button>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <i class="fas fa-clock text-yellow-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.pending_requests }}</h3>
          <p class="stat-label">Pending Requests</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <i class="fas fa-check text-green-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.approved_requests }}</h3>
          <p class="stat-label">Approved</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-red-100">
          <i class="fas fa-times text-red-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.rejected_requests }}</h3>
          <p class="stat-label">Rejected</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <i class="fas fa-calendar text-blue-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.total_days_taken }}</h3>
          <p class="stat-label">Days Taken</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="filters.leave_type" class="filter-select">
          <option value="">All Leave Types</option>
          <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        <select v-model="filters.employee" class="filter-select">
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.name }}
          </option>
        </select>
        <input
          v-model="filters.date_from"
          type="date"
          placeholder="From Date"
          class="filter-input"
        />
        <input
          v-model="filters.date_to"
          type="date"
          placeholder="To Date"
          class="filter-input"
        />
        <button @click="applyFilters" class="btn-secondary">
          <i class="fas fa-search"></i>
          Filter
        </button>
      </div>
    </div>

    <!-- Leave Requests Table -->
    <div class="leave-table-container">
      <table class="leave-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Date Range</th>
            <th>Days</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in paginatedRequests" :key="request.id">
            <td>
              <div class="employee-info">
                <div class="employee-avatar">
                  <img :src="request.employee?.avatar || '/default-avatar.png'" :alt="request.employee?.name" />
                </div>
                <div class="employee-details">
                  <div class="employee-name">{{ request.employee?.name }}</div>
                  <div class="employee-designation">{{ request.employee?.designation }}</div>
                </div>
              </div>
            </td>
            <td>{{ request.leave_type?.name }}</td>
            <td>
              <div class="date-range">
                <div class="date-start">{{ formatDate(request.start_date) }}</div>
                <div class="date-end">to {{ formatDate(request.end_date) }}</div>
              </div>
            </td>
            <td>
              <span :class="`days-display ${calculateDays(request.start_date, request.end_date) === 1 ? 'days-single' : 'days-multiple'}`">
                {{ calculateDays(request.start_date, request.end_date) }}
              </span>
            </td>
            <td>
              <span :class="`status-badge ${getStatusClass(request.status)}`">
                {{ getStatusText(request.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button v-if="request.status === 'pending'" @click="approveLeaveRequest(request)" class="btn-icon btn-approve" title="Approve">
                  <i class="fas fa-check"></i>
                </button>
                <button v-if="request.status === 'pending'" @click="rejectLeaveRequest(request)" class="btn-icon btn-reject" title="Reject">
                  <i class="fas fa-times"></i>
                </button>
                <button @click="deleteLeaveRequest(request)" class="btn-icon btn-danger" title="Delete">
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

    <!-- Request Leave Modal -->
    <div v-if="showRequestForm" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Request Leave</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="submitLeaveRequest" class="modal-body">
          <div class="form-group">
            <label>Employee</label>
            <select v-model="leaveForm.employee_id" required>
              <option value="">Select Employee</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Leave Type</label>
            <select v-model="leaveForm.leave_type_id" required>
              <option value="">Select Leave Type</option>
              <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input v-model="leaveForm.start_date" type="date" required />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input v-model="leaveForm.end_date" type="date" required />
          </div>
          <div class="form-group">
            <label>Reason</label>
            <textarea v-model="leaveForm.reason" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>Emergency Contact</label>
            <input v-model="leaveForm.emergency_contact" type="text" />
          </div>
          <div class="form-group">
            <label>Emergency Phone</label>
            <input v-model="leaveForm.emergency_phone" type="tel" />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ approvalForm.status === 'approved' ? 'Approve' : 'Reject' }} Leave Request</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="processApproval" class="modal-body">
          <div class="form-group">
            <label>Comments</label>
            <textarea v-model="approvalForm.comments" rows="3" placeholder="Add comments (optional)"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :class="approvalForm.status === 'approved' ? 'btn-success' : 'btn-danger'">
              {{ approvalForm.status === 'approved' ? 'Approve' : 'Reject' }} Request
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLeaveManagement } from '@/scripts/hr/leaveManagement.js'

// Use composable
const {
  // leaveRequests,
  leaveTypes,
  employees,
  stats,
  filters,
  currentPage,
  totalPages,
  // itemsPerPage,
  showRequestForm,
  showApprovalModal,
  // selectedRequest,
  leaveForm,
  approvalForm,
  // loading,
  // error,
  // filteredRequests,
  paginatedRequests,
  // loadLeaveRequests,
  // loadLeaveTypes,
  // loadEmployees,
  // loadStats,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  processApproval,
  deleteLeaveRequest,
  applyFilters,
  // clearFilters,
  closeModal,
  previousPage,
  nextPage,
  // goToPage,
  formatDate,
  getStatusClass,
  getStatusText,
  calculateDays
} = useLeaveManagement()
</script>

<style scoped>
@import '@/assets/css/leave-management.css';
</style>
