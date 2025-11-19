/**
 * Billing API Service
 * Handles all billing-related API calls
 */

import apiClient from '@/utils/apiClient'

export const billingApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/billing/dashboard')
  },

  // Invoices
  getInvoices: (params = {}) => {
    return apiClient.get('/api/billing/invoices', { params })
  },

  getInvoice: (id) => {
    return apiClient.get(`/api/billing/invoices/${id}`)
  },

  createInvoice: (invoiceData) => {
    return apiClient.post('/api/billing/invoices', invoiceData)
  },

  updateInvoice: (id, invoiceData) => {
    return apiClient.put(`/api/billing/invoices/${id}`, invoiceData)
  },

  deleteInvoice: (id) => {
    return apiClient.delete(`/api/billing/invoices/${id}`)
  },

  sendInvoice: (id) => {
    return apiClient.post(`/api/billing/invoices/${id}/send`)
  },

  markAsPaid: (id, paymentData = {}) => {
    return apiClient.patch(`/api/billing/invoices/${id}/mark-paid`, paymentData)
  },

  // Payments
  getPayments: (params = {}) => {
    return apiClient.get('/api/billing/payments', { params })
  },

  getPayment: (id) => {
    return apiClient.get(`/api/billing/payments/${id}`)
  },

  createPayment: (paymentData) => {
    return apiClient.post('/api/billing/payments', paymentData)
  },

  updatePayment: (id, paymentData) => {
    return apiClient.put(`/api/billing/payments/${id}`, paymentData)
  },

  deletePayment: (id) => {
    return apiClient.delete(`/api/billing/payments/${id}`)
  },

  // Services
  getServices: (params = {}) => {
    return apiClient.get('/api/billing/services', { params })
  },

  getService: (id) => {
    return apiClient.get(`/api/billing/services/${id}`)
  },

  createService: (serviceData) => {
    return apiClient.post('/api/billing/services', serviceData)
  },

  updateService: (id, serviceData) => {
    return apiClient.put(`/api/billing/services/${id}`, serviceData)
  },

  deleteService: (id) => {
    return apiClient.delete(`/api/billing/services/${id}`)
  },

  // Service Categories
  getServiceCategories: (params = {}) => {
    return apiClient.get('/api/service-categories', { params })
  },

  createServiceCategory: (categoryData) => {
    return apiClient.post('/api/service-categories', categoryData)
  },

  updateServiceCategory: (id, categoryData) => {
    return apiClient.put(`/api/service-categories/${id}`, categoryData)
  },

  deleteServiceCategory: (id) => {
    return apiClient.delete(`/api/service-categories/${id}`)
  },

  // Insurance Claims
  getInsuranceClaims: (params = {}) => {
    return apiClient.get('/api/billing/insurance-claims', { params })
  },

  getInsuranceClaim: (id) => {
    return apiClient.get(`/api/billing/insurance-claims/${id}`)
  },

  createInsuranceClaim: (claimData) => {
    return apiClient.post('/api/billing/insurance-claims', claimData)
  },

  updateInsuranceClaim: (id, claimData) => {
    return apiClient.put(`/api/billing/insurance-claims/${id}`, claimData)
  },

  deleteInsuranceClaim: (id) => {
    return apiClient.delete(`/api/billing/insurance-claims/${id}`)
  },

  submitInsuranceClaim: (id) => {
    return apiClient.post(`/api/billing/insurance-claims/${id}/submit`)
  },

  // Revenue Statistics
  getRevenueStats: (params = {}) => {
    return apiClient.get('/api/billing/revenue-stats', { params })
  },

  getMonthlyRevenue: (params = {}) => {
    return apiClient.get('/api/billing/monthly-revenue', { params })
  },

  getDailyRevenue: (params = {}) => {
    return apiClient.get('/api/billing/daily-revenue', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/billing/reports', { params })
  },

  generateInvoiceReport: (reportData) => {
    return apiClient.post('/api/billing/reports/invoice', reportData)
  },

  generatePaymentReport: (reportData) => {
    return apiClient.post('/api/billing/reports/payment', reportData)
  },

  generateRevenueReport: (reportData) => {
    return apiClient.post('/api/billing/reports/revenue', reportData)
  },

  // Export
  exportInvoices: (filters = {}) => {
    return apiClient.get('/api/billing/invoices/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportPayments: (filters = {}) => {
    return apiClient.get('/api/billing/payments/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportRevenue: (filters = {}) => {
    return apiClient.get('/api/billing/revenue/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  // Print
  printInvoice: (id) => {
    return apiClient.get(`/api/billing/invoices/${id}/print`, {
      responseType: 'blob'
    })
  },

  printReceipt: (id) => {
    return apiClient.get(`/api/billing/payments/${id}/print`, {
      responseType: 'blob'
    })
  }
}

export default billingApi