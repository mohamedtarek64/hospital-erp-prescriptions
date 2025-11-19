import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatPrice } from '@/utils/pharmacyHelpers'

export class PurchaseOrdersManager {
  constructor() {
    // Reactive State
    this.orders = ref([])
    this.suppliers = ref([])
    this.categories = ref([])
    this.loading = ref(false)
    this.error = ref(null)
    
    // Modal States
    this.showNewOrderModal = ref(false)
    this.showOrderDetailsModal = ref(false)
    this.selectedOrder = ref(null)
    
    // Filters
    this.searchFilter = ref('')
    this.statusFilter = ref('')
    this.supplierFilter = ref('')
    this.priorityFilter = ref('')
    
    // Pagination
    this.currentPage = ref(1)
    this.itemsPerPage = ref(10)
    this.totalItems = ref(0)
    
    // Statistics
    this.stats = ref({
      pending: 0,
      approved: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalValue: 0
    })
  }

  // Computed Properties
  get filteredOrders() {
    let filtered = this.orders.value

    // Search filter
    if (this.searchFilter.value) {
      const search = this.searchFilter.value.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(search) ||
        order.supplier.name.toLowerCase().includes(search) ||
        order.status.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (this.statusFilter.value) {
      filtered = filtered.filter(order => order.status === this.statusFilter.value)
    }

    // Supplier filter
    if (this.supplierFilter.value) {
      filtered = filtered.filter(order => order.supplier.id === this.supplierFilter.value)
    }

    // Priority filter
    if (this.priorityFilter.value) {
      filtered = filtered.filter(order => order.priority === this.priorityFilter.value)
    }

    return filtered
  }

  get totalPages() {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage.value)
  }

  get paginatedOrders() {
    const start = (this.currentPage.value - 1) * this.itemsPerPage.value
    const end = start + this.itemsPerPage.value
    return this.filteredOrders.slice(start, end)
  }

  get pendingOrders() {
    return this.stats.value.pending
  }

  get approvedOrders() {
    return this.stats.value.approved
  }

  get deliveredOrders() {
    return this.stats.value.delivered
  }

  get totalValue() {
    return formatPrice(this.stats.value.totalValue)
  }

  // API Methods
  async fetchOrders(page = 1) {
    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/purchase-orders?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('فشل في جلب طلبات الشراء')
      }

