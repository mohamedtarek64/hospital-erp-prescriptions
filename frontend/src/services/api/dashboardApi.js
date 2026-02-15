/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */

import apiClient from '@/utils/apiClient'

export const dashboardApi = {
  // Get dashboard overview
  getDashboard: () => {
    return apiClient.get('/api/dashboard')
  },

  // Get dashboard statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/dashboard/stats', { params })
  },

  // Get recent activities
  getActivities: (params = {}) => {
    return apiClient.get('/api/dashboard/activities', { params })
  },

  // Get today's appointments
  getTodayAppointments: () => {
    return apiClient.get('/api/appointments/today')
  },

  // Get today's appointments (alias)
  getTodaysAppointments: () => {
    return apiClient.get('/api/appointments/today')
  },

  // Get recent activities (alias)
  getRecentActivities: (params = {}) => {
    return apiClient.get('/api/dashboard/activities', { params })
  },

  // Get patient statistics
  getPatientStats: () => {
    return apiClient.get('/api/patients/stats')
  },

  // Get appointment statistics
  getAppointmentStats: () => {
    return apiClient.get('/api/appointments/stats')
  },

  // Get revenue statistics
  getRevenueStats: (params = {}) => {
    return apiClient.get('/api/billing/revenue-stats', { params })
  },

  // Get ward occupancy
  getWardOccupancy: () => {
    return apiClient.get('/api/ward-management/occupancy')
  },

  // Get emergency cases
  getEmergencyCases: () => {
    return apiClient.get('/api/emergency/cases')
  },

  // Get equipment status
  getEquipmentStatus: () => {
    return apiClient.get('/api/equipment/status')
  },

  // Get lab pending tests
  getPendingLabTests: () => {
    return apiClient.get('/api/laboratory/pending-tests')
  },

  // Get pharmacy alerts
  getPharmacyAlerts: () => {
    return apiClient.get('/api/pharmacy/alerts')
  },

  // Get staff attendance
  getStaffAttendance: () => {
    return apiClient.get('/api/hr/attendance/today')
  },

  // Get system health
  getSystemHealth: () => {
    return apiClient.get('/api/admin/system-health')
  },

  // Get notifications
  getNotifications: (params = {}) => {
    return apiClient.get('/api/notifications', { params })
  },

  // Mark notification as read
  markNotificationRead: (id) => {
    return apiClient.patch(`/api/notifications/${id}/read`)
  },

  // Mark all notifications as read
  markAllNotificationsRead: () => {
    return apiClient.patch('/api/notifications/mark-all-read')
  },

  // Get quick actions
  getQuickActions: () => {
    return apiClient.get('/api/dashboard/quick-actions')
  },

  // Execute quick action
  executeQuickAction: (action, data = {}) => {
    return apiClient.post('/api/dashboard/quick-actions', { action, data })
  }
}

export default dashboardApi