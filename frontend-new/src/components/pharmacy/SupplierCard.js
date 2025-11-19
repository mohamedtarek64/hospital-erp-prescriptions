import { useSupplierManager } from '@/managers/supplierManager'

export class SupplierCardManager {
  constructor(props, emit) {
    this.props = props
    this.emit = emit
    this.supplierManager = useSupplierManager()
  }

  // Methods
  getStatusText(status) {
    const statusMap = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'suspended': 'معلق',
      'pending': 'في الانتظار'
    }
    return statusMap[status] || status
  }

  formatPhone(phone) {
    return this.supplierManager.formatPhone(phone)
  }

  formatPrice(price) {
    return this.supplierManager.formatPrice(price)
  }

  handleEdit() {
    this.emit('edit', this.props.supplier)
  }

  handleViewOrders() {
    this.emit('viewOrders', this.props.supplier)
  }

  handleDelete() {
    this.emit('delete', this.props.supplier)
  }
}

// Composable function
export function useSupplierCardManager(props, emit) {
  return new SupplierCardManager(props, emit)
}
