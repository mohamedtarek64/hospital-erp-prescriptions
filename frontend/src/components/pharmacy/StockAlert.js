import { ref } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { formatDate } from '@/utils/pharmacyHelpers'

export class StockAlertManager {
  constructor() {
    // Reactive State
    this.alerts = ref([])
    this.loading = ref(false)
    this.error = ref(null)
    
    // Filters
    this.severityFilter = ref('')
    this.typeFilter = ref('')
    
    // Pagination
    this.currentPage = ref(1)
    this.itemsPerPage = ref(10)
    
    // Store
    this.inventoryStore = useInventoryStore()
  }

  // Computed Properties
  get filteredAlerts() {
    let filtered = this.alerts.value

    // Severity filter
    if (this.severityFilter.value) {
      filtered = filtered.filter(alert => alert.severity === this.severityFilter.value)
    }

    // Type filter
    if (this.typeFilter.value) {
      filtered = filtered.filter(alert => alert.type === this.typeFilter.value)
    }

    return filtered
  }

  get totalPages() {
    return Math.ceil(this.filteredAlerts.length / this.itemsPerPage.value)
  }

  get paginatedAlerts() {
    const start = (this.currentPage.value - 1) * this.itemsPerPage.value
    const end = start + this.itemsPerPage.value
    return this.filteredAlerts.slice(start, end)
  }

  get criticalAlerts() {
    return this.alerts.value.filter(alert => alert.severity === 'critical')
  }

  get warningAlerts() {
    return this.alerts.value.filter(alert => alert.severity === 'warning')
  }

  get infoAlerts() {
    return this.alerts.value.filter(alert => alert.severity === 'info')
  }

  // Actions
  setLoading(value) {
    this.loading.value = value
  }

  setError(message) {
    this.error.value = message
  }

  clearError() {
    this.error.value = null
  }

  // Alert Management
  acknowledgeAlert(alertId) {
    const alert = this.alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date().toISOString()
      
      // Update store
      this.inventoryStore.acknowledgeAlert(alertId)
    }
  }

  acknowledgeAllAlerts() {
    this.alerts.value.forEach(alert => {
      if (!alert.acknowledged) {
        alert.acknowledged = true
        alert.acknowledgedAt = new Date().toISOString()
      }
    })
    
    // Update store
    this.inventoryStore.acknowledgeAllAlerts()
  }

  removeAlert(alertId) {
    const index = this.alerts.value.findIndex(a => a.id === alertId)
    if (index !== -1) {
      this.alerts.value.splice(index, 1)
      
      // Update store
      this.inventoryStore.removeAlert(alertId)
    }
  }

  clearExpiredAlerts() {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
    this.alerts.value = this.alerts.value.filter(alert => 
      new Date(alert.createdAt) > thirtyDaysAgo
    )
    
    // Update store
    this.inventoryStore.clearExpiredAlerts()
  }

  // Navigation
  viewItem(itemId) {
    // TODO: Navigate to inventory item details
    console.log('View item:', itemId)
    
    // For now, just show a message
    alert(`سيتم إضافة التنقل إلى تفاصيل العنصر ${itemId} قريباً`)
  }

  // Filter Management
  clearFilters() {
    this.severityFilter.value = ''
    this.typeFilter.value = ''
    this.currentPage.value = 1
  }

  // Pagination
  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.value = page
    }
  }

  nextPage() {
    if (this.currentPage.value < this.totalPages) {
      this.goToPage(this.currentPage.value + 1)
    }
  }

  previousPage() {
    if (this.currentPage.value > 1) {
      this.goToPage(this.currentPage.value - 1)
    }
  }

  // Export Functions
  exportAlertsToCSV() {
    const headers = [
      'المستوى',
      'النوع',
      'العنوان',
      'الرسالة',
      'اسم العنصر',
      'تاريخ الإنشاء',
      'تم التأكيد',
      'تاريخ التأكيد'
    ]

    const csvContent = [
      headers.join(','),
      ...this.filteredAlerts.map(alert => [
        alert.severity,
        alert.type,
        alert.title,
        alert.message,
        alert.itemName,
        this.formatDate(alert.createdAt),
        alert.acknowledged ? 'نعم' : 'لا',
        alert.acknowledged ? this.formatDate(alert.acknowledgedAt) : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `stock-alerts-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  exportAlertsToPDF() {
    // TODO: Implement PDF export
    console.log('Export alerts to PDF')
    
    // For now, just show a message
    alert('سيتم إضافة تصدير PDF قريباً')
  }

  // Utility Functions
  formatDate(date) {
    return formatDate(date)
  }

  // Initialization
  async initializeData() {
    try {
      this.setLoading(true)
      this.clearError()
      
      // Get alerts from store
      this.alerts.value = this.inventoryStore.alerts
      
      // If no alerts in store, create some sample alerts
      if (this.alerts.value.length === 0) {
        await this.createSampleAlerts()
      }
      
    } catch (error) {
      this.setError(error.message)
      console.error('Error initializing alerts:', error)
    } finally {
      this.setLoading(false)
    }
  }

  // Sample data creation (for development)
  async createSampleAlerts() {
    const sampleAlerts = [
      {
        id: '1',
        type: 'low_stock',
        severity: 'warning',
        title: 'مخزون منخفض',
        message: 'المخزون الحالي للدواء باراسيتامول منخفض (15 وحدة)',
        itemId: '1',
        itemName: 'باراسيتامول 500mg',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        acknowledged: false
      },
      {
        id: '2',
        type: 'out_of_stock',
        severity: 'critical',
        title: 'نفذ المخزون',
        message: 'الدواء إيبوبروفين نفذ من المخزون',
        itemId: '2',
        itemName: 'إيبوبروفين 400mg',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        acknowledged: false
      },
      {
        id: '3',
        type: 'expiring_soon',
        severity: 'critical',
        title: 'ينتهي الصلاحية قريباً',
        message: 'الدواء أموكسيسيلين سينتهي صلاحيته خلال 5 أيام',
        itemId: '3',
        itemName: 'أموكسيسيلين 500mg',
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        daysUntilExpiry: 5,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        acknowledged: false
      },
      {
        id: '4',
        type: 'expired',
        severity: 'critical',
        title: 'انتهت الصلاحية',
        message: 'الدواء سيفالكسين انتهت صلاحيته',
        itemId: '4',
        itemName: 'سيفالكسين 250mg',
        expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
      },
      {
        id: '5',
        type: 'low_stock',
        severity: 'warning',
        title: 'مخزون منخفض',
        message: 'المخزون الحالي للدواء أوميبرازول منخفض (8 وحدة)',
        itemId: '5',
        itemName: 'أوميبرازول 20mg',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        acknowledged: false
      }
    ]

    this.alerts.value = sampleAlerts
    
    // Update store
    this.inventoryStore.alerts = sampleAlerts
  }
}

export function useStockAlertManager() {
  return new StockAlertManager()
}
