/**
 * Pharmacy API Service
 * Handles all pharmacy-related API calls
 */

import apiClient from '@/utils/apiClient'

export const pharmacyApi = {
  // Medicines
  getMedicines: (params = {}) => {
    return apiClient.get('/api/pharmacy/medicines', { params })
  },

  getMedicine: (id) => {
    return apiClient.get(`/api/pharmacy/medicines/${id}`)
  },

  createMedicine: (medicineData) => {
    return apiClient.post('/api/pharmacy/medicines', medicineData)
  },

  updateMedicine: (id, medicineData) => {
    return apiClient.put(`/api/pharmacy/medicines/${id}`, medicineData)
  },

  deleteMedicine: (id) => {
    return apiClient.delete(`/api/pharmacy/medicines/${id}`)
  },

  // Inventory
  getInventory: (params = {}) => {
    return apiClient.get('/api/pharmacy/inventory', { params })
  },

  updateStock: (id, stockData) => {
    return apiClient.post(`/api/pharmacy/medicines/${id}/stock`, stockData)
  },

  getLowStock: () => {
    return apiClient.get('/api/pharmacy/inventory/low-stock')
  },

  getExpiredMedicines: () => {
    return apiClient.get('/api/pharmacy/inventory/expired')
  },

  // Prescriptions
  getPrescriptions: (params = {}) => {
    return apiClient.get('/api/pharmacy/prescriptions', { params })
  },

  getPrescription: (id) => {
    return apiClient.get(`/api/pharmacy/prescriptions/${id}`)
  },

  createPrescription: (prescriptionData) => {
    return apiClient.post('/api/pharmacy/prescriptions', prescriptionData)
  },

  updatePrescription: (id, prescriptionData) => {
    return apiClient.put(`/api/pharmacy/prescriptions/${id}`, prescriptionData)
  },

  deletePrescription: (id) => {
    return apiClient.delete(`/api/pharmacy/prescriptions/${id}`)
  },

  dispensePrescription: (id, dispensingData) => {
    return apiClient.post(`/api/prescriptions/${id}/dispense`, dispensingData)
  },

  // Suppliers
  getSuppliers: (params = {}) => {
    return apiClient.get('/api/pharmacy/suppliers', { params })
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

  // Purchase Orders
  getPurchaseOrders: (params = {}) => {
    return apiClient.get('/api/pharmacy/purchase-orders', { params })
  },

  getPurchaseOrder: (id) => {
    return apiClient.get(`/api/purchase-orders/${id}`)
  },

  createPurchaseOrder: (orderData) => {
    return apiClient.post('/api/purchase-orders', orderData)
  },

  updatePurchaseOrder: (id, orderData) => {
    return apiClient.put(`/api/purchase-orders/${id}`, orderData)
  },

  deletePurchaseOrder: (id) => {
    return apiClient.delete(`/api/purchase-orders/${id}`)
  },

  approvePurchaseOrder: (id) => {
    return apiClient.patch(`/api/purchase-orders/${id}/approve`)
  },

  receivePurchaseOrder: (id, receivingData) => {
    return apiClient.patch(`/api/purchase-orders/${id}/receive`, receivingData)
  },

  // Analytics
  getAnalytics: (params = {}) => {
    return apiClient.get('/api/pharmacy/analytics', { params })
  },

  getSalesReport: (params = {}) => {
    return apiClient.get('/api/pharmacy/sales-report', { params })
  },

  getInventoryReport: (params = {}) => {
    return apiClient.get('/api/pharmacy/inventory-report', { params })
  },

  getExpiryReport: (params = {}) => {
    return apiClient.get('/api/pharmacy/expiry-report', { params })
  },

  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/pharmacy/dashboard')
  },

  getStats: (params = {}) => {
    return apiClient.get('/api/pharmacy/stats', { params })
  },

  // Export
  exportMedicines: (filters = {}) => {
    return apiClient.get('/api/pharmacy/medicines/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportInventory: (filters = {}) => {
    return apiClient.get('/api/pharmacy/inventory/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportPrescriptions: (filters = {}) => {
    return apiClient.get('/api/pharmacy/prescriptions/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default pharmacyApi
