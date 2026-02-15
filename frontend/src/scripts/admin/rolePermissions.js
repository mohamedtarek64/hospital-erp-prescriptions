import { ref, reactive } from 'vue'
// import { useRouter } from 'vue-router'
import { debounce } from '@/utils/adminHelpers'

/**
 * Role Permissions Composable
 * 
 * Manages role and permissions functionality
 */
export const useRolePermissions = () => {
  // Router
  // const router = useRouter()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const roles = ref([])
  const permissions = ref([])
  const permissionsByModule = ref({})
  const filteredPermissionsByModule = ref({})
  const modules = ref([])
  const statistics = ref(null)
  
  // UI state
  const activeTab = ref('roles')
  const showCreateRoleForm = ref(false)
  const showEditRoleForm = ref(false)
  const showPermissionsModal = ref(false)
  const showDeleteModal = ref(false)
  const selectedRole = ref(null)
  const roleToDelete = ref(null)
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  
  // Filters
  const roleFilters = reactive({
    search: ''
  })
  
  const permissionFilters = reactive({
    search: '',
    module: ''
  })
  
  const permissionFilter = ref('')
  
  // Form data
  const roleForm = reactive({
    name: '',
    display_name: '',
    description: ''
  })
  
  const selectedPermissions = ref([])

  // Methods
  const loadRoles = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Mock data - replace with actual API call
      roles.value = [
        {
          id: 1,
          name: 'admin',
          display_name: 'Administrator',
          description: 'Full system access',
          permissions: [
            { id: 1, name: 'admin.view', display_name: 'View Admin Panel' },
            { id: 2, name: 'admin.users', display_name: 'Manage Users' }
          ],
          users: []
        },
        {
          id: 2,
          name: 'doctor',
          display_name: 'Doctor',
          description: 'Medical staff access',
          permissions: [
            { id: 3, name: 'patients.view', display_name: 'View Patients' },
            { id: 4, name: 'medical_records.view', display_name: 'View Medical Records' }
          ],
          users: []
        }
      ]
    } catch (err) {
      error.value = err.message || 'Failed to load roles'
    } finally {
      loading.value = false
    }
  }

  const loadPermissions = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Mock data - replace with actual API call
      const mockPermissions = [
        { id: 1, name: 'admin.view', display_name: 'View Admin Panel', description: 'Access administration panel', module: 'admin' },
        { id: 2, name: 'admin.users', display_name: 'Manage Users', description: 'Create and manage user accounts', module: 'admin' },
        { id: 3, name: 'patients.view', display_name: 'View Patients', description: 'View patient information', module: 'patients' },
        { id: 4, name: 'patients.create', display_name: 'Create Patients', description: 'Add new patients', module: 'patients' },
        { id: 5, name: 'medical_records.view', display_name: 'View Medical Records', description: 'Access patient medical records', module: 'medical_records' },
        { id: 6, name: 'medical_records.create', display_name: 'Create Medical Records', description: 'Add new medical records', module: 'medical_records' }
      ]
      
      permissions.value = mockPermissions
      
      // Group permissions by module
      permissionsByModule.value = mockPermissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = []
        }
        acc[permission.module].push(permission)
        return acc
      }, {})
      
      // Get unique modules
      modules.value = [...new Set(mockPermissions.map(p => p.module))]
      
      // Set filtered permissions
      filteredPermissionsByModule.value = permissionsByModule.value
    } catch (err) {
      error.value = err.message || 'Failed to load permissions'
    } finally {
      loading.value = false
    }
  }

  const loadStatistics = async () => {
    try {
      // Mock statistics
      statistics.value = {
        total_roles: roles.value.length,
        total_permissions: permissions.value.length,
        modules: modules.value,
        roles_with_users: roles.value.filter(r => r.users.length > 0).length,
        unused_roles: roles.value.filter(r => r.users.length === 0).length
      }
    } catch (err) {
      console.error('Failed to load statistics:', err)
    }
  }

  const debouncedRoleSearch = debounce(() => {
    loadRoles()
  }, 500)

  const debouncedPermissionSearch = debounce(() => {
    loadPermissions()
  }, 500)

  const editRole = (role) => {
    roleForm.name = role.name
    roleForm.display_name = role.display_name
    roleForm.description = role.description || ''
    showEditRoleForm.value = true
  }

  const deleteRole = (role) => {
    roleToDelete.value = role
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!roleToDelete.value) return
    
    try {
      isDeleting.value = true
      // Implement delete role logic
      console.log('Delete role:', roleToDelete.value)
      await loadRoles()
      showDeleteModal.value = false
      roleToDelete.value = null
    } catch (err) {
      error.value = err.message || 'Failed to delete role'
    } finally {
      isDeleting.value = false
    }
  }

  const closeRoleForm = () => {
    showCreateRoleForm.value = false
    showEditRoleForm.value = false
    resetRoleForm()
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    roleToDelete.value = null
  }

  const resetRoleForm = () => {
    roleForm.name = ''
    roleForm.display_name = ''
    roleForm.description = ''
  }

  const submitRoleForm = async () => {
    try {
      isSubmitting.value = true
      
      const roleData = {
        name: roleForm.name,
        display_name: roleForm.display_name,
        description: roleForm.description
      }
      
      // Implement create/update role logic
      console.log('Submit role:', roleData)
      await loadRoles()
      closeRoleForm()
    } catch (err) {
      error.value = err.message || 'Failed to save role'
    } finally {
      isSubmitting.value = false
    }
  }

  const managePermissions = (role) => {
    selectedRole.value = role
    selectedPermissions.value = role.permissions?.map(p => p.id) || []
    showPermissionsModal.value = true
  }

  const closePermissionsModal = () => {
    showPermissionsModal.value = false
    selectedRole.value = null
    selectedPermissions.value = []
  }

  const savePermissions = async () => {
    try {
      isSubmitting.value = true
      
      // Implement save permissions logic
      console.log('Save permissions for role:', selectedRole.value.id, selectedPermissions.value)
      await loadRoles()
      closePermissionsModal()
    } catch (err) {
      error.value = err.message || 'Failed to save permissions'
    } finally {
      isSubmitting.value = false
    }
  }

  const selectAllModulePermissions = (module) => {
    const modulePermissions = permissionsByModule.value[module] || []
    modulePermissions.forEach(permission => {
      if (!selectedPermissions.value.includes(permission.id)) {
        selectedPermissions.value.push(permission.id)
      }
    })
  }

  const deselectAllModulePermissions = (module) => {
    const modulePermissions = permissionsByModule.value[module] || []
    modulePermissions.forEach(permission => {
      const index = selectedPermissions.value.indexOf(permission.id)
      if (index > -1) {
        selectedPermissions.value.splice(index, 1)
      }
    })
  }

  const cloneRole = async (role) => {
    try {
      // Implement clone role logic
      console.log('Clone role:', role)
      await loadRoles()
    } catch (err) {
      error.value = err.message || 'Failed to clone role'
    }
  }

  const initializeDefaults = async () => {
    try {
      loading.value = true
      // Implement initialize defaults logic
      console.log('Initialize default roles and permissions')
      await Promise.all([loadRoles(), loadPermissions()])
    } catch (err) {
      error.value = err.message || 'Failed to initialize defaults'
    } finally {
      loading.value = false
    }
  }

  const formatModuleName = (module) => {
    return module
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getModuleIcon = (module) => {
    const icons = {
      admin: 'fas fa-cogs',
      patients: 'fas fa-user-injured',
      medical_records: 'fas fa-file-medical',
      appointments: 'fas fa-calendar-check',
      pharmacy: 'fas fa-pills',
      laboratory: 'fas fa-flask',
      billing: 'fas fa-receipt',
      wards: 'fas fa-bed',
      reports: 'fas fa-chart-bar',
      quality: 'fas fa-shield-alt'
    }
    return icons[module] || 'fas fa-folder'
  }

  const onMountedHandler = () => {
    loadRoles()
    loadPermissions()
    loadStatistics()
  }

  return {
    // Reactive data
    loading,
    error,
    roles,
    permissions,
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

    // Methods
    loadRoles,
    loadPermissions,
    loadStatistics,
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
  }
}
