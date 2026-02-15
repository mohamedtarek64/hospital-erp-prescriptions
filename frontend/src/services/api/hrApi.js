/**
 * HR API Service
 * Handles all HR-related API calls
 */

import apiClient from '@/utils/apiClient'

export const hrApi = {
  // Dashboard
  getDashboard: () => {
    return apiClient.get('/api/hr/dashboard')
  },

  // Employees
  getEmployees: (params = {}) => {
    return apiClient.get('/api/hr/employees', { params })
  },

  getEmployee: (id) => {
    return apiClient.get(`/api/hr/employees/${id}`)
  },

  createEmployee: (employeeData) => {
    return apiClient.post('/api/hr/employees', employeeData)
  },

  updateEmployee: (id, employeeData) => {
    return apiClient.put(`/api/hr/employees/${id}`, employeeData)
  },

  deleteEmployee: (id) => {
    return apiClient.delete(`/api/hr/employees/${id}`)
  },

  // Departments
  getDepartments: (params = {}) => {
    return apiClient.get('/api/hr/departments', { params })
  },

  getDepartment: (id) => {
    return apiClient.get(`/api/hr/departments/${id}`)
  },

  createDepartment: (departmentData) => {
    return apiClient.post('/api/hr/departments', departmentData)
  },

  updateDepartment: (id, departmentData) => {
    return apiClient.put(`/api/hr/departments/${id}`, departmentData)
  },

  deleteDepartment: (id) => {
    return apiClient.delete(`/api/hr/departments/${id}`)
  },

  // Attendance
  getAttendance: (params = {}) => {
    return apiClient.get('/api/hr/attendance', { params })
  },

  getAttendanceByEmployee: (employeeId, params = {}) => {
    return apiClient.get(`/api/hr/attendance/employee/${employeeId}`, { params })
  },

  clockIn: (employeeId, data = {}) => {
    return apiClient.post('/api/hr/attendance/clock-in', { employee_id: employeeId, ...data })
  },

  clockOut: (employeeId, data = {}) => {
    return apiClient.post('/api/hr/attendance/clock-out', { employee_id: employeeId, ...data })
  },

  updateAttendance: (id, attendanceData) => {
    return apiClient.put(`/api/hr/attendance/${id}`, attendanceData)
  },

  // Leave Requests
  getLeaveRequests: (params = {}) => {
    return apiClient.get('/api/hr/leave-requests', { params })
  },

  getLeaveRequest: (id) => {
    return apiClient.get(`/api/hr/leave-requests/${id}`)
  },

  createLeaveRequest: (leaveData) => {
    return apiClient.post('/api/hr/leave-requests', leaveData)
  },

  updateLeaveRequest: (id, leaveData) => {
    return apiClient.put(`/api/hr/leave-requests/${id}`, leaveData)
  },

  approveLeaveRequest: (id, data = {}) => {
    return apiClient.patch(`/api/hr/leave-requests/${id}/approve`, data)
  },

  rejectLeaveRequest: (id, reason) => {
    return apiClient.patch(`/api/hr/leave-requests/${id}/reject`, { reason })
  },

  // Payroll
  getPayroll: (params = {}) => {
    return apiClient.get('/api/hr/payroll', { params })
  },

  getPayrollByEmployee: (employeeId, params = {}) => {
    return apiClient.get(`/api/hr/payroll/employee/${employeeId}`, { params })
  },

  generatePayroll: (payrollData) => {
    return apiClient.post('/api/hr/payroll/generate', payrollData)
  },

  processPayroll: (id) => {
    return apiClient.post(`/api/hr/payroll/${id}/process`)
  },

  // Performance Reviews
  getPerformanceReviews: (params = {}) => {
    return apiClient.get('/api/performance-reviews', { params })
  },

  getPerformanceReview: (id) => {
    return apiClient.get(`/api/performance-reviews/${id}`)
  },

  createPerformanceReview: (reviewData) => {
    return apiClient.post('/api/performance-reviews', reviewData)
  },

  updatePerformanceReview: (id, reviewData) => {
    return apiClient.put(`/api/performance-reviews/${id}`, reviewData)
  },

  // Leave Types
  getLeaveTypes: (params = {}) => {
    return apiClient.get('/api/leave-types', { params })
  },

  createLeaveType: (leaveTypeData) => {
    return apiClient.post('/api/leave-types', leaveTypeData)
  },

  updateLeaveType: (id, leaveTypeData) => {
    return apiClient.put(`/api/leave-types/${id}`, leaveTypeData)
  },

  deleteLeaveType: (id) => {
    return apiClient.delete(`/api/leave-types/${id}`)
  },

  // Statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/hr/stats', { params })
  },

  getAttendanceStats: (params = {}) => {
    return apiClient.get('/api/hr/attendance/stats', { params })
  },

  getLeaveStats: (params = {}) => {
    return apiClient.get('/api/hr/leave/stats', { params })
  },

  // Reports
  getReports: (params = {}) => {
    return apiClient.get('/api/hr/reports', { params })
  },

  generateReport: (reportData) => {
    return apiClient.post('/api/hr/reports/generate', reportData)
  },

  exportEmployees: (filters = {}) => {
    return apiClient.get('/api/hr/employees/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportAttendance: (filters = {}) => {
    return apiClient.get('/api/hr/attendance/export', {
      params: filters,
      responseType: 'blob'
    })
  },

  exportPayroll: (filters = {}) => {
    return apiClient.get('/api/hr/payroll/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default hrApi
