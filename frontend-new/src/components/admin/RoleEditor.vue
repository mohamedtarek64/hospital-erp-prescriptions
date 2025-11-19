<template>
  <div class="role-editor">
    <div class="editor-header">
      <h3 class="editor-title">
        <i class="fas fa-shield-alt mr-2 text-blue-500"></i>
        Role Editor
      </h3>
      <div class="editor-actions">
        <button @click="$emit('save')" class="btn-save" :disabled="!hasChanges">
          <i class="fas fa-save mr-2"></i>
          Save Changes
        </button>
        <button @click="$emit('cancel')" class="btn-cancel">
          <i class="fas fa-times mr-2"></i>
          Cancel
        </button>
      </div>
    </div>

    <div class="editor-content">
      <!-- Role Information -->
      <div class="role-info-section">
        <h4 class="section-title">Role Information</h4>
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
      </div>

      <!-- Permissions -->
      <div class="permissions-section">
        <div class="section-header">
          <h4 class="section-title">Permissions</h4>
          <div class="section-actions">
            <button @click="selectAllPermissions" class="btn-select-all">
              <i class="fas fa-check-double mr-2"></i>
              Select All
            </button>
            <button @click="deselectAllPermissions" class="btn-deselect-all">
              <i class="fas fa-times mr-2"></i>
              Deselect All
            </button>
          </div>
        </div>

        <div class="permissions-container">
          <div 
            v-for="(modulePermissions, module) in permissionsByModule" 
            :key="module"
            class="module-section"
          >
            <div class="module-header">
              <div class="module-info">
                <h5 class="module-title">
                  <i :class="getModuleIcon(module)" class="mr-2"></i>
                  {{ formatModuleName(module) }}
                </h5>
                <span class="module-count">
                  {{ getSelectedCount(module) }}/{{ modulePermissions.length }} selected
                </span>
              </div>
              <div class="module-actions">
                <button @click="selectModulePermissions(module)" class="btn-module-select">
                  Select All
                </button>
                <button @click="deselectModulePermissions(module)" class="btn-module-deselect">
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
                  <div class="permission-info">
                    <span class="permission-name">{{ permission.display_name }}</span>
                    <span class="permission-key">{{ permission.name }}</span>
                  </div>
                  <p class="permission-description">{{ permission.description || 'No description' }}</p>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Statistics -->
      <div class="role-stats-section">
        <h4 class="section-title">Role Statistics</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon bg-blue-100">
              <i class="fas fa-key text-blue-600"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ selectedPermissions.length }}</span>
              <span class="stat-label">Selected Permissions</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon bg-green-100">
              <i class="fas fa-layer-group text-green-600"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ Object.keys(permissionsByModule).length }}</span>
              <span class="stat-label">Modules</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon bg-purple-100">
              <i class="fas fa-users text-purple-600"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ role?.users?.length || 0 }}</span>
              <span class="stat-label">Users with this Role</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <h4 class="error-title">Error</h4>
        <p class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoleEditor } from '@/scripts/admin/roleEditor'

/**
 * Component props
 */
const props = defineProps({
  role: {
    type: Object,
    default: null
  },
  permissions: {
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
const emit = defineEmits(['save', 'cancel'])

// Get role editor functionality
const {
  roleForm,
  selectedPermissions,
  permissionsByModule,
  hasChanges,
  selectAllPermissions,
  deselectAllPermissions,
  selectModulePermissions,
  deselectModulePermissions,
  getSelectedCount,
  getModuleIcon,
  formatModuleName
} = useRoleEditor(props, emit)
</script>

<style scoped>
@import '@/assets/css/admin/roleEditor.css';
</style>
