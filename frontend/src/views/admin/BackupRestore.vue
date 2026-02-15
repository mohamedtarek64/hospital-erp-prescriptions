<template>
  <div class="backup-restore">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-archive mr-3 text-blue-600"></i>
          Backup & Restore
        </h1>
        <p class="page-subtitle">Manage system backups and restore data</p>
      </div>
      <div class="header-actions">
        <button 
          @click="showCreateBackupModal = true"
          class="btn-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Create Backup
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100">
            <i class="fas fa-archive text-blue-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.total_backups || 0 }}</h3>
            <p class="stat-label">Total Backups</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100">
            <i class="fas fa-check-circle text-green-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.completed_backups || 0 }}</h3>
            <p class="stat-label">Completed</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-red-100">
            <i class="fas fa-times-circle text-red-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics?.failed_backups || 0 }}</h3>
            <p class="stat-label">Failed</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100">
            <i class="fas fa-hdd text-purple-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ formatBytes(statistics?.total_size || 0) }}</h3>
            <p class="stat-label">Total Size</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-bolt mr-2 text-yellow-500"></i>
          Quick Actions
        </h2>
      </div>
      <div class="actions-grid">
        <button @click="createDatabaseBackup" class="action-card">
          <div class="action-icon bg-blue-100">
            <i class="fas fa-database text-blue-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Database Backup</h4>
            <p class="action-description">Create a database-only backup</p>
          </div>
        </button>

        <button @click="createFilesBackup" class="action-card">
          <div class="action-icon bg-green-100">
            <i class="fas fa-folder text-green-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Files Backup</h4>
            <p class="action-description">Backup uploaded files and logs</p>
          </div>
        </button>

        <button @click="createCompleteBackup" class="action-card">
          <div class="action-icon bg-purple-100">
            <i class="fas fa-server text-purple-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Complete Backup</h4>
            <p class="action-description">Full system backup</p>
          </div>
        </button>

        <button @click="cleanOldBackups" class="action-card">
          <div class="action-icon bg-orange-100">
            <i class="fas fa-broom text-orange-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Clean Old Backups</h4>
            <p class="action-description">Remove backups older than 30 days</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Backups List -->
    <div class="backups-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-list mr-2 text-blue-500"></i>
          Backup History
        </h2>
        <div class="section-actions">
          <button @click="loadBackups" class="btn-secondary">
            <i class="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>
      </div>

      <div class="backups-container">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <span>Loading backups...</span>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ error }}</span>
          <button @click="loadBackups" class="btn-retry">
            <i class="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>

        <div v-else-if="backups.length === 0" class="empty-state">
          <i class="fas fa-archive text-gray-400"></i>
          <h3 class="empty-title">No Backups Found</h3>
          <p class="empty-description">Create your first backup to get started</p>
          <button @click="showCreateBackupModal = true" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            Create First Backup
          </button>
        </div>

        <div v-else class="backups-list">
          <div 
            v-for="backup in backups" 
            :key="backup.id"
            class="backup-card"
          >
            <div class="backup-header">
              <div class="backup-info">
                <h4 class="backup-name">{{ backup.filename }}</h4>
                <p class="backup-meta">
                  Created by {{ backup.creator?.name || 'System' }} • 
                  {{ formatDate(backup.created_at) }}
                </p>
              </div>
              <div class="backup-badges">
                <span 
                  class="type-badge"
                  :class="getTypeClass(backup.type)"
                >
                  <i :class="getTypeIcon(backup.type)" class="mr-1"></i>
                  {{ getTypeLabel(backup.type) }}
                </span>
                <span 
                  class="status-badge"
                  :class="getStatusClass(backup.status)"
                >
                  <i :class="getStatusIcon(backup.status)" class="mr-1"></i>
                  {{ getStatusLabel(backup.status) }}
                </span>
              </div>
            </div>

            <div class="backup-details">
              <div class="detail-item">
                <i class="fas fa-weight-hanging mr-2"></i>
                <span>{{ formatBytes(backup.file_size) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-clock mr-2"></i>
                <span>{{ getAgeText(backup.created_at) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-user mr-2"></i>
                <span>{{ backup.creator?.name || 'System' }}</span>
              </div>
            </div>

            <div class="backup-actions">
              <button 
                v-if="backup.status === 'completed'"
                @click="downloadBackup(backup)"
                class="btn-action btn-download"
                title="Download Backup"
              >
                <i class="fas fa-download"></i>
              </button>
              <button 
                v-if="backup.status === 'completed' && backup.type === 'full'"
                @click="restoreBackup(backup)"
                class="btn-action btn-restore"
                title="Restore Backup"
              >
                <i class="fas fa-undo"></i>
              </button>
              <button 
                @click="deleteBackup(backup)"
                class="btn-action btn-delete"
                title="Delete Backup"
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
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} backups
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

    <!-- Create Backup Modal -->
    <div v-if="showCreateBackupModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-plus mr-2"></i>
            Create New Backup
          </h3>
          <button @click="closeCreateModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="backup-options">
            <div class="option-card" @click="selectBackupType('full')" :class="{ 'selected': backupForm.type === 'full' }">
              <div class="option-icon bg-purple-100">
                <i class="fas fa-server text-purple-600"></i>
              </div>
              <div class="option-content">
                <h4 class="option-title">Complete Backup</h4>
                <p class="option-description">Database + Files + Configuration</p>
              </div>
            </div>

            <div class="option-card" @click="selectBackupType('database')" :class="{ 'selected': backupForm.type === 'database' }">
              <div class="option-icon bg-blue-100">
                <i class="fas fa-database text-blue-600"></i>
              </div>
              <div class="option-content">
                <h4 class="option-title">Database Only</h4>
                <p class="option-description">All database tables and data</p>
              </div>
            </div>

            <div class="option-card" @click="selectBackupType('files')" :class="{ 'selected': backupForm.type === 'files' }">
              <div class="option-icon bg-green-100">
                <i class="fas fa-folder text-green-600"></i>
              </div>
              <div class="option-content">
                <h4 class="option-title">Files Only</h4>
                <p class="option-description">Uploaded files and logs</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeCreateModal" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="createBackup"
            :disabled="!backupForm.type || isCreating"
            class="btn-primary"
          >
            <i v-if="isCreating" class="fas fa-spinner fa-spin mr-2"></i>
            Create Backup
          </button>
        </div>
      </div>
    </div>

    <!-- Restore Confirmation Modal -->
    <div v-if="showRestoreModal" class="modal-overlay" @click="closeRestoreModal">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title text-orange-600">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Confirm Restore
          </h3>
        </div>
        <div class="modal-body">
          <p class="restore-message">
            Are you sure you want to restore from backup <strong>{{ backupToRestore?.filename }}</strong>?
            This will replace all current data and cannot be undone.
          </p>
          <div class="warning-box">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <span>Make sure to create a current backup before proceeding!</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeRestoreModal" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="confirmRestore"
            :disabled="isRestoring"
            class="btn-warning"
          >
            <i v-if="isRestoring" class="fas fa-spinner fa-spin mr-2"></i>
            Restore Backup
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
            Are you sure you want to delete backup <strong>{{ backupToDelete?.filename }}</strong>?
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
            Delete Backup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBackupRestore } from '@/scripts/admin/backupRestore'

// Get backup restore functionality
const {
  loading,
  error,
  backups,
  statistics,
  pagination,
  showCreateBackupModal,
  showRestoreModal,
  showDeleteModal,
  backupToRestore,
  backupToDelete,
  isCreating,
  isRestoring,
  isDeleting,
  backupForm,
  loadBackups,
  // loadStatistics,
  changePage,
  createBackup,
  createDatabaseBackup,
  createFilesBackup,
  createCompleteBackup,
  selectBackupType,
  closeCreateModal,
  downloadBackup,
  restoreBackup,
  closeRestoreModal,
  confirmRestore,
  deleteBackup,
  closeDeleteModal,
  confirmDelete,
  cleanOldBackups,
  getTypeClass,
  getTypeIcon,
  getTypeLabel,
  getStatusClass,
  getStatusIcon,
  getStatusLabel,
  formatBytes,
  formatDate,
  getAgeText,
  onMountedHandler
} = useBackupRestore()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/admin/backupRestore.css';
</style>
