<template>
  <div class="payroll-management">
    <!-- Header -->
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Payroll Management</h1>
      <div class="header-actions">
        <button @click="generatePayroll" class="btn-primary">
          <i class="fas fa-calculator"></i>
          Generate Payroll
        </button>
        <button @click="exportPayroll" class="btn-secondary">
          <i class="fas fa-download"></i>
          Export
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <i class="fas fa-users text-blue-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.total_employees }}</h3>
          <p class="stat-label">Total Employees</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <i class="fas fa-edit text-yellow-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.draft_payrolls }}</h3>
          <p class="stat-label">Draft Payrolls</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <i class="fas fa-check text-green-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.approved_payrolls }}</h3>
          <p class="stat-label">Approved</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100">
          <i class="fas fa-dollar-sign text-purple-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ formatCurrency(stats.total_amount) }}</h3>
          <p class="stat-label">Total Amount</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <select v-model="filters.month" class="filter-select">
          <option value="">All Months</option>
          <option v-for="month in 12" :key="month" :value="month">
            {{ getMonthName(month) }}
          </option>
        </select>
        <select v-model="filters.year" class="filter-select">
          <option value="">All Years</option>
          <option v-for="year in [2023, 2024, 2025]" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
        <select v-model="filters.employee" class="filter-select">
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.name }}
          </option>
        </select>
        <button @click="applyFilters" class="btn-secondary">
          <i class="fas fa-search"></i>
          Filter
        </button>
      </div>
    </div>

    <!-- Payroll Table -->
    <div class="payroll-table-container">
      <table class="payroll-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Period</th>
            <th>Basic Salary</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payroll in paginatedPayrolls" :key="payroll.id">
            <td>
              <div class="employee-info">
                <div class="employee-avatar">
                  <img :src="payroll.employee?.avatar || '/default-avatar.png'" :alt="payroll.employee?.name" />
                </div>
                <div class="employee-details">
                  <div class="employee-name">{{ payroll.employee?.name }}</div>
                  <div class="employee-designation">{{ payroll.employee?.designation }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="period-display">
                {{ getMonthName(payroll.month) }} {{ payroll.year }}
              </div>
            </td>
            <td>
              <span class="amount-display amount-positive">
                {{ formatCurrency(payroll.basic_salary) }}
              </span>
            </td>
            <td>
              <span class="amount-display amount-positive">
                {{ formatCurrency(payroll.allowances) }}
              </span>
            </td>
            <td>
              <span class="amount-display amount-negative">
                {{ formatCurrency(payroll.deductions) }}
              </span>
            </td>
            <td>
              <span class="amount-display amount-positive">
                {{ formatCurrency(payroll.net_salary) }}
              </span>
            </td>
            <td>
              <span :class="`status-badge ${getStatusClass(payroll.status)}`">
                {{ getStatusText(payroll.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button v-if="payroll.status === 'draft'" @click="approvePayroll(payroll)" class="btn-icon btn-approve" title="Approve">
                  <i class="fas fa-check"></i>
                </button>
                <button v-if="payroll.status === 'draft'" @click="rejectPayroll(payroll)" class="btn-icon btn-reject" title="Reject">
                  <i class="fas fa-times"></i>
                </button>
                <button @click="editPayroll(payroll)" class="btn-icon" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deletePayroll(payroll)" class="btn-icon btn-danger" title="Delete">
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

    <!-- Generate Payroll Modal -->
    <div v-if="showGenerateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Generate Payroll</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="processPayrollGeneration" class="modal-body">
          <div class="form-group">
            <label>Month</label>
            <select v-model="payrollForm.month" required>
              <option v-for="month in 12" :key="month" :value="month">
                {{ getMonthName(month) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Year</label>
            <select v-model="payrollForm.year" required>
              <option v-for="year in [2023, 2024, 2025]" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Select Employees</label>
            <div class="employee-selection">
              <div v-for="employee in payrollForm.employees" :key="employee.id" class="employee-item">
                <input
                  v-model="employee.selected"
                  type="checkbox"
                  class="employee-checkbox"
                />
                <div class="employee-info">
                  <div class="employee-name">{{ employee.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Generate Payroll
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Payroll Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Payroll</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="updatePayroll" class="modal-body">
          <div class="form-group">
            <label>Basic Salary</label>
            <input v-model="selectedPayroll.basic_salary" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Allowances</label>
            <input v-model="selectedPayroll.allowances" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label>Deductions</label>
            <input v-model="selectedPayroll.deductions" type="number" step="0.01" />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Update Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePayrollManagement } from '@/scripts/hr/payrollManagement.js'

// Use composable
const {
  // payrolls,
  employees,
  stats,
  filters,
  currentPage,
  totalPages,
  // itemsPerPage,
  showGenerateModal,
  showEditModal,
  selectedPayroll,
  payrollForm,
  // loading,
  // error,
  // filteredPayrolls,
  paginatedPayrolls,
  // loadPayrolls,
  // loadEmployees,
  // loadStats,
  generatePayroll,
  processPayrollGeneration,
  approvePayroll,
  rejectPayroll,
  editPayroll,
  updatePayroll,
  deletePayroll,
  exportPayroll,
  applyFilters,
  // clearFilters,
  closeModal,
  previousPage,
    nextPage,
    // goToPage,
    formatCurrency,
    // formatDate,
    getStatusClass,
  getStatusText,
  getMonthName
} = usePayrollManagement()
</script>

<style scoped>
@import '@/assets/css/payroll-management.css';
</style>
