/**
 * Appointments API Service
 * Handles all appointment-related API calls
 */

import apiClient from '@/utils/apiClient'

export const appointmentsApi = {
  // Get all appointments with pagination and filters
  getAppointments: (params = {}) => {
    return apiClient.get('/api/appointments', { params })
  },

  // Get single appointment by ID
  getAppointment: (id) => {
    return apiClient.get(`/api/appointments/${id}`)
  },

  // Create new appointment
  createAppointment: (appointmentData) => {
    return apiClient.post('/api/appointments', appointmentData)
  },

  // Update appointment
  updateAppointment: (id, appointmentData) => {
    return apiClient.put(`/api/appointments/${id}`, appointmentData)
  },

  // Delete appointment
  deleteAppointment: (id) => {
    return apiClient.delete(`/api/appointments/${id}`)
  },

  // Get appointments calendar
  getCalendar: (params = {}) => {
    return apiClient.get('/api/appointments/calendar', { params })
  },

  // Get today's appointments
  getTodayAppointments: () => {
    return apiClient.get('/api/appointments/today')
  },

  // Get appointments by date range
  getAppointmentsByDateRange: (startDate, endDate) => {
    return apiClient.get('/api/appointments', {
      params: { start_date: startDate, end_date: endDate }
    })
  },

  // Get appointments by doctor
  getAppointmentsByDoctor: (doctorId, params = {}) => {
    return apiClient.get('/api/appointments', {
      params: { doctor_id: doctorId, ...params }
    })
  },

  // Get appointments by patient
  getAppointmentsByPatient: (patientId, params = {}) => {
    return apiClient.get('/api/appointments', {
      params: { patient_id: patientId, ...params }
    })
  },

  // Update appointment status
  updateStatus: (id, status) => {
    return apiClient.patch(`/api/appointments/${id}/status`, { status })
  },

  // Reschedule appointment
  reschedule: (id, newDateTime) => {
    return apiClient.patch(`/api/appointments/${id}/reschedule`, {
      appointment_date: newDateTime
    })
  },

  // Cancel appointment
  cancel: (id, reason = '') => {
    return apiClient.patch(`/api/appointments/${id}/cancel`, { reason })
  },

  // Complete appointment
  complete: (id, notes = '') => {
    return apiClient.patch(`/api/appointments/${id}/complete`, { notes })
  },

  // Get appointment statistics
  getStats: (params = {}) => {
    return apiClient.get('/api/appointments/stats', { params })
  },

  // Export appointments
  exportAppointments: (filters = {}) => {
    return apiClient.get('/api/appointments/export', {
      params: filters,
      responseType: 'blob'
    })
  }
}

export default appointmentsApi