      const data = await response.json()
      this.orders.value = data.data
      this.totalItems.value = data.total
      this.updateStatistics()
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error fetching orders:', error)
    } finally {
      this.loading.value = false
    }
  }

  async loadSuppliers() {
    try {
      const authStore = useAuthStore()
      const response = await fetch('/api/pharmacy/suppliers', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.suppliers.value = data.data
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  async createOrder(orderData) {
    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch('/api/pharmacy/purchase-orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('فشل في إنشاء طلب الشراء')
      }

      const newOrder = await response.json()
      this.orders.value.unshift(newOrder.data)
      this.updateStatistics()
      this.closeNewOrderModal()
      
      return newOrder.data
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error creating order:', error)
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async updateOrder(orderId, orderData) {
    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/purchase-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('فشل في تحديث طلب الشراء')
      }

      const updatedOrder = await response.json()
      const index = this.orders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        this.orders.value[index] = updatedOrder.data
      }
      
      this.updateStatistics()
      return updatedOrder.data
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error updating order:', error)
      throw error
    } finally {
      this.loading.value = false
    }
  }

  async deleteOrder(order) {
    if (!confirm(`هل أنت متأكد من حذف طلب الشراء #${order.orderNumber}؟`)) {
      return
    }

    try {
      this.loading.value = true
      this.error.value = null
      
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/purchase-orders/${order.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('فشل في حذف طلب الشراء')
      }

      const index = this.orders.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        this.orders.value.splice(index, 1)
      }
      
      this.updateStatistics()
      
    } catch (error) {
      this.error.value = error.message
      console.error('Error deleting order:', error)
    } finally {
      this.loading.value = false
    }
  }

  async approveOrder(orderId) {
    try {
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/purchase-orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await this.fetchOrders()
      }
    } catch (error) {
      console.error('Error approving order:', error)
    }
  }

  async rejectOrder(orderId, reason) {
    try {
      const authStore = useAuthStore()
      const response = await fetch(`/api/pharmacy/purchase-orders/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        await this.fetchOrders()
      }
    } catch (error) {
      console.error('Error rejecting order:', error)
    }
  }

  // Utility Methods
  updateStatistics() {
    const stats = {
      pending: 0,
      approved: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalValue: 0
    }

    this.orders.value.forEach(order => {
      stats[order.status]++
      if (order.status !== 'cancelled') {
        stats.totalValue += order.totalAmount
      }
    })

    this.stats.value = stats
  }

  getStatusText(status) {
    const statusMap = {
      pending: 'معلق',
      approved: 'معتمد',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي'
    }
    return statusMap[status] || status
  }

  getStatusClass(status) {
    const classMap = {
      pending: 'status-pending',
      approved: 'status-approved',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    }
    return classMap[status] || 'status-default'
  }

  getPriorityText(priority) {
    const priorityMap = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة'
    }
    return priorityMap[priority] || priority
  }

  getPriorityClass(priority) {
    const classMap = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    }
    return classMap[priority] || 'priority-default'
  }

  getDeliveryClass(deliveryDate) {
    const today = new Date()
    const delivery = new Date(deliveryDate)
    const diffTime = delivery - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'delivery-overdue'
    if (diffDays <= 3) return 'delivery-urgent'
    if (diffDays <= 7) return 'delivery-warning'
    return 'delivery-normal'
  }

  formatDate(date) {
    return formatDate(date)
  }

  formatPrice(price) {
    return formatPrice(price)
  }

  // Modal Methods
  openNewOrderModal() {
    this.showNewOrderModal.value = true
  }

  closeNewOrderModal() {
    this.showNewOrderModal.value = false
  }

  openOrderDetailsModal(order) {
    this.selectedOrder.value = order
    this.showOrderDetailsModal.value = true
  }

  closeOrderDetailsModal() {
    this.showOrderDetailsModal.value = false
    this.selectedOrder.value = null
  }

  viewOrder(order) {
    this.openOrderDetailsModal(order)
  }

  editOrder(order) {
    // TODO: Implement edit functionality
    console.log('Edit order:', order)
  }

  // Pagination Methods
  async goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.value = page
      await this.fetchOrders(page)
    }
  }

  async nextPage() {
    if (this.currentPage.value < this.totalPages) {
      await this.goToPage(this.currentPage.value + 1)
    }
  }

  async previousPage() {
    if (this.currentPage.value > 1) {
      await this.goToPage(this.currentPage.value - 1)
    }
  }

  // Filter Methods
  setSearchFilter(search) {
    this.searchFilter.value = search
    this.currentPage.value = 1
  }

  setStatusFilter(status) {
    this.statusFilter.value = status
    this.currentPage.value = 1
  }

  setSupplierFilter(supplier) {
    this.supplierFilter.value = supplier
    this.currentPage.value = 1
  }

  setPriorityFilter(priority) {
    this.priorityFilter.value = priority
    this.currentPage.value = 1
  }

  clearFilters() {
    this.searchFilter.value = ''
    this.statusFilter.value = ''
    this.supplierFilter.value = ''
    this.priorityFilter.value = ''
    this.currentPage.value = 1
  }

  // Export Methods
  exportToCSV() {
    const headers = ['رقم الطلب', 'المورد', 'التاريخ', 'الأولوية', 'الحالة', 'إجمالي القيمة', 'تاريخ التسليم المتوقع']
    const csvContent = [
      headers.join(','),
      ...this.filteredOrders.map(order => [
        order.orderNumber,
        order.supplier.name,
        this.formatDate(order.orderDate),
        this.getPriorityText(order.priority),
        this.getStatusText(order.status),
        order.totalAmount,
        this.formatDate(order.expectedDeliveryDate)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  exportToPDF() {
    // TODO: Implement PDF export
    console.log('Export to PDF')
  }

  exportOrders() {
    this.exportToCSV()
  }

  // Initialization
  async initializeData() {
    await Promise.all([
      this.fetchOrders(),
      this.loadSuppliers()
    ])
  }
}

export function usePurchaseOrdersManager() {
  return new PurchaseOrdersManager()
}
