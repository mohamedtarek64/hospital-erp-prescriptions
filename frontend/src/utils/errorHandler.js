/**
 * Enhanced Error Handler Utility
 * Provides comprehensive error handling and user-friendly messages
 */

import { useToast } from '@/composables/useToast'

export class ErrorHandler {
  static toast = useToast()

  /**
   * Handle API errors
   */
  static handleApiError(error, customMessage = null) {
    console.error('API Error:', error)

    let message = customMessage || 'An error occurred'
    let details = null

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 400:
          message = data?.message || 'Invalid request'
          break
        case 401:
          message = 'Unauthorized. Please login again'
          this.handleUnauthorized()
          break
        case 403:
          message = 'You do not have permission to perform this action'
          break
        case 404:
          message = data?.message || 'Resource not found'
          break
        case 422:
          message = data?.message || 'Validation failed'
          details = data?.errors || null
          break
        case 429:
          message = 'Too many requests. Please try again later'
          break
        case 500:
          message = 'Server error. Please try again later'
          break
        default:
          message = data?.message || 'An unexpected error occurred'
      }
    } else if (error.request) {
      // Request made but no response received
      message = 'Network error. Please check your connection'
    } else {
      // Something else happened
      message = error.message || 'An unexpected error occurred'
    }

    this.showError(message, details)

    return {
      message,
      details,
      status: error.response?.status || null
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationErrors(errors) {
    if (!errors) return

    const firstError = Object.values(errors)[0]
    const message = Array.isArray(firstError) ? firstError[0] : firstError

    this.showError(message, errors)

    return {
      message,
      errors
    }
  }

  /**
   * Handle unauthorized access
   */
  static handleUnauthorized() {
    // Clear auth token
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')

    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  /**
   * Show error toast
   */
  static showError(message, details = null) {
    if (this.toast?.error) {
      this.toast.error(message)
    } else {
      console.error('Error:', message, details)
    }
  }

  /**
   * Show success toast
   */
  static showSuccess(message) {
    if (this.toast?.success) {
      this.toast.success(message)
    } else {
      console.log('Success:', message)
    }
  }

  /**
   * Show warning toast
   */
  static showWarning(message) {
    if (this.toast?.warning) {
      this.toast.warning(message)
    } else {
      console.warn('Warning:', message)
    }
  }

  /**
   * Show info toast
   */
  static showInfo(message) {
    if (this.toast?.info) {
      this.toast.info(message)
    } else {
      console.info('Info:', message)
    }
  }

  /**
   * Log error to server (optional)
   */
  static async logErrorToServer(error, context = {}) {
    try {
      // You can implement server-side error logging here
      const errorData = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...context
      }

      // Example: await api.post('/errors/log', errorData)
      console.log('Error logged:', errorData)
    } catch (e) {
      console.error('Failed to log error to server:', e)
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(errorCode) {
    const messages = {
      RESOURCE_NOT_FOUND: 'The requested resource was not found',
      VALIDATION_ERROR: 'Please check your input and try again',
      UNAUTHORIZED: 'You need to be logged in to perform this action',
      FORBIDDEN: 'You do not have permission to access this resource',
      INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later',
      NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection'
    }

    return messages[errorCode] || 'An unexpected error occurred'
  }

  /**
   * Handle promise rejection
   */
  static async handleAsyncError(promise, errorMessage = null) {
    try {
      const result = await promise
      return [null, result]
    } catch (error) {
      this.handleApiError(error, errorMessage)
      return [error, null]
    }
  }

  /**
   * Retry failed request
   */
  static async retryRequest(
    requestFunction,
    maxRetries = 3,
    delay = 1000
  ) {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFunction()
      } catch (error) {
        lastError = error
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }

    this.handleApiError(lastError, `Failed after ${maxRetries} attempts`)
    throw lastError
  }
}

// Export for convenience
export const {
  handleApiError,
  handleValidationErrors,
  handleUnauthorized,
  showError,
  showSuccess,
  showWarning,
  showInfo,
  logErrorToServer,
  getUserFriendlyMessage,
  handleAsyncError,
  retryRequest
} = ErrorHandler


