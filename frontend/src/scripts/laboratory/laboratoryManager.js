import { reactive } from 'vue'
import { laboratoryApi } from '@/services/api/laboratoryApi'
import { laboratoryHelpers } from '@/utils/laboratoryHelpers'

export const laboratoryManager = {
  // State management
  state: reactive({
    loading: false,
    error: null,
    orders: [],
    tests: [],
    categories: [],
    results: [],
    specimens: [],
    dashboardData: null,
    filters: {
      status: '',
      dateRange: '',
      patient: '',
      test: ''
    },
    pagination: {
      currentPage: 1,
      perPage: 10,
      total: 0
    }
  }),

  // Initialize manager
  async initialize() {
    try {
      this.state.loading = true
      await this.loadDashboardData()
      await this.loadCategories()
      await this.loadTests()
    } catch (error) {
      this.state.error = error.message
    } finally {
      this.state.loading = false
    }
  },

  // Dashboard data
  async getDashboardData() {
    try {
      const response = await laboratoryApi.getDashboard()
      this.state.dashboardData = response.data
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    }
  },

  // Lab Orders
  async loadOrders(params = {}) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.getOrders({
        ...this.state.filters,
        ...params,
        page: this.state.pagination.currentPage,
        per_page: this.state.pagination.perPage
      })
      
      this.state.orders = response.data.data
      this.state.pagination.total = response.data.total
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async createOrder(orderData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.createOrder(orderData)
      await this.loadOrders()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async updateOrder(id, orderData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.updateOrder(id, orderData)
      await this.loadOrders()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async deleteOrder(id) {
    try {
      this.state.loading = true
      await laboratoryApi.deleteOrder(id)
      await this.loadOrders()
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async getOrder(id) {
    try {
      const response = await laboratoryApi.getOrder(id)
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    }
  },

  // Lab Tests
  async loadTests(params = {}) {
    try {
      const response = await laboratoryApi.getTests(params)
      this.state.tests = response.data
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    }
  },

  async createTest(testData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.createTest(testData)
      await this.loadTests()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async updateTest(id, testData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.updateTest(id, testData)
      await this.loadTests()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async deleteTest(id) {
    try {
      this.state.loading = true
      await laboratoryApi.deleteTest(id)
      await this.loadTests()
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  // Test Categories
  async loadCategories() {
    try {
      const response = await laboratoryApi.getCategories()
      this.state.categories = response.data
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    }
  },

  async createCategory(categoryData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.createCategory(categoryData)
      await this.loadCategories()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async updateCategory(id, categoryData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.updateCategory(id, categoryData)
      await this.loadCategories()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async deleteCategory(id) {
    try {
      this.state.loading = true
      await laboratoryApi.deleteCategory(id)
      await this.loadCategories()
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  // Lab Results
  async loadResults(params = {}) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.getResults({
        ...this.state.filters,
        ...params,
        page: this.state.pagination.currentPage,
        per_page: this.state.pagination.perPage
      })
      
      this.state.results = response.data.data
      this.state.pagination.total = response.data.total
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async createResult(resultData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.createResult(resultData)
      await this.loadResults()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async updateResult(id, resultData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.updateResult(id, resultData)
      await this.loadResults()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async verifyResult(id, verificationData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.verifyResult(id, verificationData)
      await this.loadResults()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  // Specimens
  async loadSpecimens(params = {}) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.getSpecimens({
        ...this.state.filters,
        ...params,
        page: this.state.pagination.currentPage,
        per_page: this.state.pagination.perPage
      })
      
      this.state.specimens = response.data.data
      this.state.pagination.total = response.data.total
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async createSpecimen(specimenData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.createSpecimen(specimenData)
      await this.loadSpecimens()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async updateSpecimen(id, specimenData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.updateSpecimen(id, specimenData)
      await this.loadSpecimens()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async collectSpecimen(id, collectionData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.collectSpecimen(id, collectionData)
      await this.loadSpecimens()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async receiveSpecimen(id, receptionData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.receiveSpecimen(id, receptionData)
      await this.loadSpecimens()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  async disposeSpecimen(id, disposalData) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.disposeSpecimen(id, disposalData)
      await this.loadSpecimens()
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  // Reports
  async generateReport(reportType, params = {}) {
    try {
      this.state.loading = true
      const response = await laboratoryApi.generateReport(reportType, params)
      return response.data
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.loading = false
    }
  },

  // Utility methods
  setFilter(key, value) {
    this.state.filters[key] = value
    this.state.pagination.currentPage = 1
  },

  clearFilters() {
    this.state.filters = {
      status: '',
      dateRange: '',
      patient: '',
      test: ''
    }
    this.state.pagination.currentPage = 1
  },

  setPage(page) {
    this.state.pagination.currentPage = page
  },

  setPerPage(perPage) {
    this.state.pagination.perPage = perPage
    this.state.pagination.currentPage = 1
  },

  // Helper methods
  getStatusColor(status) {
    return laboratoryHelpers.getStatusColor(status)
  },

  formatDate(date) {
    return laboratoryHelpers.formatDate(date)
  },

  formatCurrency(amount) {
    return laboratoryHelpers.formatCurrency(amount)
  },

  generateOrderNumber() {
    return laboratoryHelpers.generateOrderNumber()
  },

  generateSpecimenId() {
    return laboratoryHelpers.generateSpecimenId()
  },

  validateOrderData(data) {
    return laboratoryHelpers.validateOrderData(data)
  },

  validateResultData(data) {
    return laboratoryHelpers.validateResultData(data)
  },

  validateSpecimenData(data) {
    return laboratoryHelpers.validateSpecimenData(data)
  }
}
