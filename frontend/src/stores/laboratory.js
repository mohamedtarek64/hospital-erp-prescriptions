import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useLaboratoryStore = defineStore('laboratory', () => {
  const tests = ref([])
  const testResults = ref([])
  const specimens = ref([])
  const testTypes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters (computed properties for derived state)
  const pendingTests = computed(() =>
    tests.value.filter(test => test.status === 'pending')
  )
  const inProgressTests = computed(() =>
    tests.value.filter(test => test.status === 'in_progress')
  )
  const completedTests = computed(() =>
    tests.value.filter(test => test.status === 'completed')
  )
  const cancelledTests = computed(() =>
    tests.value.filter(test => test.status === 'cancelled')
  )

  const stats = computed(() => ({
    totalTests: tests.value.length,
    pendingTests: pendingTests.value.length,
    inProgressTests: inProgressTests.value.length,
    completedTests: completedTests.value.length,
    cancelledTests: cancelledTests.value.length,
    totalSpecimens: specimens.value.length,
    totalTestTypes: testTypes.value.length
  }))

  const recentTests = computed(() => {
    return tests.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  const urgentTests = computed(() => {
    return tests.value
      .filter(test => test.priority === 'urgent' && test.status !== 'completed')
      .slice(0, 5)
  })

  const todaysTests = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return tests.value.filter(test => 
      test.created_at?.split('T')[0] === today
    )
  })

  // API Actions
  const fetchTests = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/laboratory/tests', { params })
      tests.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch tests'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTestResults = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/laboratory/results', { params })
      testResults.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch test results'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSpecimens = async () => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/laboratory/specimens')
      specimens.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch specimens'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTestTypes = async () => {
    loading.value = true
    try {
      const response = await apiClient.get('/api/laboratory/test-types')
      testTypes.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch test types'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTest = async (testData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/laboratory/tests', testData)
      tests.value.unshift(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create test'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateTest = async (id, testData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/laboratory/tests/${id}`, testData)
      const index = tests.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tests.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update test'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteTest = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/laboratory/tests/${id}`)
      tests.value = tests.value.filter(t => t.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete test'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const startTest = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.patch(`/api/laboratory/tests/${id}/start`)
      const index = tests.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tests.value[index].status = 'in_progress'
        tests.value[index].started_at = response.data.started_at
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to start test'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const completeTest = async (id, results) => {
    loading.value = true
    try {
      const response = await apiClient.patch(`/api/laboratory/tests/${id}/complete`, { results })
      const index = tests.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tests.value[index].status = 'completed'
        tests.value[index].completed_at = response.data.completed_at
        tests.value[index].results = results
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to complete test'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const cancelTest = async (id, reason) => {
    loading.value = true
    try {
      const response = await apiClient.patch(`/api/laboratory/tests/${id}/cancel`, { reason })
      const index = tests.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tests.value[index].status = 'cancelled'
        tests.value[index].cancelled_at = response.data.cancelled_at
        tests.value[index].cancellation_reason = reason
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to cancel test'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createSpecimen = async (specimenData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/laboratory/specimens', specimenData)
      specimens.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create specimen'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateSpecimen = async (id, specimenData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/laboratory/specimens/${id}`, specimenData)
      const index = specimens.value.findIndex(s => s.id === id)
      if (index !== -1) {
        specimens.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update specimen'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteSpecimen = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/laboratory/specimens/${id}`)
      specimens.value = specimens.value.filter(s => s.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete specimen'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const createTestType = async (testTypeData) => {
    loading.value = true
    try {
      const response = await apiClient.post('/api/laboratory/test-types', testTypeData)
      testTypes.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create test type'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateTestType = async (id, testTypeData) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/api/laboratory/test-types/${id}`, testTypeData)
      const index = testTypes.value.findIndex(tt => tt.id === id)
      if (index !== -1) {
        testTypes.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update test type'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteTestType = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(`/api/laboratory/test-types/${id}`)
      testTypes.value = testTypes.value.filter(tt => tt.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete test type'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    tests,
    testResults,
    specimens,
    testTypes,
    loading,
    error,
    stats,
    recentTests,
    urgentTests,
    todaysTests,
    pendingTests,
    inProgressTests,
    completedTests,
    cancelledTests,
    fetchTests,
    fetchTestResults,
    fetchSpecimens,
    fetchTestTypes,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    completeTest,
    cancelTest,
    createSpecimen,
    updateSpecimen,
    deleteSpecimen,
    createTestType,
    updateTestType,
    deleteTestType,
    clearError
  }
})