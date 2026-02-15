/**
 * Suppliers API Service
 * Handles all supplier-related API calls
 */

import apiClient from '@/utils/apiClient'

export const suppliersApi = {
  // Suppliers
  getSuppliers: (params = {}) => {
    return apiClient.get('/api/suppliers', { params })
  },

  getSupplier: (id) => {
    return apiClient.get(`/api/suppliers/${id}`)
  },

  createSupplier: (supplierData) => {
    return apiClient.post('/api/suppliers', supplierData)
  },

  updateSupplier: (id, supplierData) => {
    return apiClient.put(`/api/suppliers/${id}`, supplierData)
  },

  deleteSupplier: (id) => {
    return apiClient.delete(`/api/suppliers/${id}`)
  },

  // Supplier Categories
  getSupplierCategories: (params = {}) => {
    return apiClient.get('/api/suppliers/categories', { params })
  },

  createSupplierCategory: (categoryData) => {
    return apiClient.post('/api/suppliers/categories', categoryData)
  },

  updateSupplierCategory: (id, categoryData) => {
    return apiClient.put(`/api/suppliers/categories/${id}`, categoryData)
  },

  deleteSupplierCategory: (id) => {
    return apiClient.delete(`/api/suppliers/categories/${id}`)
  },

  // Supplier Products
  getSupplierProducts: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/products`, { params })
  },

  addSupplierProduct: (supplierId, productData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/products`, productData)
  },

  updateSupplierProduct: (supplierId, productId, productData) => {
    return apiClient.put(`/api/suppliers/${supplierId}/products/${productId}`, productData)
  },

  removeSupplierProduct: (supplierId, productId) => {
    return apiClient.delete(`/api/suppliers/${supplierId}/products/${productId}`)
  },

  // Supplier Contracts
  getSupplierContracts: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/contracts`, { params })
  },

  createSupplierContract: (supplierId, contractData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/contracts`, contractData)
  },

  updateSupplierContract: (supplierId, contractId, contractData) => {
    return apiClient.put(`/api/suppliers/${supplierId}/contracts/${contractId}`, contractData)
  },

  deleteSupplierContract: (supplierId, contractId) => {
    return apiClient.delete(`/api/suppliers/${supplierId}/contracts/${contractId}`)
  },

  // Supplier Performance
  getSupplierPerformance: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/performance`, { params })
  },

  getSupplierRatings: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/ratings`, { params })
  },

  rateSupplier: (supplierId, ratingData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/rate`, ratingData)
  },

  // Supplier Orders
  getSupplierOrders: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/orders`, { params })
  },

  createSupplierOrder: (supplierId, orderData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/orders`, orderData)
  },

  updateSupplierOrder: (supplierId, orderId, orderData) => {
    return apiClient.put(`/api/suppliers/${supplierId}/orders/${orderId}`, orderData)
  },

  deleteSupplierOrder: (supplierId, orderId) => {
    return apiClient.delete(`/api/suppliers/${supplierId}/orders/${orderId}`)
  },

  // Supplier Payments
  getSupplierPayments: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/payments`, { params })
  },

  createSupplierPayment: (supplierId, paymentData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/payments`, paymentData)
  },

  updateSupplierPayment: (supplierId, paymentId, paymentData) => {
    return apiClient.put(`/api/suppliers/${supplierId}/payments/${paymentId}`, paymentData)
  },

  deleteSupplierPayment: (supplierId, paymentId) => {
    return apiClient.delete(`/api/suppliers/${supplierId}/payments/${paymentId}`)
  },

  // Supplier Statistics
  getSupplierStats: (supplierId, params = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/stats`, { params })
  },

  getOverallSupplierStats: (params = {}) => {
    return apiClient.get('/api/suppliers/stats', { params })
  },

  // Supplier Reports
  generateSupplierReport: (supplierId, reportData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/reports`, reportData)
  },

  generateSupplierPerformanceReport: (supplierId, reportData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/performance-report`, reportData)
  },

  generateSupplierOrderReport: (supplierId, reportData) => {
    return apiClient.post(`/api/suppliers/${supplierId}/order-report`, reportData)
  },

  // Export
  exportSuppliers: (filters = {}) => {
    return apiClient.get('/api/suppliers/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportSupplierProducts: (supplierId, filters = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/products/export`, {
      params: filters,
      responseType: 'blob'
    })
  },

  exportSupplierOrders: (supplierId, filters = {}) => {
    return apiClient.get(`/api/suppliers/${supplierId}/orders/export`, {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default suppliersApi