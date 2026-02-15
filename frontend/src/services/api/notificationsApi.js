/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import apiClient from '@/utils/apiClient'

export const notificationsApi = {
  // Notifications
  getNotifications: (params = {}) => {
    return apiClient.get('/api/notifications', { params })
  },

  getNotification: (id) => {
    return apiClient.get(`/api/notifications/${id}`)
  },

  createNotification: (notificationData) => {
    return apiClient.post('/api/notifications', notificationData)
  },

  updateNotification: (id, notificationData) => {
    return apiClient.put(`/api/notifications/${id}`, notificationData)
  },

  deleteNotification: (id) => {
    return apiClient.delete(`/api/notifications/${id}`)
  },

  // Mark as Read
  markAsRead: (id) => {
    return apiClient.patch(`/api/notifications/${id}/read`)
  },

  markAllAsRead: () => {
    return apiClient.patch('/api/notifications/mark-all-read')
  },

  // Mark as Unread
  markAsUnread: (id) => {
    return apiClient.patch(`/api/notifications/${id}/unread`)
  },

  // Notification Types
  getNotificationTypes: (params = {}) => {
    return apiClient.get('/api/notifications/types', { params })
  },

  createNotificationType: (typeData) => {
    return apiClient.post('/api/notifications/types', typeData)
  },

  updateNotificationType: (id, typeData) => {
    return apiClient.put(`/api/notifications/types/${id}`, typeData)
  },

  deleteNotificationType: (id) => {
    return apiClient.delete(`/api/notifications/types/${id}`)
  },

  // Notification Templates
  getNotificationTemplates: (params = {}) => {
    return apiClient.get('/api/notifications/templates', { params })
  },

  getNotificationTemplate: (id) => {
    return apiClient.get(`/api/notifications/templates/${id}`)
  },

  createNotificationTemplate: (templateData) => {
    return apiClient.post('/api/notifications/templates', templateData)
  },

  updateNotificationTemplate: (id, templateData) => {
    return apiClient.put(`/api/notifications/templates/${id}`, templateData)
  },

  deleteNotificationTemplate: (id) => {
    return apiClient.delete(`/api/notifications/templates/${id}`)
  },

  // Notification Settings
  getNotificationSettings: (params = {}) => {
    return apiClient.get('/api/notifications/settings', { params })
  },

  updateNotificationSettings: (settingsData) => {
    return apiClient.put('/api/notifications/settings', settingsData)
  },

  // User Notifications
  getUserNotifications: (userId, params = {}) => {
    return apiClient.get(`/api/notifications/user/${userId}`, { params })
  },

  getUserUnreadCount: (userId) => {
    return apiClient.get(`/api/notifications/user/${userId}/unread-count`)
  },

  markUserNotificationsAsRead: (userId) => {
    return apiClient.patch(`/api/notifications/user/${userId}/mark-read`)
  },

  // Broadcast Notifications
  broadcastNotification: (broadcastData) => {
    return apiClient.post('/api/notifications/broadcast', broadcastData)
  },

  // Scheduled Notifications
  getScheduledNotifications: (params = {}) => {
    return apiClient.get('/api/notifications/scheduled', { params })
  },

  createScheduledNotification: (scheduledData) => {
    return apiClient.post('/api/notifications/scheduled', scheduledData)
  },

  updateScheduledNotification: (id, scheduledData) => {
    return apiClient.put(`/api/notifications/scheduled/${id}`, scheduledData)
  },

  deleteScheduledNotification: (id) => {
    return apiClient.delete(`/api/notifications/scheduled/${id}`)
  },

  // Notification Statistics
  getNotificationStats: (params = {}) => {
    return apiClient.get('/api/notifications/stats', { params })
  },

  getDeliveryStats: (params = {}) => {
    return apiClient.get('/api/notifications/delivery-stats', { params })
  },

  getReadStats: (params = {}) => {
    return apiClient.get('/api/notifications/read-stats', { params })
  },

  // Notification Reports
  generateNotificationReport: (reportData) => {
    return apiClient.post('/api/notifications/reports', reportData)
  },

  generateDeliveryReport: (reportData) => {
    return apiClient.post('/api/notifications/reports/delivery', reportData)
  },

  // Export
  exportNotifications: (filters = {}) => {
    return apiClient.get('/api/notifications/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportNotificationTemplates: (filters = {}) => {
    return apiClient.get('/api/notifications/templates/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default notificationsApi