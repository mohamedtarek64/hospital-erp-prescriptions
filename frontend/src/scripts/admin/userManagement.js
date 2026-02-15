import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { debounce } from '@/utils/adminHelpers'

/**
 * User Management Composable
 * 
 * Manages user management functionality
 */
export const useUserManagement = () => {
  // Router
  const router = useRouter()
  
  // Store
  const adminStore = useAdminStore()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const users = ref([])
  const roles = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  })
  
  // UI state
  const selectedUsers = ref([])
  const selectAll = ref(false)
  const showCreateForm = ref(false)
  const showEditForm = ref(false)
  const showDeleteModal = ref(false)
  const userToDelete = ref(null)
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  
  // Filters
  const filters = reactive({
    search: '',
    role: '',
    status: ''
  })
  
  // Form data
  const form = reactive({
    name: '',
    email: '',
    password: '',
    roles: [],
    status: 'active'
  })

  // Methods
  const loadUsers = async () => {
    try {
      loading.value = true
      error.value = null
      
      const params = {
        page: pagination.value.current_page,
        per_page: pagination.value.per_page,
        ...filters
      }
      
      await adminStore.loadUsers(params)
      users.value = adminStore.getUsers
      pagination.value = adminStore.getUsersPagination
    } catch (err) {
      error.value = err.message || 'Failed to load users'
    } finally {
      loading.value = false
    }
  }

  const loadRoles = async () => {
    try {
      // This would typically load from a roles store
      // For now, we'll use mock data
      roles.value = [
        { id: 1, name: 'admin', display_name: 'Administrator' },
        { id: 2, name: 'doctor', display_name: 'Doctor' },
        { id: 3, name: 'nurse', display_name: 'Nurse' },
        { id: 4, name: 'receptionist', display_name: 'Receptionist' }
      ]
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  const debouncedSearch = debounce(() => {
    pagination.value.current_page = 1
    loadUsers()
  }, 500)

  const clearFilters = () => {
    filters.search = ''
    filters.role = ''
    filters.status = ''
    pagination.value.current_page = 1
    loadUsers()
  }

  const changePage = (page) => {
    pagination.value.current_page = page
    loadUsers()
  }

  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedUsers.value = users.value.map(user => user.id)
    } else {
      selectedUsers.value = []
    }
  }

  const editUser = (user) => {
    form.name = user.name
    form.email = user.email
    form.roles = user.roles?.map(role => role.id) || []
    form.status = user.status
    showEditForm.value = true
  }

  const viewUser = (user) => {
    router.push(`/admin/users/${user.id}`)
  }

  const deleteUser = (user) => {
    userToDelete.value = user
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!userToDelete.value) return
    
    try {
      isDeleting.value = true
      const result = await adminStore.deleteUser(userToDelete.value.id)
      
      if (result.success) {
        showDeleteModal.value = false
        userToDelete.value = null
        await loadUsers()
      } else {
        error.value = result.error || 'Failed to delete user'
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete user'
    } finally {
      isDeleting.value = false
    }
  }

  const closeForm = () => {
    showCreateForm.value = false
    showEditForm.value = false
    resetForm()
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    userToDelete.value = null
  }

  const resetForm = () => {
    form.name = ''
    form.email = ''
    form.password = ''
    form.roles = []
    form.status = 'active'
  }

  const submitForm = async () => {
    try {
      isSubmitting.value = true
      
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        roles: form.roles,
        status: form.status
      }
      
      let result
      if (showEditForm.value) {
        // Update existing user
        const userId = users.value.find(u => u.email === form.email)?.id
        result = await adminStore.updateUser(userId, userData)
      } else {
        // Create new user
        result = await adminStore.createUser(userData)
      }
      
      if (result.success) {
        closeForm()
        await loadUsers()
      } else {
        error.value = result.error || 'Failed to save user'
      }
    } catch (err) {
      error.value = err.message || 'Failed to save user'
    } finally {
      isSubmitting.value = false
    }
  }

  const bulkActivate = async (userIds) => {
    try {
      loading.value = true
      // Implement bulk activate logic
      console.log('Bulk activate users:', userIds)
      await loadUsers()
    } catch (err) {
      error.value = err.message || 'Failed to activate users'
    } finally {
      loading.value = false
    }
  }

  const bulkDeactivate = async (userIds) => {
    try {
      loading.value = true
      // Implement bulk deactivate logic
      console.log('Bulk deactivate users:', userIds)
      await loadUsers()
    } catch (err) {
      error.value = err.message || 'Failed to deactivate users'
    } finally {
      loading.value = false
    }
  }

  const bulkDelete = async (userIds) => {
    try {
      loading.value = true
      // Implement bulk delete logic
      console.log('Bulk delete users:', userIds)
      await loadUsers()
    } catch (err) {
      error.value = err.message || 'Failed to delete users'
    } finally {
      loading.value = false
    }
  }

  const getStatusClass = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getStatusIcon = (status) => {
    return status === 'active' 
      ? 'fas fa-check-circle' 
      : 'fas fa-times-circle'
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  const onMountedHandler = () => {
    loadUsers()
    loadRoles()
  }

  return {
    // Reactive data
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

    // Methods
    loadUsers,
    loadRoles,
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
  }
}
