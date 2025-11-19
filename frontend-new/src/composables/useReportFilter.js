import { ref, reactive, computed, watch } from 'vue'

export function useReportFilter(props, { emit }) {
  const showAdvanced = ref(false)

  const filters = reactive({
    period: '',
    startDate: '',
    endDate: '',
    department: '',
    status: '',
    category: '',
    user: '',
    minValue: null,
    maxValue: null,
    sortBy: 'date',
    sortOrder: 'desc',
    ...props.initialFilters
  })

  const activeFilters = computed(() => {
    const active = []
    
    if (filters.period) {
      active.push({
        key: 'period',
        label: 'Period',
        value: filters.period
      })
    }
    
    if (filters.department) {
      const dept = props.departments.find(d => d.id === filters.department)
      active.push({
        key: 'department',
        label: 'Department',
        value: dept?.name || filters.department
      })
    }
    
    if (filters.status) {
      const status = props.statusOptions.find(s => s.value === filters.status)
      active.push({
        key: 'status',
        label: 'Status',
        value: status?.label || filters.status
      })
    }
    
    if (filters.category) {
      const category = props.categories.find(c => c.id === filters.category)
      active.push({
        key: 'category',
        label: 'Category',
        value: category?.name || filters.category
      })
    }
    
    if (filters.user) {
      const user = props.users.find(u => u.id === filters.user)
      active.push({
        key: 'user',
        label: 'User',
        value: user?.name || filters.user
      })
    }
    
    if (filters.minValue !== null) {
      active.push({
        key: 'minValue',
        label: 'Min Value',
        value: filters.minValue
      })
    }
    
    if (filters.maxValue !== null) {
      active.push({
        key: 'maxValue',
        label: 'Max Value',
        value: filters.maxValue
      })
    }

    return active
  })

  const activeFiltersCount = computed(() => activeFilters.value.length)

  const toggleAdvanced = () => {
    showAdvanced.value = !showAdvanced.value
  }

  const applyQuickFilter = (quickFilter) => {
    switch (quickFilter.key) {
      case 'today':
        filters.period = 'today'
        break
      case 'this_week':
        filters.period = 'this_week'
        break
      case 'this_month':
        filters.period = 'this_month'
        break
      case 'active_only':
        filters.status = 'active'
        break
      case 'high_value':
        filters.minValue = 10000
        break
    }
    
    emit('filter-change', { ...filters })
  }

  const isQuickFilterActive = (quickFilter) => {
    switch (quickFilter.key) {
      case 'today':
        return filters.period === 'today'
      case 'this_week':
        return filters.period === 'this_week'
      case 'this_month':
        return filters.period === 'this_month'
      case 'active_only':
        return filters.status === 'active'
      case 'high_value':
        return filters.minValue === 10000
      default:
        return false
    }
  }

  const applyFilters = () => {
    emit('filter-apply', { ...filters })
  }

  const resetFilters = () => {
    Object.keys(filters).forEach(key => {
      if (key === 'sortBy') {
        filters[key] = 'date'
      } else if (key === 'sortOrder') {
        filters[key] = 'desc'
      } else {
        filters[key] = ''
      }
    })
    
    emit('filter-reset')
  }

  const clearAllFilters = () => {
    resetFilters()
  }

  const removeFilter = (filterKey) => {
    if (filterKey === 'minValue' || filterKey === 'maxValue') {
      filters[filterKey] = null
    } else {
      filters[filterKey] = ''
    }
    
    emit('filter-change', { ...filters })
  }

  // Watch for filter changes
  watch(filters, (newFilters) => {
    emit('filter-change', { ...newFilters })
  }, { deep: true })

  return {
    showAdvanced,
    filters,
    activeFilters,
    activeFiltersCount,
    toggleAdvanced,
    applyQuickFilter,
    isQuickFilterActive,
    applyFilters,
    resetFilters,
    clearAllFilters,
    removeFilter
  }
}
