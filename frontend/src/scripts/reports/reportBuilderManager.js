/**
 * @module reportBuilderManager
 * @description Manager for handling report builder business logic
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/services/api/reportsApi'
// import { reportHelpers } from '@/utils/reportHelpers'

export function useReportBuilderManager() {
  // const router = useRouter()
  const reportsStore = useReportsStore()
  const authStore = useAuthStore()

  // Reactive state
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref(null)
  const errors = ref({})
  const reportForm = ref({
    title: '',
    description: '',
    category_id: '',
    type: '',
    data_range: 'all',
    start_date: '',
    end_date: '',
    format: 'pdf',
    language: 'ar',
    fields: [
      {
        name: '',
        type: 'text',
        description: '',
        options: '',
        required: false,
        sort_order: 1
      }
    ],
    is_public: false,
    is_scheduled: false,
    schedule_frequency: 'daily',
    schedule_time: '09:00',
    schedule_days: [],
    notes: '',
    parameters: {},
    filters: {},
    sorting: [],
    grouping: [],
    aggregations: []
  })

  // Computed properties
  const reportCategories = computed(() => {
    return reportsStore.reportCategories || []
  })

  const userPermissions = computed(() => {
    return authStore.user?.permissions || []
  })

  const isFormValid = computed(() => {
    return reportForm.value.title && 
           reportForm.value.category_id && 
           reportForm.value.type &&
           reportForm.value.fields.some(field => field.name)
  })

  const fieldTypes = computed(() => [
    { value: 'text', label: 'نص', icon: 'text' },
    { value: 'number', label: 'رقم', icon: 'hash' },
    { value: 'date', label: 'تاريخ', icon: 'calendar' },
    { value: 'datetime', label: 'تاريخ ووقت', icon: 'clock' },
    { value: 'boolean', label: 'نعم/لا', icon: 'check' },
    { value: 'select', label: 'قائمة', icon: 'list' },
    { value: 'multiselect', label: 'قائمة متعددة', icon: 'list' },
    { value: 'textarea', label: 'نص طويل', icon: 'align-left' },
    { value: 'email', label: 'بريد إلكتروني', icon: 'mail' },
    { value: 'url', label: 'رابط', icon: 'link' }
  ])

  const scheduleFrequencies = computed(() => [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
    { value: 'quarterly', label: 'ربعي' },
    { value: 'yearly', label: 'سنوي' }
  ])

  const reportFormats = computed(() => [
    { value: 'pdf', label: 'PDF', icon: 'file-pdf' },
    { value: 'excel', label: 'Excel', icon: 'file-excel' },
    { value: 'csv', label: 'CSV', icon: 'file-csv' },
    { value: 'json', label: 'JSON', icon: 'file-code' }
  ])

  // Methods
  const loadReportCategories = async () => {
    try {
      await reportsStore.fetchReportCategories()
    } catch (err) {
      console.error('Error loading report categories:', err)
    }
  }

  const validateForm = () => {
    errors.value = {}

    // Required fields validation
    if (!reportForm.value.title?.trim()) {
      errors.value.title = 'اسم التقرير مطلوب'
    }

    if (!reportForm.value.category_id) {
      errors.value.category_id = 'فئة التقرير مطلوبة'
    }

    if (!reportForm.value.type) {
      errors.value.type = 'نوع التقرير مطلوب'
    }

    // Fields validation
    reportForm.value.fields.forEach((field, index) => {
      if (!field.name?.trim()) {
        errors.value[`field_${index}_name`] = 'اسم الحقل مطلوب'
      }
    })

    // Date range validation
    if (reportForm.value.data_range === 'custom') {
      if (!reportForm.value.start_date) {
        errors.value.start_date = 'تاريخ البداية مطلوب'
      }
      if (!reportForm.value.end_date) {
        errors.value.end_date = 'تاريخ النهاية مطلوب'
      }
      if (reportForm.value.start_date && reportForm.value.end_date) {
        const startDate = new Date(reportForm.value.start_date)
        const endDate = new Date(reportForm.value.end_date)
        if (startDate > endDate) {
          errors.value.end_date = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
        }
      }
    }

    // Schedule validation
    if (reportForm.value.is_scheduled) {
      if (!reportForm.value.schedule_frequency) {
        errors.value.schedule_frequency = 'تكرار التقرير مطلوب'
      }
      if (!reportForm.value.schedule_time) {
        errors.value.schedule_time = 'وقت التقرير مطلوب'
      }
    }

    return Object.keys(errors.value).length === 0
  }

  const saveReport = async () => {
    if (!validateForm()) {
      return false
    }

    try {
      isSaving.value = true
      error.value = null

      // Prepare report data
      const reportData = {
        ...reportForm.value,
        created_by: authStore.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Create report
      const response = await reportsApi.createCustomReport(reportData)
      
      // Add to store
      reportsStore.addReport(response.data || response)
      
      return response.data || response
    } catch (err) {
      error.value = err.message || 'Failed to save report'
      console.error('Error saving report:', err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  const addField = () => {
    const newField = {
      name: '',
      type: 'text',
      description: '',
      options: '',
      required: false,
      sort_order: reportForm.value.fields.length + 1
    }
    reportForm.value.fields.push(newField)
  }

  const removeField = (index) => {
    if (reportForm.value.fields.length > 1) {
      reportForm.value.fields.splice(index, 1)
      // Update sort order
      reportForm.value.fields.forEach((field, idx) => {
        field.sort_order = idx + 1
      })
    }
  }

  const moveField = (index, direction) => {
    const fields = reportForm.value.fields
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]]
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]]
    }
    // Update sort order
    fields.forEach((field, idx) => {
      field.sort_order = idx + 1
    })
  }

  const duplicateField = (index) => {
    const originalField = reportForm.value.fields[index]
    const duplicatedField = {
      ...originalField,
      name: `${originalField.name} (نسخة)`,
      sort_order: reportForm.value.fields.length + 1
    }
    reportForm.value.fields.splice(index + 1, 0, duplicatedField)
    // Update sort order
    reportForm.value.fields.forEach((field, idx) => {
      field.sort_order = idx + 1
    })
  }

  const addFilter = () => {
    reportForm.value.filters[`filter_${Date.now()}`] = {
      field: '',
      operator: 'equals',
      value: '',
      type: 'text'
    }
  }

  const removeFilter = (filterKey) => {
    delete reportForm.value.filters[filterKey]
  }

  const addSorting = () => {
    reportForm.value.sorting.push({
      field: '',
      direction: 'asc'
    })
  }

  const removeSorting = (index) => {
    reportForm.value.sorting.splice(index, 1)
  }

  const addGrouping = () => {
    reportForm.value.grouping.push({
      field: '',
      function: 'count'
    })
  }

  const removeGrouping = (index) => {
    reportForm.value.grouping.splice(index, 1)
  }

  const addAggregation = () => {
    reportForm.value.aggregations.push({
      field: '',
      function: 'sum',
      alias: ''
    })
  }

  const removeAggregation = (index) => {
    reportForm.value.aggregations.splice(index, 1)
  }

  const generatePreview = async () => {
    try {
      // Generate a preview of the report
      const previewData = {
        title: reportForm.value.title,
        description: reportForm.value.description,
        fields: reportForm.value.fields,
        sample_data: generateSampleData()
      }
      return previewData
    } catch (err) {
      console.error('Error generating preview:', err)
      throw err
    }
  }

  const generateSampleData = () => {
    // Generate sample data based on fields
    const sampleData = []
    for (let i = 1; i <= 5; i++) {
      const row = {}
      reportForm.value.fields.forEach(field => {
        switch (field.type) {
          case 'text':
            row[field.name] = `نص تجريبي ${i}`
            break
          case 'number':
            row[field.name] = Math.floor(Math.random() * 1000)
            break
          case 'date':
            row[field.name] = new Date().toISOString().split('T')[0]
            break
          case 'datetime':
            row[field.name] = new Date().toISOString()
            break
          case 'boolean':
            row[field.name] = Math.random() > 0.5
            break
          case 'select': {
            const options = field.options?.split(',') || ['خيار 1', 'خيار 2']
            row[field.name] = options[Math.floor(Math.random() * options.length)]
            break
          }
          default:
            row[field.name] = `قيمة ${i}`
        }
      })
      sampleData.push(row)
    }
    return sampleData
  }

  const exportTemplate = () => {
    try {
      const template = {
        ...reportForm.value,
        exported_at: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_template_${reportForm.value.title || 'untitled'}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting template:', err)
    }
  }

  const importTemplate = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target.result)
          reportForm.value = { ...reportForm.value, ...template }
          resolve(template)
        } catch (err) {
          reject(new Error('Invalid template file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    })
  }

  const resetForm = () => {
    reportForm.value = {
      title: '',
      description: '',
      category_id: '',
      type: '',
      data_range: 'all',
      start_date: '',
      end_date: '',
      format: 'pdf',
      language: 'ar',
      fields: [
        {
          name: '',
          type: 'text',
          description: '',
          options: '',
          required: false,
          sort_order: 1
        }
      ],
      is_public: false,
      is_scheduled: false,
      schedule_frequency: 'daily',
      schedule_time: '09:00',
      schedule_days: [],
      notes: '',
      parameters: {},
      filters: {},
      sorting: [],
      grouping: [],
      aggregations: []
    }
    errors.value = {}
  }

  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  const canCreateReport = computed(() => {
    return hasPermission('create_reports')
  })

  const canScheduleReport = computed(() => {
    return hasPermission('schedule_reports')
  })

  // Lifecycle
  onMounted(async () => {
    await loadReportCategories()
  })

  onUnmounted(() => {
    // Cleanup if needed
  })

  return {
    // State
    isLoading,
    isSaving,
    error,
    errors,
    reportForm,

    // Computed
    reportCategories,
    userPermissions,
    isFormValid,
    fieldTypes,
    scheduleFrequencies,
    reportFormats,
    canCreateReport,
    canScheduleReport,

    // Methods
    loadReportCategories,
    validateForm,
    saveReport,
    addField,
    removeField,
    moveField,
    duplicateField,
    addFilter,
    removeFilter,
    addSorting,
    removeSorting,
    addGrouping,
    removeGrouping,
    addAggregation,
    removeAggregation,
    generatePreview,
    generateSampleData,
    exportTemplate,
    importTemplate,
    resetForm,
    hasPermission
  }
}
