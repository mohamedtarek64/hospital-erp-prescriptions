import { ref, computed } from 'vue'

export class TestResultsManager {
  constructor() {
    // Reactive data
    this.showAddForm = ref(false)
    this.showEditForm = ref(false)
    this.showResultsModal = ref(false)
    this.loading = ref(false)
    this.errors = ref({})
    this.editingTest = ref(null)
    this.updatingResultsTest = ref(null)

    this.form = ref({
      test_name: '',
      test_type: '',
      test_date: '',
      notes: ''
    })

    this.resultsForm = ref({
      results: '',
      normal_range: '',
      results_date: '',
      notes: ''
    })
  }

  getReactiveData() {
    return {
      showAddForm: this.showAddForm,
      showEditForm: this.showEditForm,
      showResultsModal: this.showResultsModal,
      loading: this.loading,
      errors: this.errors,
      editingTest: this.editingTest,
      form: this.form,
      resultsForm: this.resultsForm
    }
  }

  getMethods(props, emit, authStore) {
    return {
      canAddTest: computed(() => {
        return authStore.user && ['admin', 'doctor', 'nurse'].includes(authStore.user.role)
      }),

      canEditTest: () => {
        if (!authStore.user) return false
        if (authStore.user.role === 'admin') return true
        if (['doctor', 'nurse'].includes(authStore.user.role)) return true
        return false
      },

      canUpdateResults: (test) => {
        if (!authStore.user) return false
        if (test.status === 'completed') return false
        if (authStore.user.role === 'admin') return true
        if (['doctor', 'nurse', 'lab_technician'].includes(authStore.user.role)) return true
        return false
      },

      canDeleteTest: () => {
        if (!authStore.user) return false
        if (authStore.user.role === 'admin') return true
        if (authStore.user.role === 'doctor') return true
        return false
      },

      resetForm: this.resetForm.bind(this),
      editTest: this.editTest.bind(this),
      closeModal: this.closeModal.bind(this),
      closeResultsModal: this.closeResultsModal.bind(this),
      validateForm: this.validateForm.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
      updateTestResults: this.updateTestResults.bind(this),
      handleResultsSubmit: this.handleResultsSubmit.bind(this),
      deleteTest: this.deleteTest.bind(this),
      viewTest: this.viewTest.bind(this),
      getTestTypeText: this.getTestTypeText.bind(this),
      getTestStatusText: this.getTestStatusText.bind(this),
      getTestStatusColor: this.getTestStatusColor.bind(this),
      isAbnormal: this.isAbnormal.bind(this)
    }
  }

  // Methods
  resetForm() {
    this.form.value = {
      test_name: '',
      test_type: '',
      test_date: '',
      notes: ''
    }
    this.errors.value = {}
  }

  resetResultsForm() {
    this.resultsForm.value = {
      results: '',
      normal_range: '',
      results_date: '',
      notes: ''
    }
  }

  editTest(test) {
    this.editingTest.value = test
    this.form.value = {
      test_name: test.test_name,
      test_type: test.test_type,
      test_date: test.test_date,
      notes: test.notes || ''
    }
    this.showEditForm.value = true
  }

  updateTestResults(test) {
    this.updatingResultsTest.value = test
    this.resultsForm.value = {
      results: test.results || '',
      normal_range: test.normal_range || '',
      results_date: new Date().toISOString().split('T')[0],
      notes: test.notes || ''
    }
    this.showResultsModal.value = true
  }

  closeModal() {
    this.showAddForm.value = false
    this.showEditForm.value = false
    this.editingTest.value = null
    this.resetForm()
  }

  closeResultsModal() {
    this.showResultsModal.value = false
    this.updatingResultsTest.value = null
    this.resetResultsForm()
  }

