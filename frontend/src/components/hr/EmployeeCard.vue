<template>
  <div class="employee-card" :class="{ inactive: employee.status === 'inactive' }">
    <div class="card-header">
      <div class="employee-avatar">
        <img 
          v-if="employee.avatar" 
          :src="employee.avatar" 
          :alt="employee.name"
          class="avatar-image"
        >
        <div v-else class="avatar-placeholder">
          <i class="fas fa-user"></i>
        </div>
      </div>
      
      <div class="employee-info">
        <h4 class="employee-name">{{ employee.name }}</h4>
        <p class="employee-id">ID: {{ employee.employee_id }}</p>
        <span class="employee-designation">{{ employee.designation }}</span>
      </div>

      <div class="employee-status">
        <span :class="`status-${employee.status}`">{{ formatStatus(employee.status) }}</span>
        <div class="status-indicator" :class="`indicator-${employee.status}`"></div>
      </div>
    </div>

    <div class="card-content">
      <div class="employee-details">
        <div class="detail-item">
          <i class="fas fa-building"></i>
          <span>{{ employee.department?.name || 'No Department' }}</span>
        </div>
        
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>Joined: {{ formatDate(employee.hire_date) }}</span>
        </div>
        
        <div class="detail-item">
          <i class="fas fa-envelope"></i>
          <span>{{ employee.email || 'No Email' }}</span>
        </div>
        
        <div class="detail-item">
          <i class="fas fa-phone"></i>
          <span>{{ employee.phone || 'No Phone' }}</span>
        </div>
      </div>

      <div class="employee-stats">
        <div class="stat-item">
          <span class="stat-label">Salary</span>
          <span class="stat-value">${{ formatSalary(employee.salary) }}</span>
        </div>
        
        <div class="stat-item">
          <span class="stat-label">Type</span>
          <span class="stat-value">{{ formatEmploymentType(employee.employment_type) }}</span>
        </div>
      </div>

      <div v-if="employee.emergency_contact" class="emergency-contact">
        <h5>Emergency Contact</h5>
        <div class="contact-info">
          <p><strong>{{ employee.emergency_contact.name }}</strong></p>
          <p>{{ employee.emergency_contact.relationship }}</p>
          <p>{{ employee.emergency_contact.phone }}</p>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button @click="$emit('view', employee)" class="view-btn">
        <i class="fas fa-eye"></i>
        View
      </button>
      
      <button @click="$emit('edit', employee)" class="edit-btn">
        <i class="fas fa-edit"></i>
        Edit
      </button>
      
      <button @click="$emit('attendance', employee)" class="attendance-btn">
        <i class="fas fa-clock"></i>
        Attendance
      </button>
      
      <div class="dropdown">
        <button @click="toggleDropdown" class="dropdown-btn">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        
        <div v-if="showDropdown" class="dropdown-menu">
          <button @click="$emit('payroll', employee)" class="dropdown-item">
            <i class="fas fa-money-bill"></i>
            Payroll
          </button>
          <button @click="$emit('performance', employee)" class="dropdown-item">
            <i class="fas fa-chart-line"></i>
            Performance
          </button>
          <button @click="$emit('leave', employee)" class="dropdown-item">
            <i class="fas fa-calendar-times"></i>
            Leave
          </button>
          <button @click="$emit('deactivate', employee)" class="dropdown-item danger">
            <i class="fas fa-user-slash"></i>
            {{ employee.status === 'active' ? 'Deactivate' : 'Activate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Overlay -->
    <div v-if="showQuickStats" class="quick-stats-overlay">
      <div class="quick-stats">
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <span>{{ employee.attendance_stats?.present_days || 0 }}</span>
          <small>Present Days</small>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-calendar-times"></i>
          <span>{{ employee.leave_stats?.pending_leaves || 0 }}</span>
          <small>Pending Leaves</small>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-star"></i>
          <span>{{ employee.performance_stats?.rating || 'N/A' }}</span>
          <small>Performance</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { formatDate, formatStatus, formatEmploymentType, formatSalary } from '@/utils/hrHelpers'

export default {
  name: 'EmployeeCard',
  props: {
    employee: {
      type: Object,
      required: true
    },
    showQuickStats: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view', 'edit', 'attendance', 'payroll', 'performance', 'leave', 'deactivate'],
  setup() {
    const showDropdown = ref(false)

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        showDropdown.value = false
      }
    }

    return {
      showDropdown,
      toggleDropdown,
      handleClickOutside,
      formatDate,
      formatStatus,
      formatEmploymentType,
      formatSalary
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  unmounted() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.employee-card {
  @apply bg-white rounded-lg shadow-md border border-gray-200 p-4 transition-all duration-200 hover:shadow-lg relative;
}

.employee-card.inactive {
  @apply opacity-60;
}

.card-header {
  @apply flex items-start space-x-4 mb-4;
}

.employee-avatar {
  @apply flex-shrink-0;
}

.avatar-image {
  @apply w-16 h-16 rounded-full object-cover border-2 border-gray-200;
}

.avatar-placeholder {
  @apply w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl;
}

.employee-info {
  @apply flex-1 min-w-0;
}

.employee-name {
  @apply text-lg font-semibold text-gray-800 mb-1 truncate;
}

.employee-id {
  @apply text-sm text-gray-600 mb-1;
}

.employee-designation {
  @apply text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800;
}

.employee-status {
  @apply flex flex-col items-end space-y-1;
}

.status-active {
  @apply px-2 py-1 text-xs rounded-full bg-green-100 text-green-800;
}

.status-inactive {
  @apply px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800;
}

.status-suspended {
  @apply px-2 py-1 text-xs rounded-full bg-red-100 text-red-800;
}

.status-indicator {
  @apply w-2 h-2 rounded-full;
}

.indicator-active {
  @apply bg-green-500;
}

.indicator-inactive {
  @apply bg-gray-400;
}

.indicator-suspended {
  @apply bg-red-500;
}

.card-content {
  @apply space-y-4 mb-4;
}

.employee-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.detail-item i {
  @apply w-4 text-gray-400;
}

.employee-stats {
  @apply grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg;
}

.stat-item {
  @apply text-center;
}

.stat-label {
  @apply block text-xs text-gray-500 mb-1;
}

.stat-value {
  @apply block text-sm font-medium text-gray-800;
}

.emergency-contact {
  @apply p-3 bg-yellow-50 rounded-lg border border-yellow-200;
}

.emergency-contact h5 {
  @apply text-sm font-medium text-gray-800 mb-2;
}

.contact-info p {
  @apply text-xs text-gray-600 mb-1;
}

.card-actions {
  @apply flex items-center justify-between pt-4 border-t border-gray-200;
}

.view-btn, .edit-btn, .attendance-btn {
  @apply px-3 py-1 text-xs rounded transition-colors duration-200;
}

.view-btn {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.edit-btn {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.attendance-btn {
  @apply bg-purple-100 text-purple-700 hover:bg-purple-200;
}

.dropdown {
  @apply relative;
}

.dropdown-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

.dropdown-menu {
  @apply absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10;
}

.dropdown-item {
  @apply w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2;
}

.dropdown-item.danger {
  @apply text-red-600 hover:bg-red-50;
}

.dropdown-item i {
  @apply w-4;
}

.quick-stats-overlay {
  @apply absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center;
}

.quick-stats {
  @apply grid grid-cols-3 gap-4;
}

.stat-card {
  @apply text-center p-2;
}

.stat-card i {
  @apply text-blue-500 mb-1;
}

.stat-card span {
  @apply block text-lg font-bold text-gray-800;
}

.stat-card small {
  @apply text-xs text-gray-500;
}
</style>
