import { ref, reactive } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { formatBytes } from '@/utils/adminHelpers'

/**
 * Backup Restore Composable
 * 
 * Manages backup and restore functionality
 */
export const useBackupRestore = () => {
  // Store
  const adminStore = useAdminStore()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const backups = ref([])
  const statistics = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  })
  
  // UI state
  const showCreateBackupModal = ref(false)
  const showRestoreModal = ref(false)
  const showDeleteModal = ref(false)
  const backupToRestore = ref(null)
  const backupToDelete = ref(null)
  const isCreating = ref(false)
  const isRestoring = ref(false)
  const isDeleting = ref(false)
  
  // Form data
  const backupForm = reactive({
    type: ''
  })

  // Methods
  const loadBackups = async () => {
    try {
      loading.value = true
      error.value = null
      
      const params = {
        page: pagination.value.current_page,
        per_page: pagination.value.per_page
      }
      
      await adminStore.loadBackups(params)
      backups.value = adminStore.getBackups
      pagination.value = adminStore.getBackupsPagination
    } catch (err) {
      error.value = err.message || 'Failed to load backups'
    } finally {
      loading.value = false
    }
  }

  const loadStatistics = async () => {
    try {
      await adminStore.loadBackupStats()
      statistics.value = adminStore.getBackupStats
    } catch (err) {
      console.error('Failed to load backup statistics:', err)
    }
  }

  const changePage = (page) => {
    pagination.value.current_page = page
    loadBackups()
  }

  const createBackup = async () => {
    try {
      isCreating.value = true
      const result = await adminStore.createBackup(backupForm.type)
      
      if (result.success) {
        showCreateBackupModal.value = false
        backupForm.type = ''
        await loadBackups()
        await loadStatistics()
        // Show success message
        console.log('Backup created successfully')
      } else {
        error.value = result.error || 'Failed to create backup'
      }
    } catch (err) {
      error.value = err.message || 'Failed to create backup'
    } finally {
      isCreating.value = false
    }
  }

  const createDatabaseBackup = async () => {
    backupForm.type = 'database'
    await createBackup()
  }

  const createFilesBackup = async () => {
    backupForm.type = 'files'
    await createBackup()
  }

  const createCompleteBackup = async () => {
    backupForm.type = 'full'
    await createBackup()
  }

  const selectBackupType = (type) => {
    backupForm.type = type
  }

  const closeCreateModal = () => {
    showCreateBackupModal.value = false
    backupForm.type = ''
  }

  const downloadBackup = async (backup) => {
    try {
      loading.value = true
      const result = await adminStore.downloadBackup(backup.id)
      
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = backup.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        error.value = result.error || 'Failed to download backup'
      }
    } catch (err) {
      error.value = err.message || 'Failed to download backup'
    } finally {
      loading.value = false
    }
  }

  const restoreBackup = (backup) => {
    backupToRestore.value = backup
    showRestoreModal.value = true
  }

  const closeRestoreModal = () => {
    showRestoreModal.value = false
    backupToRestore.value = null
  }

  const confirmRestore = async () => {
    if (!backupToRestore.value) return
    
    try {
      isRestoring.value = true
      const result = await adminStore.restoreBackup(backupToRestore.value.id)
      
      if (result.success) {
        showRestoreModal.value = false
        backupToRestore.value = null
        // Show success message
        console.log('Backup restored successfully')
      } else {
        error.value = result.error || 'Failed to restore backup'
      }
    } catch (err) {
      error.value = err.message || 'Failed to restore backup'
    } finally {
      isRestoring.value = false
    }
  }

  const deleteBackup = (backup) => {
    backupToDelete.value = backup
    showDeleteModal.value = true
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    backupToDelete.value = null
  }

  const confirmDelete = async () => {
    if (!backupToDelete.value) return
    
    try {
      isDeleting.value = true
      const result = await adminStore.deleteBackup(backupToDelete.value.id)
      
      if (result.success) {
        showDeleteModal.value = false
        backupToDelete.value = null
        await loadBackups()
        await loadStatistics()
      } else {
        error.value = result.error || 'Failed to delete backup'
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete backup'
    } finally {
      isDeleting.value = false
    }
  }

  const cleanOldBackups = async () => {
    try {
      loading.value = true
      // Implement clean old backups logic
      console.log('Clean old backups')
      await loadBackups()
      await loadStatistics()
    } catch (err) {
      error.value = err.message || 'Failed to clean old backups'
    } finally {
      loading.value = false
    }
  }

  const getTypeClass = (type) => {
    const classes = {
      full: 'bg-purple-100 text-purple-800',
      incremental: 'bg-blue-100 text-blue-800',
      differential: 'bg-indigo-100 text-indigo-800',
      manual: 'bg-green-100 text-green-800',
      automatic: 'bg-orange-100 text-orange-800'
    }
    return classes[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type) => {
    const icons = {
      full: 'fas fa-server',
      incremental: 'fas fa-plus-circle',
      differential: 'fas fa-layer-group',
      manual: 'fas fa-hand-paper',
      automatic: 'fas fa-robot'
    }
    return icons[type] || 'fas fa-archive'
  }

  const getTypeLabel = (type) => {
    const labels = {
      full: 'Full Backup',
      incremental: 'Incremental',
      differential: 'Differential',
      manual: 'Manual',
      automatic: 'Automatic'
    }
    return labels[type] || type
  }

  const getStatusClass = (status) => {
    const classes = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      completed: 'fas fa-check-circle',
      failed: 'fas fa-times-circle',
      in_progress: 'fas fa-spinner',
      scheduled: 'fas fa-calendar',
      cancelled: 'fas fa-ban'
    }
    return icons[status] || 'fas fa-question-circle'
  }

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completed',
      failed: 'Failed',
      in_progress: 'In Progress',
      scheduled: 'Scheduled',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  const getAgeText = (date) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  const onMountedHandler = () => {
    loadBackups()
    loadStatistics()
  }

  return {
    // Reactive data
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

    // Methods
    loadBackups,
    loadStatistics,
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
  }
}
