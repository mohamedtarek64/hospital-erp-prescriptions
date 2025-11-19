/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import apiClient from '@/utils/apiClient'

export const authApi = {
  // Login
  login: (credentials) => {
    return apiClient.post('/api/login', credentials)
  },

  // Logout
  logout: (refreshToken) => {
    return apiClient.post('/api/logout', { refresh_token: refreshToken })
  },

  // Register
  register: (userData) => {
    return apiClient.post('/api/register', userData)
  },

  // Refresh Token
  refreshToken: (refreshToken) => {
    return apiClient.post('/api/refresh', { refresh_token: refreshToken })
  },

  // Profile
  getProfile: () => {
    return apiClient.get('/api/profile')
  },

  updateProfile: (profileData) => {
    return apiClient.put('/api/profile', profileData)
  },

  // Change Password
  changePassword: (passwordData) => {
    return apiClient.post('/api/change-password', passwordData)
  },

  // Forgot Password
  forgotPassword: (email) => {
    return apiClient.post('/api/forgot-password', { email })
  },

  // Reset Password
  resetPassword: (resetData) => {
    return apiClient.post('/api/reset-password', resetData)
  },

  // Verify Email
  verifyEmail: (token) => {
    return apiClient.post('/api/verify-email', { token })
  },

  // Resend Verification
  resendVerification: (email) => {
    return apiClient.post('/api/resend-verification', { email })
  },

  // Two Factor Authentication
  enable2FA: () => {
    return apiClient.post('/api/2fa/enable')
  },

  disable2FA: (code) => {
    return apiClient.post('/api/2fa/disable', { code })
  },

  verify2FA: (code) => {
    return apiClient.post('/api/2fa/verify', { code })
  },

  // Session Management
  getSessions: () => {
    return apiClient.get('/api/sessions')
  },

  revokeSession: (sessionId) => {
    return apiClient.delete(`/api/sessions/${sessionId}`)
  },

  revokeAllSessions: () => {
    return apiClient.delete('/api/sessions')
  },

  // User Permissions
  getUserPermissions: () => {
    return apiClient.get('/api/user/permissions')
  },

  getUserRoles: () => {
    return apiClient.get('/api/user/roles')
  },

  // Security
  getSecurityLogs: (params = {}) => {
    return apiClient.get('/api/security/logs', { params })
  },

  getLoginAttempts: (params = {}) => {
    return apiClient.get('/api/security/login-attempts', { params })
  },

  // Account Lockout
  unlockAccount: (userId) => {
    return apiClient.post(`/api/admin/users/${userId}/unlock`)
  },

  lockAccount: (userId, reason) => {
    return apiClient.post(`/api/admin/users/${userId}/lock`, { reason })
  },

  // Password Policy
  getPasswordPolicy: () => {
    return apiClient.get('/api/password-policy')
  },

  validatePassword: (password) => {
    return apiClient.post('/api/password-policy/validate', { password })
  },

  // Account Settings
  getAccountSettings: () => {
    return apiClient.get('/api/account/settings')
  },

  updateAccountSettings: (settingsData) => {
    return apiClient.put('/api/account/settings', settingsData)
  },

  // Privacy Settings
  getPrivacySettings: () => {
    return apiClient.get('/api/account/privacy')
  },

  updatePrivacySettings: (privacyData) => {
    return apiClient.put('/api/account/privacy', privacyData)
  },

  // Data Export
  requestDataExport: () => {
    return apiClient.post('/api/account/export-data')
  },

  getDataExportStatus: () => {
    return apiClient.get('/api/account/export-data/status')
  },

  downloadDataExport: () => {
    return apiClient.get('/api/account/export-data/download', {
      responseType: 'blob'
    })
  },

  // Account Deletion
  requestAccountDeletion: (reason) => {
    return apiClient.post('/api/account/delete', { reason })
  },

  confirmAccountDeletion: (confirmationCode) => {
    return apiClient.post('/api/account/delete/confirm', { confirmation_code: confirmationCode })
  },

  // Activity Logs
  getActivityLogs: (params = {}) => {
    return apiClient.get('/api/account/activity', { params })
  },

  // Security Questions
  getSecurityQuestions: () => {
    return apiClient.get('/api/security-questions')
  },

  setSecurityQuestions: (questionsData) => {
    return apiClient.post('/api/security-questions', questionsData)
  },

  verifySecurityQuestions: (answers) => {
    return apiClient.post('/api/security-questions/verify', { answers })
  }
}

export default authApi