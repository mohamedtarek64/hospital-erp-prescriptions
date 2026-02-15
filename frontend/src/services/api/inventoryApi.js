/**
 * Inventory API Service
 * Handles all inventory-related API calls
 */

import apiClient from '@/utils/apiClient'

export const inventoryApi = {
  // Inventory
  getInventory: (params = {}) => {
    return apiClient.get('/api/inventory', { params })
  },

  getInventoryItem: (id) => {
    return apiClient.get(`/api/inventory/${id}`)
  },

  createInventoryItem: (itemData) => {
    return apiClient.post('/api/inventory', itemData)
  },

  updateInventoryItem: (id, itemData) => {
    return apiClient.put(`/api/inventory/${id}`, itemData)
  },

  deleteInventoryItem: (id) => {
    return apiClient.delete(`/api/inventory/${id}`)
  },

  // Inventory Categories
  getInventoryCategories: (params = {}) => {
    return apiClient.get('/api/inventory/categories', { params })
  },

  createInventoryCategory: (categoryData) => {
    return apiClient.post('/api/inventory/categories', categoryData)
  },

  updateInventoryCategory: (id, categoryData) => {
    return apiClient.put(`/api/inventory/categories/${id}`, categoryData)
  },

  deleteInventoryCategory: (id) => {
    return apiClient.delete(`/api/inventory/categories/${id}`)
  },

  // Stock Management
  getStockLevels: (params = {}) => {
    return apiClient.get('/api/inventory/stock-levels', { params })
  },

  updateStockLevel: (id, stockData) => {
    return apiClient.put(`/api/inventory/${id}/stock`, stockData)
  },

  adjustStock: (id, adjustmentData) => {
    return apiClient.post(`/api/inventory/${id}/adjust-stock`, adjustmentData)
  },

  getLowStockItems: (params = {}) => {
    return apiClient.get('/api/inventory/low-stock', { params })
  },

  getOutOfStockItems: (params = {}) => {
    return apiClient.get('/api/inventory/out-of-stock', { params })
  },

  getExpiredItems: (params = {}) => {
    return apiClient.get('/api/inventory/expired', { params })
  },

  getExpiringItems: (params = {}) => {
    return apiClient.get('/api/inventory/expiring', { params })
  },

  // Stock Movements
  getStockMovements: (params = {}) => {
    return apiClient.get('/api/inventory/stock-movements', { params })
  },

  getStockMovement: (id) => {
    return apiClient.get(`/api/inventory/stock-movements/${id}`)
  },

  createStockMovement: (movementData) => {
    return apiClient.post('/api/inventory/stock-movements', movementData)
  },

  updateStockMovement: (id, movementData) => {
    return apiClient.put(`/api/inventory/stock-movements/${id}`, movementData)
  },

  deleteStockMovement: (id) => {
    return apiClient.delete(`/api/inventory/stock-movements/${id}`)
  },

  // Stock Transfers
  getStockTransfers: (params = {}) => {
    return apiClient.get('/api/inventory/transfers', { params })
  },

  getStockTransfer: (id) => {
    return apiClient.get(`/api/inventory/transfers/${id}`)
  },

  createStockTransfer: (transferData) => {
    return apiClient.post('/api/inventory/transfers', transferData)
  },

  updateStockTransfer: (id, transferData) => {
    return apiClient.put(`/api/inventory/transfers/${id}`, transferData)
  },

  deleteStockTransfer: (id) => {
    return apiClient.delete(`/api/inventory/transfers/${id}`)
  },

  approveStockTransfer: (id) => {
    return apiClient.post(`/api/inventory/transfers/${id}/approve`)
  },

  completeStockTransfer: (id, completionData) => {
    return apiClient.post(`/api/inventory/transfers/${id}/complete`, completionData)
  },

  // Stock Counts
  getStockCounts: (params = {}) => {
    return apiClient.get('/api/inventory/stock-counts', { params })
  },

  getStockCount: (id) => {
    return apiClient.get(`/api/inventory/stock-counts/${id}`)
  },

  createStockCount: (countData) => {
    return apiClient.post('/api/inventory/stock-counts', countData)
  },

  updateStockCount: (id, countData) => {
    return apiClient.put(`/api/inventory/stock-counts/${id}`, countData)
  },

  deleteStockCount: (id) => {
    return apiClient.delete(`/api/inventory/stock-counts/${id}`)
  },

  startStockCount: (id) => {
    return apiClient.post(`/api/inventory/stock-counts/${id}/start`)
  },

  completeStockCount: (id, completionData) => {
    return apiClient.post(`/api/inventory/stock-counts/${id}/complete`, completionData)
  },

  // Inventory Locations
  getInventoryLocations: (params = {}) => {
    return apiClient.get('/api/inventory/locations', { params })
  },

  getInventoryLocation: (id) => {
    return apiClient.get(`/api/inventory/locations/${id}`)
  },

  createInventoryLocation: (locationData) => {
    return apiClient.post('/api/inventory/locations', locationData)
  },

  updateInventoryLocation: (id, locationData) => {
    return apiClient.put(`/api/inventory/locations/${id}`, locationData)
  },

  deleteInventoryLocation: (id) => {
    return apiClient.delete(`/api/inventory/locations/${id}`)
  },

  // Inventory Statistics
  getInventoryStats: (params = {}) => {
    return apiClient.get('/api/inventory/stats', { params })
  },

  getStockValueStats: (params = {}) => {
    return apiClient.get('/api/inventory/stock-value', { params })
  },

  getTurnoverStats: (params = {}) => {
    return apiClient.get('/api/inventory/turnover', { params })
  },

  // Inventory Reports
  generateInventoryReport: (reportData) => {
    return apiClient.post('/api/inventory/reports', reportData)
  },

  generateStockLevelReport: (reportData) => {
    return apiClient.post('/api/inventory/reports/stock-levels', reportData)
  },

  generateStockMovementReport: (reportData) => {
    return apiClient.post('/api/inventory/reports/stock-movements', reportData)
  },

  generateStockValueReport: (reportData) => {
    return apiClient.post('/api/inventory/reports/stock-value', reportData)
  },

  // Export
  exportInventory: (filters = {}) => {
    return apiClient.get('/api/inventory/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportStockMovements: (filters = {}) => {
    return apiClient.get('/api/inventory/stock-movements/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportStockTransfers: (filters = {}) => {
    return apiClient.get('/api/inventory/transfers/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default inventoryApi