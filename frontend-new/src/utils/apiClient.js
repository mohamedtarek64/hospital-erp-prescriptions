/**
 * API Client for Hospital Management System
 * Provides centralized API communication with error handling and authentication
 */

import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken.getAttribute('content')
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      authStore.logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    if (error.response?.status === 403) {
      // Insufficient permissions
      console.error('Access denied:', error.response.data.message)
      return Promise.reject(error)
    }
    
    if (error.response?.status === 422) {
      // Validation errors
      return Promise.reject(error)
    }
    
    if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data.message)
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // Generic CRUD operations
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // File upload
  upload: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // Download file
  download: (url, config = {}) => {
    return apiClient.get(url, {
      ...config,
      responseType: 'blob'
    })
  }
}

// Specific API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/api/login',
    logout: '/api/logout',
    register: '/api/register',
    refresh: '/api/refresh',
    profile: '/api/profile',
    changePassword: '/api/change-password'
  },
    
  // Patients
  patients: {
    list: '/patients',
    create: '/patients',
    show: (id) => `/patients/${id}`,
    update: (id) => `/patients/${id}`,
    delete: (id) => `/patients/${id}`,
    search: '/patients/search'
  },
  
  // Appointments
  appointments: {
    list: '/appointments',
    create: '/appointments',
    show: (id) => `/appointments/${id}`,
    update: (id) => `/appointments/${id}`,
    delete: (id) => `/appointments/${id}`,
    calendar: '/appointments/calendar'
  },
  
  // Medical Records
  medicalRecords: {
    list: '/medical-records',
    create: '/medical-records',
    show: (id) => `/medical-records/${id}`,
    update: (id) => `/medical-records/${id}`,
    delete: (id) => `/medical-records/${id}`,
    patientHistory: (patientId) => `/medical-records/patient/${patientId}`
  },
  
  // Pharmacy
  pharmacy: {
    medicines: '/pharmacy/medicines',
    inventory: '/pharmacy/inventory',
    prescriptions: '/pharmacy/prescriptions',
    suppliers: '/pharmacy/suppliers',
    purchaseOrders: '/pharmacy/purchase-orders'
  },
  
  // Billing
  billing: {
    invoices: '/billing/invoices',
    payments: '/billing/payments',
    services: '/billing/services',
    insuranceClaims: '/billing/insurance-claims'
  },
  
  // Laboratory
  laboratory: {
    tests: '/laboratory/tests',
    requests: '/laboratory/requests',
    results: '/laboratory/results',
    samples: '/laboratory/samples'
  },
  
  // HR
  hr: {
    employees: '/hr/employees',
    attendance: '/hr/attendance',
    leaveRequests: '/hr/leave-requests',
    payroll: '/hr/payroll'
  },
  
  // Reports
  reports: {
    list: '/reports',
    generate: '/reports/generate',
    templates: '/reports/templates'
  },
  
  // Ward Management
  wardManagement: {
    wards: '/ward-management/wards',
    beds: '/ward-management/beds',
    admissions: '/ward-management/admissions',
    transfers: '/ward-management/transfers'
  },
  
  // System Administration
  admin: {
    users: '/admin/users',
    roles: '/admin/roles',
    permissions: '/admin/permissions',
    settings: '/admin/settings',
    logs: '/admin/logs',
    backups: '/admin/backups'
  },
  
  // Emergency
  emergency: {
    cases: '/emergency/cases',
    ambulances: '/emergency/ambulances',
    triage: '/emergency/triage',
    alerts: '/emergency/alerts'
  },
  
  // Equipment
  equipment: {
    list: '/equipment',
    maintenance: '/equipment/maintenance',
    locations: '/equipment/locations',
    contracts: '/equipment/contracts'
  }
}

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.message || 'Bad request',
          errors: data.errors || {}
        }
      case 401:
        return {
          type: 'authentication',
          message: 'Authentication required',
          errors: {}
        }
      case 403:
        return {
          type: 'authorization',
          message: 'Access denied',
          errors: {}
        }
      case 404:
        return {
          type: 'not_found',
          message: 'Resource not found',
          errors: {}
        }
      case 422:
        return {
          type: 'validation',
          message: data.message || 'Validation failed',
          errors: data.errors || {}
        }
      case 500:
        return {
          type: 'server',
          message: 'Internal server error',
          errors: {}
        }
      default:
        return {
          type: 'unknown',
          message: data.message || 'An error occurred',
          errors: {}
        }
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      type: 'network',
      message: 'Network error - please check your connection',
      errors: {}
    }
  } else {
    // Something else happened
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      errors: {}
    }
  }
}

// Request utilities
export const createFormData = (data) => {
  const formData = new FormData()
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key])
      } else if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${key}[${index}]`, item)
          } else {
            formData.append(`${key}[${index}]`, JSON.stringify(item))
          }
        })
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]))
      } else {
        formData.append(key, data[key])
      }
    }
  })
  
  return formData
}

// Response utilities
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Pagination utilities
export const createPaginationParams = (page = 1, perPage = 15, filters = {}) => {
  return {
    page,
    per_page: perPage,
    ...filters
  }
}

// Search utilities
export const createSearchParams = (query, filters = {}) => {
  return {
    q: query,
    ...filters
  }
}

// Date range utilities
export const createDateRangeParams = (startDate, endDate) => {
  return {
    start_date: startDate,
    end_date: endDate
  }
}

// Export default apiClient for backward compatibility
export default apiClient