  validateForm() {
    this.errors.value = {}
    
    if (!this.form.value.test_name?.trim()) {
      this.errors.value.test_name = 'اسم الفحص مطلوب'
    }
    
    if (!this.form.value.test_type) {
      this.errors.value.test_type = 'نوع الفحص مطلوب'
    }
    
    if (!this.form.value.test_date) {
      this.errors.value.test_date = 'تاريخ الفحص مطلوب'
    }
    
    return Object.keys(this.errors.value).length === 0
  }

  validateResultsForm() {
    const errors = {}
    
    if (!this.resultsForm.value.results?.trim()) {
      errors.results = 'النتائج مطلوبة'
    }
    
    if (!this.resultsForm.value.results_date) {
      errors.results_date = 'تاريخ النتائج مطلوب'
    }
    
    return Object.keys(errors).length === 0
  }

  async handleSubmit() {
    if (!this.validateForm()) return
    
    this.loading.value = true
    
    try {
      const testData = {
        ...this.form.value,
        medical_record_id: this.medicalRecordId
      }
      
      if (this.showEditForm.value && this.editingTest.value) {
        // Update existing test
        const updatedTest = await this.updateTest(this.editingTest.value.id, testData)
        this.emit('test-updated', updatedTest)
      } else {
        // Add new test
        const newTest = await this.addTest(testData)
        this.emit('test-added', newTest)
      }
      
      this.closeModal()
    } catch (error) {
      console.error('Error saving test:', error)
    } finally {
      this.loading.value = false
    }
  }

  async handleResultsSubmit() {
    if (!this.validateResultsForm()) return
    
    this.loading.value = true
    
    try {
      const resultsData = {
        ...this.resultsForm.value,
        status: 'completed'
      }
      
      const updatedTest = await this.updateTestResults(this.updatingResultsTest.value.id, resultsData)
      this.emit('results-updated', updatedTest)
      
      this.closeResultsModal()
    } catch (error) {
      console.error('Error updating results:', error)
    } finally {
      this.loading.value = false
    }
  }

  async addTest(data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTest = {
          id: Date.now(),
          ...data,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        resolve(newTest)
      }, 1000)
    })
  }

  async updateTest(id, data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedTest = {
          id,
          ...data,
          updated_at: new Date().toISOString()
        }
        resolve(updatedTest)
      }, 1000)
    })
  }

  async updateTestResultsDuplicate(id, data) {
    // This would typically call an API
    // For now, we'll simulate the API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedTest = {
          id,
          ...data,
          updated_at: new Date().toISOString()
        }
        resolve(updatedTest)
      }, 1000)
    })
  }

  async deleteTest(test) {
    if (!confirm('هل أنت متأكد من حذف هذا الفحص الطبي؟')) return
    
    try {
      // This would typically call an API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      this.emit('test-deleted', test)
    } catch (error) {
      console.error('Error deleting test:', error)
    }
  }

  viewTest(test) {
    // This could open a detailed view modal or navigate to a test details page
    console.log('Viewing test:', test)
  }

  isAbnormal(test) {
    // This is a simplified check - in a real application, you'd have more sophisticated logic
    if (!test.results || !test.normal_range) return false
    
    // Check if results contain keywords that might indicate abnormal results
    const abnormalKeywords = ['high', 'low', 'elevated', 'decreased', 'abnormal', 'positive', 'negative']
    return abnormalKeywords.some(keyword => 
      test.results.toLowerCase().includes(keyword)
    )
  }

  getTestTypeText(testType) {
    const texts = {
      blood: 'فحص دم',
      urine: 'فحص بول',
      imaging: 'فحص تصويري',
      cardiac: 'فحص قلبي',
      neurological: 'فحص عصبي',
      other: 'فحص آخر'
    }
    return texts[testType] || testType
  }

  getTestStatusText(status) {
    const texts = {
      pending: 'في الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }
    return texts[status] || status
  }

  getTestStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  initializeForm() {
    // Initialize form with current date
    this.form.value.test_date = new Date().toISOString().split('T')[0]
  }
}
