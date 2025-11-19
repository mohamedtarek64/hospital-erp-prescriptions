import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export const useToast = () => {
  const addToast = (toast) => {
    const id = ++toastId
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  const success = (message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    })
  }

  const error = (message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      duration: 7000,
      ...options
    })
  }

  const warning = (message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      ...options
    })
  }

  const info = (message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}