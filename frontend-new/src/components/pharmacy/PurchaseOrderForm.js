import { ref, computed, reactive } from 'vue'
import { usePharmacyStore } from '@/stores/pharmacy'
import { formatPrice } from '@/utils/pharmacyHelpers'

export function usePurchaseOrderFormManager(props, emit) {
  const pharmacyStore = usePharmacyStore()
  
  // Reactive State
  const form = reactive({
    orderNumber: '',
    orderDate: '',
    supplierId: '',
    priority: 'medium',
    expectedDeliveryDate: '',
    notes: '',
    items: []
  })
  
  const errors = reactive({})
  const isSubmitting = ref(false)
  const suppliers = ref([])
  const medicines = ref([])
  
  // Computed Properties
  const isEditing = computed(() => !!props.order)
  
  const totalQuantity = computed(() => {
    return form.items.reduce((total, item) => total + (item.quantity || 0), 0)
  })
  
  const totalAmount = computed(() => {
    return form.items.reduce((total, item) => {
      return total + ((item.quantity || 0) * (item.unitPrice || 0))
    }, 0)
  })
  
  const taxAmount = computed(() => {
    return totalAmount.value * 0.15 // 15% tax
  })
  
  const finalTotal = computed(() => {
    return totalAmount.value + taxAmount.value
  })
  
  // Methods
  const initializeForm = async () => {
    await loadSuppliers()
    await loadMedicines()
    
    if (isEditing.value) {
      populateForm()
    } else {
      resetForm()
    }
  }
  
  const populateForm = () => {
    if (!props.order) return
    
    const order = props.order
    form.orderNumber = order.orderNumber || ''
    form.orderDate = order.orderDate || ''
    form.supplierId = order.supplierId || ''
    form.priority = order.priority || 'medium'
    form.expectedDeliveryDate = order.expectedDeliveryDate || ''
    form.notes = order.notes || ''
    form.items = order.items ? [...order.items] : []
  }
  
  const resetForm = () => {
    form.orderNumber = generateOrderNumber()
    form.orderDate = new Date().toISOString().split('T')[0]
    form.supplierId = ''
    form.priority = 'medium'
    form.expectedDeliveryDate = ''
    form.notes = ''
    form.items = []
    clearErrors()
  }
  
  const generateOrderNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `PO-${timestamp}-${random}`
  }
  
  const loadSuppliers = async () => {
    try {
      suppliers.value = pharmacyStore.suppliers
      if (suppliers.value.length === 0) {
        // Load from API if store is empty
        await pharmacyStore.fetchSuppliers()
        suppliers.value = pharmacyStore.suppliers
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      suppliers.value = []
    }
  }
  
  const loadMedicines = async () => {
    try {
      medicines.value = pharmacyStore.medicines
      if (medicines.value.length === 0) {
        // Load from API if store is empty
        await pharmacyStore.fetchMedicines()
        medicines.value = pharmacyStore.medicines
      }
    } catch (error) {
      console.error('Error loading medicines:', error)
      medicines.value = []
    }
  }
  
  const addItem = () => {
    form.items.push({
      medicineId: '',
      quantity: 1,
      unitPrice: 0,
      notes: ''
    })
  }
  
  const removeItem = (index) => {
    form.items.splice(index, 1)
  }
  
  const calculateItemTotal = (item) => {
    const quantity = item.quantity || 0
    const unitPrice = item.unitPrice || 0
    return formatPrice(quantity * unitPrice)
  }
  
  const getItemError = (index, field) => {
    const itemErrors = errors[`items.${index}.${field}`]
    return itemErrors || ''
  }
  
  const validateForm = () => {
    clearErrors()
    let isValid = true
    
    // Basic validation
    if (!form.orderDate) {
      errors.orderDate = 'تاريخ الطلب مطلوب'
      isValid = false
    }
    
    if (!form.supplierId) {
      errors.supplierId = 'اختيار المورد مطلوب'
      isValid = false
    }
    
    if (!form.expectedDeliveryDate) {
      errors.expectedDeliveryDate = 'تاريخ التسليم المتوقع مطلوب'
      isValid = false
    }
    
    // Validate items
    if (form.items.length === 0) {
      errors.items = 'يجب إضافة عنصر واحد على الأقل'
      isValid = false
    }
    
    form.items.forEach((item, index) => {
      if (!item.medicineId) {
        errors[`items.${index}.medicineId`] = 'اختيار العنصر مطلوب'
        isValid = false
      }
      
      if (!item.quantity || item.quantity < 1) {
        errors[`items.${index}.quantity`] = 'الكمية يجب أن تكون أكبر من صفر'
        isValid = false
      }
      
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors[`items.${index}.unitPrice`] = 'سعر الوحدة يجب أن يكون أكبر من صفر'
        isValid = false
      }
    })
    
    return isValid
  }
  
  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      delete errors[key]
    })
  }
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }
    
    isSubmitting.value = true
    
    try {
      const orderData = {
        ...form,
        totalAmount: totalAmount.value,
        taxAmount: taxAmount.value,
        finalTotal: finalTotal.value
      }
      
      if (isEditing.value) {
        await pharmacyStore.updatePurchaseOrder(props.order.id, orderData)
      } else {
        await pharmacyStore.createPurchaseOrder(orderData)
      }
      
      emit('submit', orderData)
      resetForm()
    } catch (error) {
      console.error('Error submitting order:', error)
      // Handle error display
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    // State
    form,
    errors,
    isSubmitting,
    suppliers,
    medicines,
    
    // Computed
    isEditing,
    totalQuantity,
    totalAmount,
    taxAmount,
    finalTotal,
    
    // Methods
    initializeForm,
    populateForm,
    resetForm,
    addItem,
    removeItem,
    calculateItemTotal,
    getItemError,
    validateForm,
    clearErrors,
    handleSubmit
  }
}
