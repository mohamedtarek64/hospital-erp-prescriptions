import { ref, reactive, computed } from 'vue'
import { getModuleIcon, formatModuleName } from '@/utils/adminHelpers'

/**
 * Role Editor Composable
 * 
 * Manages role editor functionality
 */
export const useRoleEditor = (props, emit) => {
  // Reactive data
  const roleForm = reactive({
    name: '',
    display_name: '',
    description: ''
  })
  
  const selectedPermissions = ref([])
  const permissionsByModule = ref({})

  // Computed
  const hasChanges = computed(() => {
    return roleForm.name || roleForm.display_name || roleForm.description || selectedPermissions.value.length > 0
  })

  // Methods
  const selectAllPermissions = () => {
    const allPermissions = Object.values(permissionsByModule.value).flat()
    selectedPermissions.value = allPermissions.map(p => p.id)
  }

  const deselectAllPermissions = () => {
    selectedPermissions.value = []
  }

  const selectModulePermissions = (module) => {
    const modulePermissions = permissionsByModule.value[module] || []
    modulePermissions.forEach(permission => {
      if (!selectedPermissions.value.includes(permission.id)) {
        selectedPermissions.value.push(permission.id)
      }
    })
  }

  const deselectModulePermissions = (module) => {
    const modulePermissions = permissionsByModule.value[module] || []
    modulePermissions.forEach(permission => {
      const index = selectedPermissions.value.indexOf(permission.id)
      if (index > -1) {
        selectedPermissions.value.splice(index, 1)
      }
    })
  }

  const getSelectedCount = (module) => {
    const modulePermissions = permissionsByModule.value[module] || []
    return modulePermissions.filter(p => selectedPermissions.value.includes(p.id)).length
  }

  const onMountedHandler = () => {
    // Initialize component
    if (props.role) {
      roleForm.name = props.role.name
      roleForm.display_name = props.role.display_name
      roleForm.description = props.role.description || ''
      selectedPermissions.value = props.role.permissions?.map(p => p.id) || []
    }
    
    if (props.permissions) {
      // Group permissions by module
      permissionsByModule.value = props.permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = []
        }
        acc[permission.module].push(permission)
        return acc
      }, {})
    }
  }

  return {
    // Reactive data
    roleForm,
    selectedPermissions,
    permissionsByModule,
    hasChanges,

    // Methods
    selectAllPermissions,
    deselectAllPermissions,
    selectModulePermissions,
    deselectModulePermissions,
    getSelectedCount,
    getModuleIcon,
    formatModuleName,
    onMountedHandler
  }
}
