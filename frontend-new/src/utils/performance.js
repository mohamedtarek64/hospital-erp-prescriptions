/**
 * Performance Monitoring Utility
 * Tracks and optimizes application performance
 */

export class PerformanceMonitor {
  static measurements = new Map()
  static metrics = {
    apiCalls: [],
    pageLoads: [],
    componentRenders: []
  }

  /**
   * Start measuring performance
   */
  static startMeasure(label) {
    this.measurements.set(label, performance.now())
  }

  /**
   * End measuring and get duration
   */
  static endMeasure(label) {
    const startTime = this.measurements.get(label)
    if (!startTime) {
      console.warn(`No start time found for measurement: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(label)

    return duration
  }

  /**
   * Measure API call performance
   */
  static measureApiCall(endpoint, method, duration, status) {
    this.metrics.apiCalls.push({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    })

    // Keep only last 100 API calls
    if (this.metrics.apiCalls.length > 100) {
      this.metrics.apiCalls.shift()
    }

    // Log slow API calls
    if (duration > 3000) {
      console.warn(`Slow API call detected: ${method} ${endpoint} took ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Measure page load performance
   */
  static measurePageLoad(route, duration) {
    this.metrics.pageLoads.push({
      route,
      duration,
      timestamp: Date.now()
    })

    // Keep only last 50 page loads
    if (this.metrics.pageLoads.length > 50) {
      this.metrics.pageLoads.shift()
    }

    // Log slow page loads
    if (duration > 2000) {
      console.warn(`Slow page load detected: ${route} took ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Measure component render performance
   */
  static measureComponentRender(component, duration) {
    this.metrics.componentRenders.push({
      component,
      duration,
      timestamp: Date.now()
    })

    // Keep only last 100 component renders
    if (this.metrics.componentRenders.length > 100) {
      this.metrics.componentRenders.shift()
    }

    // Log slow component renders
    if (duration > 500) {
      console.warn(`Slow component render detected: ${component} took ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Get performance statistics
   */
  static getStats() {
    return {
      apiCalls: this.getApiCallStats(),
      pageLoads: this.getPageLoadStats(),
      componentRenders: this.getComponentRenderStats(),
      memory: this.getMemoryStats()
    }
  }

  /**
   * Get API call statistics
   */
  static getApiCallStats() {
    if (this.metrics.apiCalls.length === 0) {
      return { count: 0, average: 0, slowest: null }
    }

    const durations = this.metrics.apiCalls.map(call => call.duration)
    const average = durations.reduce((a, b) => a + b, 0) / durations.length
    const slowest = this.metrics.apiCalls.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    )

    return {
      count: this.metrics.apiCalls.length,
      average: average.toFixed(2),
      slowest: {
        endpoint: slowest.endpoint,
        duration: slowest.duration.toFixed(2)
      },
      failed: this.metrics.apiCalls.filter(call => call.status >= 400).length
    }
  }

  /**
   * Get page load statistics
   */
  static getPageLoadStats() {
    if (this.metrics.pageLoads.length === 0) {
      return { count: 0, average: 0, slowest: null }
    }

    const durations = this.metrics.pageLoads.map(load => load.duration)
    const average = durations.reduce((a, b) => a + b, 0) / durations.length
    const slowest = this.metrics.pageLoads.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    )

    return {
      count: this.metrics.pageLoads.length,
      average: average.toFixed(2),
      slowest: {
        route: slowest.route,
        duration: slowest.duration.toFixed(2)
      }
    }
  }

  /**
   * Get component render statistics
   */
  static getComponentRenderStats() {
    if (this.metrics.componentRenders.length === 0) {
      return { count: 0, average: 0, slowest: null }
    }

    const durations = this.metrics.componentRenders.map(render => render.duration)
    const average = durations.reduce((a, b) => a + b, 0) / durations.length
    const slowest = this.metrics.componentRenders.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    )

    return {
      count: this.metrics.componentRenders.length,
      average: average.toFixed(2),
      slowest: {
        component: slowest.component,
        duration: slowest.duration.toFixed(2)
      }
    }
  }

  /**
   * Get memory statistics
   */
  static getMemoryStats() {
    if (!performance.memory) {
      return { available: false }
    }

    return {
      available: true,
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    }
  }

  /**
   * Clear all metrics
   */
  static clearMetrics() {
    this.measurements.clear()
    this.metrics.apiCalls = []
    this.metrics.pageLoads = []
    this.metrics.componentRenders = []
  }

  /**
   * Export performance data
   */
  static exportData() {
    return {
      stats: this.getStats(),
      rawMetrics: this.metrics,
      timestamp: Date.now()
    }
  }

  /**
   * Log performance summary
   */
  static logSummary() {
    console.group('Performance Summary')
    console.table(this.getStats())
    console.groupEnd()
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce(func, wait = 300) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Throttle function for performance optimization
   */
  static throttle(func, limit = 300) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  /**
   * Lazy load images
   */
  static lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]')
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          observer.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }

  /**
   * Check if browser supports certain features
   */
  static checkBrowserSupport() {
    return {
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof Storage !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: typeof Worker !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      promise: typeof Promise !== 'undefined',
      intersectionObserver: 'IntersectionObserver' in window
    }
  }
}

// Export for convenience
export const {
  startMeasure,
  endMeasure,
  measureApiCall,
  measurePageLoad,
  measureComponentRender,
  getStats,
  clearMetrics,
  exportData,
  logSummary,
  debounce,
  throttle,
  lazyLoadImages,
  checkBrowserSupport
} = PerformanceMonitor


