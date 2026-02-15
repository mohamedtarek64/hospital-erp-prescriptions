<template>
  <div class="system-settings">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-cog mr-3 text-blue-600"></i>
          System Settings
        </h1>
        <p class="page-subtitle">Configure system preferences and options</p>
      </div>
      <div class="header-actions">
        <button 
          @click="showCreateForm = true"
          class="btn-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Add Setting
        </button>
        <button 
          @click="resetToDefaults"
          class="btn-secondary"
        >
          <i class="fas fa-undo mr-2"></i>
          Reset to Defaults
        </button>
      </div>
    </div>

    <!-- Settings Categories -->
    <div class="categories-section">
      <div class="categories-tabs">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="selectedCategory = category"
          :class="['category-tab', { 'active': selectedCategory === category }]"
        >
          <i :class="getCategoryIcon(category)" class="mr-2"></i>
          {{ formatCategoryName(category) }}
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
              placeholder="Search settings..."
              class="input-field"
            >
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Type</label>
          <select v-model="filters.type" @change="loadSettings" class="select-field">
            <option value="">All Types</option>
            <option v-for="type in types" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Visibility</label>
          <select v-model="filters.is_public" @change="loadSettings" class="select-field">
            <option value="">All</option>
            <option :value="true">Public</option>
            <option :value="false">Private</option>
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

    <!-- Settings List -->
    <div class="settings-section">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin text-blue-500"></i>
        <span>Loading settings...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <span>{{ error }}</span>
        <button @click="loadSettings" class="btn-retry">
          <i class="fas fa-redo mr-2"></i>
          Retry
        </button>
      </div>

      <div v-else-if="settings.length === 0" class="empty-state">
        <i class="fas fa-cog text-gray-400"></i>
        <h3 class="empty-title">No Settings Found</h3>
        <p class="empty-description">No settings match your current filters</p>
        <button @click="showCreateForm = true" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>
          Add First Setting
        </button>
      </div>

      <div v-else class="settings-grid">
        <div 
          v-for="setting in settings" 
          :key="setting.id"
          class="setting-card"
        >
          <div class="setting-header">
            <div class="setting-info">
              <h4 class="setting-key">{{ setting.key }}</h4>
              <p class="setting-description">{{ setting.description || 'No description' }}</p>
            </div>
            <div class="setting-badges">
              <span class="type-badge" :class="getTypeClass(setting.type)">
                {{ setting.type }}
              </span>
              <span 
                class="visibility-badge"
                :class="setting.is_public ? 'public' : 'private'"
              >
                <i :class="setting.is_public ? 'fas fa-eye' : 'fas fa-eye-slash'" class="mr-1"></i>
                {{ setting.is_public ? 'Public' : 'Private' }}
              </span>
            </div>
          </div>

          <div class="setting-content">
            <div class="setting-value">
              <label class="value-label">Current Value:</label>
              <div class="value-display">
                <input
                  v-if="setting.type === 'boolean'"
                  type="checkbox"
                  :checked="getBooleanValue(setting.value)"
                  @change="updateSetting(setting, $event.target.checked)"
                  class="boolean-input"
                >
                <input
                  v-else-if="setting.type === 'integer' || setting.type === 'float'"
                  type="number"
                  :value="setting.value"
                  @blur="updateSetting(setting, $event.target.value)"
                  class="number-input"
                >
                <textarea
                  v-else-if="setting.type === 'json'"
                  :value="formatJsonValue(setting.value)"
                  @blur="updateSetting(setting, $event.target.value)"
                  class="json-input"
                  rows="3"
                ></textarea>
                <input
                  v-else
                  type="text"
                  :value="setting.value"
                  @blur="updateSetting(setting, $event.target.value)"
                  class="text-input"
                >
              </div>
            </div>

            <div class="setting-meta">
              <span class="meta-item">
                <i class="fas fa-tag mr-1"></i>
                {{ setting.category }}
              </span>
              <span class="meta-item">
                <i class="fas fa-clock mr-1"></i>
                {{ formatDate(setting.updated_at) }}
              </span>
            </div>
          </div>

          <div class="setting-actions">
            <button 
              @click="editSetting(setting)"
              class="btn-action btn-edit"
              title="Edit Setting"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="resetSetting(setting)"
              class="btn-action btn-reset"
              title="Reset to Default"
            >
              <i class="fas fa-undo"></i>
            </button>
            <button 
              @click="deleteSetting(setting)"
              class="btn-action btn-delete"
              title="Delete Setting"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > pagination.per_page" class="pagination-section">
      <div class="pagination-info">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} settings
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

    <!-- Create/Edit Setting Modal -->
    <div v-if="showCreateForm || showEditForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showEditForm ? 'Edit Setting' : 'Create New Setting' }}
          </h3>
          <button @click="closeForm" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Key *</label>
              <input
                v-model="form.key"
                type="text"
                required
                class="form-input"
                placeholder="e.g., app_name"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Type *</label>
              <select v-model="form.type" required class="form-select">
                <option value="">Select Type</option>
                <option v-for="type in types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <input
                v-model="form.category"
                type="text"
                required
                class="form-input"
                placeholder="e.g., general, system, backup"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Value *</label>
              <textarea
                v-if="form.type === 'json'"
                v-model="form.value"
                required
                class="form-textarea"
                rows="4"
                placeholder="Enter JSON value"
              ></textarea>
              <input
                v-else
                v-model="form.value"
                type="text"
                required
                class="form-input"
                placeholder="Enter value"
              >
            </div>

            <div class="form-group full-width">
              <label class="form-label">Description</label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                rows="2"
                placeholder="Describe what this setting does"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Visibility</label>
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  id="is_public"
                  v-model="form.is_public"
                  class="checkbox"
                >
                <label for="is_public" class="checkbox-label">
                  Public (visible to all users)
                </label>
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
              {{ showEditForm ? 'Update Setting' : 'Create Setting' }}
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
            Are you sure you want to delete setting <strong>{{ settingToDelete?.key }}</strong>?
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
            Delete Setting
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSystemSettings } from '@/scripts/admin/systemSettings'

// Get system settings functionality
const {
  loading,
  error,
  settings,
  categories,
  types,
  pagination,
  selectedCategory,
  showCreateForm,
  showEditForm,
  showDeleteModal,
  settingToDelete,
  isSubmitting,
  isDeleting,
  filters,
  form,
  loadSettings,
  // loadCategories,
  // loadTypes,
  debouncedSearch,
  clearFilters,
  changePage,
  editSetting,
  deleteSetting,
  confirmDelete,
  closeForm,
  closeDeleteModal,
  submitForm,
  updateSetting,
  resetSetting,
  resetToDefaults,
  getCategoryIcon,
  formatCategoryName,
  getTypeClass,
  getBooleanValue,
  formatJsonValue,
  formatDate,
  onMountedHandler
} = useSystemSettings()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/admin/systemSettings.css';
</style>
