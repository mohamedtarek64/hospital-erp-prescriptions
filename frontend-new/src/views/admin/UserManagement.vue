<template>
  <div class="user-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-users mr-3 text-blue-600"></i>
          User Management
        </h1>
        <p class="page-subtitle">Manage user accounts and permissions</p>
      </div>
      <div class="header-actions">
        <button 
          @click="showCreateForm = true"
          class="btn-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Add User
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Search</label>
          <div class="search-input">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="filters.search"
              @input="debouncedSearch"
              type="text"
              placeholder="Search users..."
              class="input-field"
            >
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Role</label>
          <select v-model="filters.role" @change="loadUsers" class="select-field">
            <option value="">All Roles</option>
            <option v-for="role in roles" :key="role.id" :value="role.name">
              {{ role.display_name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="filters.status" @change="loadUsers" class="select-field">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="btn-secondary">
            <i class="fas fa-times mr-2"></i>
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-section">
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <span>Loading users...</span>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ error }}</span>
          <button @click="loadUsers" class="btn-retry">
            <i class="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          <i class="fas fa-users text-gray-400"></i>
          <h3 class="empty-title">No Users Found</h3>
          <p class="empty-description">No users match your current filters</p>
          <button @click="showCreateForm = true" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            Add First User
          </button>
        </div>

        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="table-header">
                  <input 
                    type="checkbox" 
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    class="checkbox"
                  >
                </th>
                <th class="table-header">User</th>
                <th class="table-header">Email</th>
                <th class="table-header">Roles</th>
                <th class="table-header">Status</th>
                <th class="table-header">Last Login</th>
                <th class="table-header">Created</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="table-row">
                <td class="table-cell">
                  <input 
                    type="checkbox" 
                    v-model="selectedUsers"
                    :value="user.id"
                    class="checkbox"
                  >
                </td>
                <td class="table-cell">
                  <div class="user-info">
                    <div class="user-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ user.name }}</span>
                      <span class="user-id">ID: {{ user.id }}</span>
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="email">{{ user.email }}</span>
                </td>
                <td class="table-cell">
                  <div class="roles-container">
                    <span 
                      v-for="role in user.roles" 
                      :key="role.id"
                      class="role-badge"
                    >
                      {{ role.display_name }}
                    </span>
                    <span v-if="user.roles.length === 0" class="no-roles">
                      No roles assigned
                    </span>
                  </div>
                </td>
                <td class="table-cell">
                  <span 
                    class="status-badge"
                    :class="getStatusClass(user.status)"
                  >
                    <i :class="getStatusIcon(user.status)" class="mr-1"></i>
                    {{ user.status }}
                  </span>
                </td>
                <td class="table-cell">
                  <span class="date-text">
                    {{ formatDate(user.last_login_at) }}
                  </span>
                </td>
                <td class="table-cell">
                  <span class="date-text">
                    {{ formatDate(user.created_at) }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="action-buttons">
                    <button 
                      @click="editUser(user)"
                      class="btn-action btn-edit"
                      title="Edit User"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="viewUser(user)"
                      class="btn-action btn-view"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="deleteUser(user)"
                      class="btn-action btn-delete"
                      title="Delete User"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > pagination.per_page" class="pagination-section">
        <div class="pagination-info">
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} users
        </div>
        <div class="pagination-controls">
          <button 
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="btn-pagination"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="changePage(page)"
              :class="['btn-page', { 'active': page === pagination.current_page }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="btn-pagination"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedUsers.length > 0" class="bulk-actions">
      <div class="bulk-content">
        <span class="bulk-text">
          {{ selectedUsers.length }} user(s) selected
        </span>
        <div class="bulk-buttons">
          <button @click="bulkActivate" class="btn-bulk btn-success">
            <i class="fas fa-check mr-2"></i>
            Activate
          </button>
          <button @click="bulkDeactivate" class="btn-bulk btn-warning">
            <i class="fas fa-pause mr-2"></i>
            Deactivate
          </button>
          <button @click="bulkDelete" class="btn-bulk btn-danger">
            <i class="fas fa-trash mr-2"></i>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateForm || showEditForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditForm ? 'Edit User' : 'Create New User' }}
          </h3>
          <button @click="closeForm" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="form-input"
                placeholder="Enter full name"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="form-input"
                placeholder="Enter email address"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Password {{ showEditForm ? '(leave blank to keep current)' : '*' }}</label>
              <input
                v-model="form.password"
                type="password"
                :required="!showEditForm"
                class="form-input"
                placeholder="Enter password"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label class="form-label">Roles</label>
              <div class="roles-selection">
                <div 
                  v-for="role in roles" 
                  :key="role.id"
                  class="role-option"
                >
                  <input
                    type="checkbox"
                    :id="`role-${role.id}`"
                    v-model="form.roles"
                    :value="role.id"
                    class="role-checkbox"
                  >
                  <label :for="`role-${role.id}`" class="role-label">
                    <span class="role-name">{{ role.display_name }}</span>
                    <span class="role-description">{{ role.description }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeForm" class="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="btn-primary"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
              {{ showEditForm ? 'Update User' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title text-red-600">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Confirm Delete
          </h3>
        </div>
        <div class="modal-body">
          <p class="delete-message">
            Are you sure you want to delete user <strong>{{ userToDelete?.name }}</strong>?
            This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="confirmDelete"
            :disabled="isDeleting"
            class="btn-danger"
          >
            <i v-if="isDeleting" class="fas fa-spinner fa-spin mr-2"></i>
            Delete User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserManagement } from '@/scripts/admin/userManagement'

// Get user management functionality
const {
  loading,
  error,
  users,
  roles,
  pagination,
  selectedUsers,
  selectAll,
  showCreateForm,
  showEditForm,
  showDeleteModal,
  userToDelete,
  isSubmitting,
  isDeleting,
  filters,
  form,
  loadUsers,
  // loadRoles,
  debouncedSearch,
  clearFilters,
  changePage,
  toggleSelectAll,
  editUser,
  viewUser,
  deleteUser,
  confirmDelete,
  closeForm,
  closeDeleteModal,
  submitForm,
  bulkActivate,
  bulkDeactivate,
  bulkDelete,
  getStatusClass,
  getStatusIcon,
  formatDate,
  onMountedHandler
} = useUserManagement()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/admin/userManagement.css';
</style>
