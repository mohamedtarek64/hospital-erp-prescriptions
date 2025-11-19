<template>
  <div class="role-permissions">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-shield-alt mr-3 text-blue-600"></i>
          Roles & Permissions
        </h1>
        <p class="page-subtitle">Manage user roles and access permissions</p>
      </div>
      <div class="header-actions">
        <button 
          @click="showCreateRoleForm = true"
          class="btn-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Add Role
        </button>
        <button 
          @click="initializeDefaults"
          class="btn-secondary"
        >
          <i class="fas fa-magic mr-2"></i>
          Initialize Defaults
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100">
            <i class="fas fa-shield-alt text-blue-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.total_roles || 0 }}</h3>
            <p class="stat-label">Total Roles</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100">
            <i class="fas fa-key text-purple-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.total_permissions || 0 }}</h3>
            <p class="stat-label">Total Permissions</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100">
            <i class="fas fa-users text-green-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.roles_with_users || 0 }}</h3>
            <p class="stat-label">Roles with Users</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-orange-100">
            <i class="fas fa-layer-group text-orange-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.modules?.length || 0 }}</h3>
            <p class="stat-label">Modules</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <div class="tabs-nav">
        <button 
          @click="activeTab = 'roles'"
          :class="['tab-button', { 'active': activeTab === 'roles' }]"
        >
          <i class="fas fa-shield-alt mr-2"></i>
          Roles
        </button>
        <button 
          @click="activeTab = 'permissions'"
          :class="['tab-button', { 'active': activeTab === 'permissions' }]"
        >
          <i class="fas fa-key mr-2"></i>
          Permissions
        </button>
      </div>
    </div>

    <!-- Roles Tab -->
    <div v-if="activeTab === 'roles'" class="roles-section">
      <!-- Roles Filters -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Search</label>
            <div class="search-input">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="roleFilters.search"
                @input="debouncedRoleSearch"
                type="text"
                placeholder="Search roles..."
                class="input-field"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Roles List -->
      <div class="roles-grid">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <span>Loading roles...</span>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ error }}</span>
          <button @click="loadRoles" class="btn-retry">
            <i class="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>

        <div v-else-if="roles.length === 0" class="empty-state">
          <i class="fas fa-shield-alt text-gray-400"></i>
          <h3 class="empty-title">No Roles Found</h3>
          <p class="empty-description">Create your first role to get started</p>
          <button @click="showCreateRoleForm = true" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            Create First Role
          </button>
        </div>

        <div v-else class="roles-list">
          <div 
            v-for="role in roles" 
            :key="role.id"
            class="role-card"
          >
            <div class="role-header">
              <div class="role-info">
                <h4 class="role-name">{{ role.display_name }}</h4>
                <p class="role-description">{{ role.description || 'No description' }}</p>
                <span class="role-key">{{ role.name }}</span>
              </div>
              <div class="role-badges">
                <span class="permission-count">
                  <i class="fas fa-key mr-1"></i>
                  {{ role.permissions?.length || 0 }} permissions
                </span>
                <span class="user-count">
                  <i class="fas fa-users mr-1"></i>
                  {{ role.users?.length || 0 }} users
                </span>
              </div>
            </div>

            <div class="role-permissions">
              <h5 class="permissions-title">Permissions:</h5>
              <div class="permissions-list">
                <span 
                  v-for="permission in role.permissions?.slice(0, 5)" 
                  :key="permission.id"
                  class="permission-tag"
                >
                  {{ permission.display_name }}
                </span>
                <span 
                  v-if="role.permissions?.length > 5"
                  class="more-permissions"
                >
                  +{{ role.permissions.length - 5 }} more
                </span>
                <span 
                  v-if="!role.permissions || role.permissions.length === 0"
                  class="no-permissions"
                >
                  No permissions assigned
                </span>
              </div>
            </div>

            <div class="role-actions">
              <button 
                @click="editRole(role)"
                class="btn-action btn-edit"
                title="Edit Role"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click="managePermissions(role)"
                class="btn-action btn-permissions"
                title="Manage Permissions"
              >
                <i class="fas fa-key"></i>
              </button>
              <button 
                @click="cloneRole(role)"
                class="btn-action btn-clone"
                title="Clone Role"
              >
                <i class="fas fa-copy"></i>
              </button>
              <button 
                @click="deleteRole(role)"
                class="btn-action btn-delete"
                title="Delete Role"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Permissions Tab -->
    <div v-if="activeTab === 'permissions'" class="permissions-section">
      <!-- Permissions Filters -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Search</label>
            <div class="search-input">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="permissionFilters.search"
                @input="debouncedPermissionSearch"
                type="text"
                placeholder="Search permissions..."
                class="input-field"
              >
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Module</label>
            <select v-model="permissionFilters.module" @change="loadPermissions" class="select-field">
              <option value="">All Modules</option>
              <option v-for="module in modules" :key="module" :value="module">
                {{ formatModuleName(module) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Permissions by Module -->
      <div class="permissions-by-module">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <span>Loading permissions...</span>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ error }}</span>
          <button @click="loadPermissions" class="btn-retry">
            <i class="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>

        <div v-else class="modules-list">
          <div 
            v-for="(modulePermissions, module) in permissionsByModule" 
            :key="module"
            class="module-section"
          >
            <div class="module-header">
              <h3 class="module-title">
                <i :class="getModuleIcon(module)" class="mr-2"></i>
                {{ formatModuleName(module) }}
              </h3>
              <span class="module-count">{{ modulePermissions.length }} permissions</span>
            </div>

            <div class="permissions-grid">
              <div 
                v-for="permission in modulePermissions" 
                :key="permission.id"
                class="permission-card"
              >
                <div class="permission-header">
                  <h4 class="permission-name">{{ permission.display_name }}</h4>
                  <span class="permission-key">{{ permission.name }}</span>
                </div>
                <p class="permission-description">{{ permission.description || 'No description' }}</p>
                <div class="permission-meta">
                  <span class="meta-item">
                    <i class="fas fa-tag mr-1"></i>
                    {{ permission.module }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-shield-alt mr-1"></i>
                    {{ permission.roles?.length || 0 }} roles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Role Modal -->
    <div v-if="showCreateRoleForm || showEditRoleForm" class="modal-overlay" @click="closeRoleForm">
      <div class="modal-content modal-lg" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditRoleForm ? 'Edit Role' : 'Create New Role' }}
          </h3>
          <button @click="closeRoleForm" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitRoleForm" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Role Name *</label>
              <input
                v-model="roleForm.name"
                type="text"
                required
                class="form-input"
                placeholder="e.g., doctor, nurse, admin"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Display Name *</label>
              <input
                v-model="roleForm.display_name"
                type="text"
                required
                class="form-input"
                placeholder="e.g., Doctor, Nurse, Administrator"
              >
            </div>

            <div class="form-group full-width">
              <label class="form-label">Description</label>
              <textarea
                v-model="roleForm.description"
                class="form-textarea"
                rows="2"
                placeholder="Describe the role's purpose and responsibilities"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeRoleForm" class="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="btn-primary"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
              {{ showEditRoleForm ? 'Update Role' : 'Create Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Permissions Modal -->
    <div v-if="showPermissionsModal" class="modal-overlay" @click="closePermissionsModal">
      <div class="modal-content modal-xl" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            Manage Permissions: {{ selectedRole?.display_name }}
          </h3>
          <button @click="closePermissionsModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="permissions-manager">
            <div class="permissions-filters">
              <div class="filter-group">
                <label class="filter-label">Filter by Module</label>
                <select v-model="permissionFilter" class="select-field">
                  <option value="">All Modules</option>
                  <option v-for="module in modules" :key="module" :value="module">
                    {{ formatModuleName(module) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="permissions-selection">
              <div 
                v-for="(modulePermissions, module) in filteredPermissionsByModule" 
                :key="module"
                class="module-permissions"
              >
                <div class="module-header">
                  <h4 class="module-title">
                    <i :class="getModuleIcon(module)" class="mr-2"></i>
                    {{ formatModuleName(module) }}
                  </h4>
                  <div class="module-actions">
                    <button 
                      @click="selectAllModulePermissions(module)"
                      class="btn-select-all"
                    >
                      Select All
                    </button>
                    <button 
                      @click="deselectAllModulePermissions(module)"
                      class="btn-deselect-all"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div class="permissions-list">
                  <div 
                    v-for="permission in modulePermissions" 
                    :key="permission.id"
                    class="permission-item"
                  >
                    <input
                      type="checkbox"
                      :id="`permission-${permission.id}`"
                      v-model="selectedPermissions"
                      :value="permission.id"
                      class="permission-checkbox"
                    >
                    <label :for="`permission-${permission.id}`" class="permission-label">
                      <span class="permission-name">{{ permission.display_name }}</span>
                      <span class="permission-description">{{ permission.description }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closePermissionsModal" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="savePermissions"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
            Save Permissions
          </button>
        </div>
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
            Are you sure you want to delete role <strong>{{ roleToDelete?.display_name }}</strong>?
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
            Delete Role
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRolePermissions } from '@/scripts/admin/rolePermissions'

// Get role permissions functionality
const {
  loading,
  error,
  roles,
  // permissions,
  permissionsByModule,
  filteredPermissionsByModule,
  modules,
  statistics,
  activeTab,
  showCreateRoleForm,
  showEditRoleForm,
  showPermissionsModal,
  showDeleteModal,
  selectedRole,
  roleToDelete,
  isSubmitting,
  isDeleting,
  roleFilters,
  permissionFilters,
  permissionFilter,
  roleForm,
  selectedPermissions,
  loadRoles,
  loadPermissions,
  // loadStatistics,
  debouncedRoleSearch,
  debouncedPermissionSearch,
  editRole,
  deleteRole,
  confirmDelete,
  closeRoleForm,
  closeDeleteModal,
  submitRoleForm,
  managePermissions,
  closePermissionsModal,
  savePermissions,
  selectAllModulePermissions,
  deselectAllModulePermissions,
  cloneRole,
  initializeDefaults,
  formatModuleName,
  getModuleIcon,
  onMountedHandler
} = useRolePermissions()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/admin/rolePermissions.css';
</style>
