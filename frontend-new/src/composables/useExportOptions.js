import { ref, reactive, computed, watch } from 'vue'

export function useExportOptions(props, { emit }) {
  const selectedFormat = ref('csv')
  const isExporting = ref(false)
  const showProgress = ref(false)
  const exportProgress = ref(0)
  const progressText = ref('')
  const selectedColumns = ref([])

  const exportFormats = [
    {
      value: 'csv',
      name: 'CSV',
      description: 'Comma-separated values',
      icon: 'TableCellsIcon'
    },
    {
      value: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format',
      icon: 'TableCellsIcon'
    },
    {
      value: 'pdf',
      name: 'PDF',
      description: 'Portable Document Format',
      icon: 'DocumentTextIcon'
    },
    {
      value: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation',
      icon: 'DocumentTextIcon'
    }
  ]

  const exportOptions = reactive({
    includeHeaders: true,
    includeTimestamps: false,
    compress: false,
    passwordProtect: false,
    password: '',
    exportAll: true,
    exportCurrentPage: false,
    exportSelected: false
  })

  const availableColumns = computed(() => props.columns)

  const selectFormat = (format) => {
    selectedFormat.value = format
  }

  const selectAllColumns = () => {
    selectedColumns.value = availableColumns.value.map(col => col.key)
  }

  const deselectAllColumns = () => {
    selectedColumns.value = []
  }

  const cancelExport = () => {
    emit('cancel')
  }

  const previewExport = () => {
    emit('preview', {
      format: selectedFormat.value,
      options: exportOptions,
      columns: selectedColumns.value
    })
  }

  const startExport = async () => {
    isExporting.value = true
    showProgress.value = true
    exportProgress.value = 0
    progressText.value = 'Preparing export...'

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        exportProgress.value = i
        progressText.value = `Exporting data... ${i}%`
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const exportData = {
        format: selectedFormat.value,
        options: exportOptions,
        columns: selectedColumns.value,
        data: getExportData()
      }

      emit('export', exportData)
      
      progressText.value = 'Export completed successfully!'
      
      // Hide progress after 2 seconds
      setTimeout(() => {
        showProgress.value = false
        isExporting.value = false
      }, 2000)

    } catch (error) {
      console.error('Export error:', error)
      progressText.value = 'Export failed. Please try again.'
      isExporting.value = false
    }
  }

  const getExportData = () => {
    if (exportOptions.exportAll) {
      return props.data
    } else if (exportOptions.exportCurrentPage) {
      // Return current page data
      return props.data
    } else if (exportOptions.exportSelected) {
      return props.selectedRows
    }
    return props.data
  }

  // Initialize selected columns
  watch(() => props.columns, (newColumns) => {
    selectedColumns.value = newColumns.map(col => col.key)
  }, { immediate: true })

  return {
    selectedFormat,
    isExporting,
    showProgress,
    exportProgress,
    progressText,
    selectedColumns,
    exportFormats,
    exportOptions,
    availableColumns,
    selectFormat,
    selectAllColumns,
    deselectAllColumns,
    cancelExport,
    previewExport,
    startExport
  }
}
