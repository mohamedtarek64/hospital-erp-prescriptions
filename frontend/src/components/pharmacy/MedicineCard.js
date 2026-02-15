import { computed } from 'vue'
import { useMedicineManager } from '@/managers/medicineManager'

export class MedicineCardManager {
  constructor(props, emit) {
    this.props = props
    this.emit = emit
    this.medicineManager = useMedicineManager()
  }

  // Computed properties
  get isLowStock() {
    return computed(() => {
      return this.medicineManager.isLowStock(this.props.medicine)
    })
  }

  get isOutOfStock() {
    return computed(() => {
      return this.medicineManager.isOutOfStock(this.props.medicine)
    })
  }

  get isExpiringSoon() {
    return computed(() => {
      return this.medicineManager.isExpiringSoon(this.props.medicine)
    })
  }

  // Methods
  getStatusText(status) {
    const statusMap = {
      'in_stock': 'متوفر',
      'low_stock': 'كمية منخفضة',
      'out_of_stock': 'نفذت الكمية',
      'expired': 'منتهي الصلاحية'
    }
    return statusMap[status] || status
  }

  formatPrice(price) {
    return this.medicineManager.formatPrice(price)
  }

  formatDate(date) {
    return this.medicineManager.formatDate(date)
  }

  handleEdit() {
    this.emit('edit', this.props.medicine)
  }

  handleDispense() {
    this.emit('dispense', this.props.medicine)
  }

  handleDelete() {
    this.emit('delete', this.props.medicine)
  }
}

// Composable function
export function useMedicineCardManager(props, emit) {
  return new MedicineCardManager(props, emit)
}
