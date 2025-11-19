<template>
  <div class="system-logs">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-file-alt mr-3 text-blue-600"></i>
          System Logs
        </h1>
        <p class="page-subtitle">Monitor system activity and user actions</p>
      </div>
      <div class="header-actions">
        <button 
          @click="exportLogs"
          class="btn-secondary"
        >
          <i class="fas fa-download mr-2"></i>
          Export
        </button>
        <button 
          @click="cleanOldLogs"
          class="btn-warning"
        >
          <i class="fas fa-broom mr-2"></i>
          Clean Old Logs
        </button>
      </div>
    </div>

    <!-- Filters -->
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
              placeholder="Search logs..."
              class="input-field"
            >
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">User</label>
          <select v-model="filters.user_id" @change="loadLogs" class="select-field">
            <option value="">All Users</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Action</label>
          <select v-model="filters.action" @change="loadLogs" class="select-field">
            <option value="">All Actions</option>
            <option v-for="(label, action) in availableActions" :key="action" :value="action">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Module</label>
          <select v-model="filters.module" @change="loadLogs" class="select-field">
            <option value="">All Modules</option>
            <option v-for="(label, module) in availableModules" :key="module" :value="module">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Start Date</label>
          <input
            v-model="filters.start_date"
            type="date"
            @change="loadLogs"
            class="input-field"
          >
        </div>

        <div class="filter-group">
          <label class="filter-label">End Date</label>
          <input
            v-model="filters.end_date"
            type="date"
            @change="loadLogs"
            class="input-field"
          >
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="btn-secondary">
            <i class="fas fa-times mr-2"></i>
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="logs-section">
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <span>Loading logs...</span>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ error }}</span>
          <button @click="loadLogs" class="btn-retry">
            <i class="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>

        <div v-else-if="logs.length === 0" class="empty-state">
          <i class="fas fa-file-alt text-gray-400"></i>
          <h3 class="empty-title">No Logs Found</h3>
          <p class="empty-description">No logs match your current filters</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="table-header">Time</th>
                <th class="table-header">User</th>
                <th class="table-header">Action</th>
                <th class="table-header">Module</th>
                <th class="table-header">Description</th>
                <th class="table-header">IP Address</th>
                <th class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id" class="table-row">
                <td class="table-cell">
                  <div class="time-info">
                    <span class="time-date">{{ formatDate(log.created_at) }}</span>
                    <span class="time-time">{{ formatTime(log.created_at) }}</span>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="user-info">
                    <div class="user-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ log.user?.name || 'System' }}</span>
                      <span v-if="log.user?.email" class="user-email">{{ log.user.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <span 
                    class="action-badge"
                    :class="getActionClass(log.action)"
                  >
                    <i :class="getActionIcon(log.action)" class="mr-1"></i>
                    {{ getActionLabel(log.action) }}
                  </span>
                </td>
                <td class="table-cell">
                  <span 
                    class="module-badge"
                    :class="getModuleClass(log.module)"
                  >
                    <i :class="getModuleIcon(log.module)" class="mr-1"></i>
                    {{ getModuleLabel(log.module) }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="description-content">
                    <p class="description-text">{{ log.description }}</p>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="ip-address">{{ log.ip_address || 'N/A' }}</span>
                </td>
                <td class="table-cell">
                  <div class="action-buttons">
                    <button 
                      @click="viewLogDetails(log)"
                      class="btn-action btn-view"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i>
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
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} logs
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

    <!-- Log Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content modal-lg" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-info-circle mr-2"></i>
            Log Details
          </h3>
          <button @click="closeDetailsModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="selectedLog" class="log-details">
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">ID</label>
                <span class="detail-value">{{ selectedLog.id }}</span>
              </div>

              <div class="detail-item">
                <label class="detail-label">Timestamp</label>
                <span class="detail-value">{{ formatDateTime(selectedLog.created_at) }}</span>
              </div>

              <div class="detail-item">
                <label class="detail-label">User</label>
                <span class="detail-value">{{ selectedLog.user?.name || 'System' }}</span>
              </div>

              <div class="detail-item">
                <label class="detail-label">Action</label>
                <span 
                  class="detail-value action-badge"
                  :class="getActionClass(selectedLog.action)"
                >
                  <i :class="getActionIcon(selectedLog.action)" class="mr-1"></i>
                  {{ getActionLabel(selectedLog.action) }}
                </span>
              </div>

              <div class="detail-item">
                <label class="detail-label">Module</label>
                <span 
                  class="detail-value module-badge"
                  :class="getModuleClass(selectedLog.module)"
                >
                  <i :class="getModuleIcon(selectedLog.module)" class="mr-1"></i>
                  {{ getModuleLabel(selectedLog.module) }}
                </span>
              </div>

              <div class="detail-item">
                <label class="detail-label">IP Address</label>
                <span class="detail-value">{{ selectedLog.ip_address || 'N/A' }}</span>
              </div>

              <div class="detail-item full-width">
                <label class="detail-label">Description</label>
                <p class="detail-value description">{{ selectedLog.description }}</p>
              </div>

              <div v-if="selectedLog.user_agent" class="detail-item full-width">
                <label class="detail-label">User Agent</label>
                <p class="detail-value user-agent">{{ selectedLog.user_agent }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Clean Logs Confirmation Modal -->
    <div v-if="showCleanModal" class="modal-overlay" @click="closeCleanModal">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title text-orange-600">
            <i class="fas fa-broom mr-2"></i>
            Clean Old Logs
          </h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Delete logs older than (days)</label>
            <input
              v-model="cleanDays"
              type="number"
              min="1"
              max="365"
              class="form-input"
              placeholder="90"
            >
          </div>
          <p class="warning-message">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            This action cannot be undone. Old logs will be permanently deleted.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeCleanModal" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="confirmCleanLogs"
            :disabled="isCleaning"
            class="btn-warning"
          >
            <i v-if="isCleaning" class="fas fa-spinner fa-spin mr-2"></i>
            Clean Logs
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSystemLogs } from '@/scripts/admin/systemLogs'

// Get system logs functionality
const {
  loading,
  error,
  logs,
  users,
  pagination,
  showDetailsModal,
  showCleanModal,
  selectedLog,
  isCleaning,
  filters,
  cleanDays,
  availableActions,
  availableModules,
  loadLogs,
  // loadUsers,
  debouncedSearch,
  clearFilters,
  changePage,
  viewLogDetails,
  closeDetailsModal,
  cleanOldLogs,
  closeCleanModal,
  confirmCleanLogs,
  exportLogs,
  getActionClass,
  getActionIcon,
  getActionLabel,
  getModuleClass,
  getModuleIcon,
  getModuleLabel,
  formatDate,
  formatTime,
  formatDateTime,
  onMountedHandler
} = useSystemLogs()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/admin/systemLogs.css';
</style>
