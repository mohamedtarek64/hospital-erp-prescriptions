<template>
  <div class="user-table">
    <div class="table-header">
      <div class="header-info">
        <h3 class="table-title">Users</h3>
        <span class="table-count">{{ users.length }} users</span>
      </div>
      <div class="header-actions">
        <button @click="$emit('refresh')" class="btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
        </button>
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin text-blue-500"></i>
        <span>Loading users...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <span>{{ error }}</span>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <i class="fas fa-users text-gray-400"></i>
        <span>No users found</span>
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
                    No roles
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
                <div class="action-buttons">
                  <button 
                    @click="$emit('edit', user)"
                    class="btn-action btn-edit"
                    title="Edit User"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="$emit('view', user)"
                    class="btn-action btn-view"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    @click="$emit('delete', user)"
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

    <!-- Bulk Actions -->
    <div v-if="selectedUsers.length > 0" class="bulk-actions">
      <div class="bulk-content">
        <span class="bulk-text">
          {{ selectedUsers.length }} user(s) selected
        </span>
        <div class="bulk-buttons">
          <button @click="$emit('bulk-activate', selectedUsers)" class="btn-bulk btn-success">
            <i class="fas fa-check mr-2"></i>
            Activate
          </button>
          <button @click="$emit('bulk-deactivate', selectedUsers)" class="btn-bulk btn-warning">
            <i class="fas fa-pause mr-2"></i>
            Deactivate
          </button>
          <button @click="$emit('bulk-delete', selectedUsers)" class="btn-bulk btn-danger">
            <i class="fas fa-trash mr-2"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserTable } from '@/scripts/admin/userTable'

/**
 * Component props
 */
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['edit', 'view', 'delete', 'bulk-activate', 'bulk-deactivate', 'bulk-delete', 'refresh'])

// Get user table functionality
const {
  selectedUsers,
  selectAll,
  toggleSelectAll,
  getStatusClass,
  getStatusIcon,
  formatDate
} = useUserTable(props, emit)
</script>

<style scoped>
@import '@/assets/css/admin/userTable.css';
</style>
