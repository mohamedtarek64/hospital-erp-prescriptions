<template>
  <div class="employee-directory">
    <!-- Header -->
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Employee Directory</h1>
      <button @click="showAddForm = true" class="btn-primary">
        <i class="fas fa-plus"></i>
        Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search employees..."
          class="filter-input"
        />
        <select v-model="filters.department" class="filter-select">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </select>
        <button @click="applyFilters" class="btn-secondary">
          <i class="fas fa-search"></i>
          Filter
        </button>
      </div>
    </div>

    <!-- Employee Grid -->
    <div class="employee-grid">
      <div v-for="employee in filteredEmployees" :key="employee.id" class="employee-card">
        <div class="employee-avatar">
          <img :src="employee.avatar || '/default-avatar.png'" :alt="employee.name" />
        </div>
        <div class="employee-info">
          <h3 class="employee-name">{{ employee.name }}</h3>
          <p class="employee-designation">{{ employee.designation }}</p>
          <p class="employee-department">{{ employee.department?.name }}</p>
          <div class="employee-status">
            <span :class="`status-badge status-${employee.status}`">
              {{ employee.status }}
            </span>
          </div>
        </div>
        <div class="employee-actions">
          <button @click="viewEmployee(employee)" class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button @click="editEmployee(employee)" class="btn-icon" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="deleteEmployee(employee)" class="btn-icon btn-danger" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
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

    <!-- Add/Edit Employee Modal -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddForm ? 'Add Employee' : 'Edit Employee' }}</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveEmployee" class="modal-body">
          <div class="form-group">
            <label>Employee ID</label>
            <input v-model="employeeForm.employee_id" type="text" required />
          </div>
          <div class="form-group">
            <label>User</label>
            <select v-model="employeeForm.user_id" required>
              <option value="">Select User</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select v-model="employeeForm.department_id" required>
              <option value="">Select Department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Designation</label>
            <input v-model="employeeForm.designation" type="text" required />
          </div>
          <div class="form-group">
            <label>Hire Date</label>
            <input v-model="employeeForm.hire_date" type="date" required />
          </div>
          <div class="form-group">
            <label>Salary</label>
            <input v-model="employeeForm.salary" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Employment Type</label>
            <select v-model="employeeForm.employment_type" required>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ showAddForm ? 'Add Employee' : 'Update Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEmployeeDirectory } from '@/scripts/hr/employeeDirectory.js'

// Use composable
const {
  // employees,
  departments,
  users,
  filters,
  currentPage,
  totalPages,
  showAddForm,
  showEditForm,
  employeeForm,
  // selectedEmployee,
  // loading,
  // error,
  filteredEmployees,
  // loadEmployees,
  // loadDepartments,
  // loadUsers,
  applyFilters,
  // clearFilters,
  viewEmployee,
  editEmployee,
  deleteEmployee,
  saveEmployee,
  closeModal,
  previousPage,
  nextPage
  // goToPage
} = useEmployeeDirectory()
</script>

<style scoped>
@import '@/assets/css/employee-directory.css';
</style>
