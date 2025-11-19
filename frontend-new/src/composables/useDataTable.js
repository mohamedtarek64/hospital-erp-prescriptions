import { ref, computed, watch } from 'vue'

export function useDataTable(props, { emit }) {
  const searchQuery = ref('')
  const sortField = ref('')
  const sortOrder = ref('asc')
  const currentPage = ref(1)
  const itemsPerPage = ref(props.defaultItemsPerPage)
  const isFullscreen = ref(false)

  const filteredData = computed(() => {
    let filtered = [...props.data]

    // Apply search filter
    if (searchQuery.value && props.searchable) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(row => {
        return props.columns.some(column => {
          const value = getCellValue(row, column.key)
          return String(value).toLowerCase().includes(query)
        })
      })
    }

    // Apply sorting
    if (sortField.value && props.sortable) {
      filtered.sort((a, b) => {
        const aValue = getCellValue(a, sortField.value)
        const bValue = getCellValue(b, sortField.value)
        
        if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  })

  const totalItems = computed(() => filteredData.value.length)
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))

  const paginatedData = computed(() => {
    if (!props.paginated) return filteredData.value
    
    return filteredData.value.slice(startIndex.value, endIndex.value)
  })

  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages.value, start + maxVisible - 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  })

  const getRowKey = (row, index) => {
    return row[props.rowKey] || index
  }

  const getCellValue = (row, key) => {
    return key.split('.').reduce((obj, k) => obj?.[k], row)
  }

  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '-'
    
    if (column.formatter) {
      return column.formatter(value)
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString()
    }
    
    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    }
    
    if (column.type === 'number') {
      return new Intl.NumberFormat().format(value)
    }
    
    return String(value)
  }

  const getColumnClasses = (column) => {
    const classes = []
    
    if (column.sortable) classes.push('sortable')
    if (column.align) classes.push(`text-${column.align}`)
    if (column.width) classes.push(`w-${column.width}`)
    
    return classes
  }

  const getRowClasses = (row, index) => {
    const classes = []
    
    if (index % 2 === 0) classes.push('even')
    else classes.push('odd')
    
    if (row.status === 'active') classes.push('status-active')
    if (row.status === 'inactive') classes.push('status-inactive')
    
    return classes
  }

  const getCellClasses = (column, row) => {
    const classes = []
    
    if (column.align) classes.push(`text-${column.align}`)
    if (column.type) classes.push(`type-${column.type}`)
    
    return classes
  }

  const getRowActions = (row) => {
    return props.actions.filter(action => {
      if (action.condition) {
        return action.condition(row)
      }
      return true
    })
  }

  const sortBy = (field) => {
    if (!props.sortable) return
    
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'asc'
    }
    
    currentPage.value = 1
    emit('sort-change', { field, order: sortOrder.value })
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      emit('page-change', page)
    }
  }

  const onSearch = () => {
    currentPage.value = 1
  }

  const onItemsPerPageChange = () => {
    currentPage.value = 1
  }

  const onRowClick = (row, index) => {
    emit('row-click', { row, index })
  }

  const executeAction = (action, row) => {
    emit('action-click', { action, row })
  }

  const refreshData = () => {
    emit('refresh')
  }

  const exportData = () => {
    emit('export', {
      data: filteredData.value,
      columns: props.columns,
      title: props.title
    })
  }

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

  const closeFullscreen = () => {
    isFullscreen.value = false
  }

  // Watch for data changes to reset pagination
  watch(() => props.data, () => {
    currentPage.value = 1
  })

  return {
    searchQuery,
    sortField,
    sortOrder,
    currentPage,
    itemsPerPage,
    isFullscreen,
    filteredData,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    visiblePages,
    getRowKey,
    getCellValue,
    formatCellValue,
    getColumnClasses,
    getRowClasses,
    getCellClasses,
    getRowActions,
    sortBy,
    goToPage,
    onSearch,
    onItemsPerPageChange,
    onRowClick,
    executeAction,
    refreshData,
    exportData,
    toggleFullscreen,
    closeFullscreen
  }
}
