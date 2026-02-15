<template>
  <div class="purchase-order-form">
    <div class="form-header">
      <h3 class="form-title">{{ isEditing ? 'تعديل طلب الشراء' : 'طلب شراء جديد' }}</h3>
      <button @click="$emit('close')" class="btn-close">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <form @submit.prevent="purchaseOrderFormManager.handleSubmit" class="form-container">
      <!-- Basic Information Section -->
      <div class="form-section">
        <h4 class="section-title">المعلومات الأساسية</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="orderNumber" class="form-label">رقم الطلب</label>
            <input 
              id="orderNumber" 
              v-model="purchaseOrderFormManager.form.orderNumber" 
              type="text" 
              class="form-input" 
              :class="{ 'error': purchaseOrderFormManager.errors.orderNumber }" 
              placeholder="سيتم التوليد تلقائياً"
              readonly
            >
            <span v-if="purchaseOrderFormManager.errors.orderNumber" class="error-message">
              {{ purchaseOrderFormManager.errors.orderNumber }}
            </span>
          </div>
          <div class="form-group">
            <label for="orderDate" class="form-label">تاريخ الطلب *</label>
            <input 
              id="orderDate" 
              v-model="purchaseOrderFormManager.form.orderDate" 
              type="date" 
              class="form-input" 
              :class="{ 'error': purchaseOrderFormManager.errors.orderDate }" 
              required
            >
            <span v-if="purchaseOrderFormManager.errors.orderDate" class="error-message">
              {{ purchaseOrderFormManager.errors.orderDate }}
            </span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="supplier" class="form-label">المورد *</label>
            <select 
              id="supplier" 
              v-model="purchaseOrderFormManager.form.supplierId" 
              class="form-select" 
              :class="{ 'error': purchaseOrderFormManager.errors.supplierId }" 
              required
            >
              <option value="">اختر المورد</option>
              <option v-for="supplier in purchaseOrderFormManager.suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }} - {{ supplier.city }}
              </option>
            </select>
            <span v-if="purchaseOrderFormManager.errors.supplierId" class="error-message">
              {{ purchaseOrderFormManager.errors.supplierId }}
            </span>
          </div>
          <div class="form-group">
            <label for="priority" class="form-label">الأولوية</label>
            <select 
              id="priority" 
              v-model="purchaseOrderFormManager.form.priority" 
              class="form-select"
            >
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="expectedDelivery" class="form-label">تاريخ التسليم المتوقع *</label>
            <input 
              id="expectedDelivery" 
              v-model="purchaseOrderFormManager.form.expectedDeliveryDate" 
              type="date" 
              class="form-input" 
              :class="{ 'error': purchaseOrderFormManager.errors.expectedDeliveryDate }" 
              required
            >
            <span v-if="purchaseOrderFormManager.errors.expectedDeliveryDate" class="error-message">
              {{ purchaseOrderFormManager.errors.expectedDeliveryDate }}
            </span>
          </div>
          <div class="form-group">
            <label for="notes" class="form-label">ملاحظات</label>
            <textarea 
              id="notes" 
              v-model="purchaseOrderFormManager.form.notes" 
              class="form-textarea" 
              rows="3" 
              placeholder="أي ملاحظات إضافية..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="form-section">
        <div class="section-header">
          <h4 class="section-title">العناصر المطلوبة</h4>
          <button type="button" @click="purchaseOrderFormManager.addItem()" class="btn-add-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            إضافة عنصر
          </button>
        </div>

        <div v-if="purchaseOrderFormManager.form.items.length === 0" class="no-items">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p class="no-items-text">لا توجد عناصر مضافة</p>
          <p class="no-items-subtext">اضغط على "إضافة عنصر" لبدء إضافة العناصر المطلوبة</p>
        </div>

        <div v-else class="items-list">
          <div 
            v-for="(item, index) in purchaseOrderFormManager.form.items" 
            :key="index" 
            class="item-row"
          >
            <div class="item-content">
              <div class="form-row">
                <div class="form-group">
                  <label :for="`itemName-${index}`" class="form-label">اسم العنصر *</label>
                  <select 
                    :id="`itemName-${index}`" 
                    v-model="item.medicineId" 
                    class="form-select" 
                    :class="{ 'error': purchaseOrderFormManager.getItemError(index, 'medicineId') }" 
                    required
                  >
                    <option value="">اختر العنصر</option>
                    <option v-for="medicine in purchaseOrderFormManager.medicines" :key="medicine.id" :value="medicine.id">
                      {{ medicine.name }} - {{ medicine.genericName }}
                    </option>
                  </select>
                  <span v-if="purchaseOrderFormManager.getItemError(index, 'medicineId')" class="error-message">
                    {{ purchaseOrderFormManager.getItemError(index, 'medicineId') }}
                  </span>
                </div>
                <div class="form-group">
                  <label :for="`itemQuantity-${index}`" class="form-label">الكمية *</label>
                  <input 
                    :id="`itemQuantity-${index}`" 
                    v-model.number="item.quantity" 
                    type="number" 
                    class="form-input" 
                    :class="{ 'error': purchaseOrderFormManager.getItemError(index, 'quantity') }" 
                    min="1" 
                    required
                  >
                  <span v-if="purchaseOrderFormManager.getItemError(index, 'quantity')" class="error-message">
                    {{ purchaseOrderFormManager.getItemError(index, 'quantity') }}
                  </span>
                </div>
                <div class="form-group">
                  <label :for="`itemPrice-${index}`" class="form-label">سعر الوحدة *</label>
                  <input 
                    :id="`itemPrice-${index}`" 
                    v-model.number="item.unitPrice" 
                    type="number" 
                    class="form-input" 
                    :class="{ 'error': purchaseOrderFormManager.getItemError(index, 'unitPrice') }" 
                    min="0.01" 
                    step="0.01" 
                    required
                  >
                  <span v-if="purchaseOrderFormManager.getItemError(index, 'unitPrice')" class="error-message">
                    {{ purchaseOrderFormManager.getItemError(index, 'unitPrice') }}
                  </span>
                </div>
                <div class="form-group">
                  <label class="form-label">إجمالي السعر</label>
                  <div class="total-price-display">
                    {{ purchaseOrderFormManager.calculateItemTotal(item) }}
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label :for="`itemNotes-${index}`" class="form-label">ملاحظات</label>
                  <input 
                    :id="`itemNotes-${index}`" 
                    v-model="item.notes" 
                    type="text" 
                    class="form-input" 
                    placeholder="ملاحظات خاصة بهذا العنصر..."
                  >
                </div>
                <div class="item-actions">
                  <button 
                    type="button" 
                    @click="purchaseOrderFormManager.removeItem(index)" 
                    class="btn-remove-item"
                    title="حذف العنصر"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="form-section order-summary">
        <h4 class="section-title">ملخص الطلب</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">عدد العناصر:</span>
            <span class="summary-value">{{ purchaseOrderFormManager.form.items.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">إجمالي الكمية:</span>
            <span class="summary-value">{{ purchaseOrderFormManager.totalQuantity }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">إجمالي السعر:</span>
            <span class="summary-value total-price">{{ purchaseOrderFormManager.totalAmount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">الضريبة (15%):</span>
            <span class="summary-value tax-amount">{{ purchaseOrderFormManager.taxAmount }}</span>
          </div>
          <div class="summary-item total-row">
            <span class="summary-label">المجموع النهائي:</span>
            <span class="summary-value final-total">{{ purchaseOrderFormManager.finalTotal }}</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn-secondary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          إلغاء
        </button>
        <button type="submit" class="btn-primary" :disabled="purchaseOrderFormManager.isSubmitting">
          <svg v-if="purchaseOrderFormManager.isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ isEditing ? 'تحديث الطلب' : 'إنشاء الطلب' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePurchaseOrderFormManager } from './PurchaseOrderForm.js'

const props = defineProps({
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close'])

const purchaseOrderFormManager = usePurchaseOrderFormManager(props, emit)

const {
  isEditing,
  form,
  errors,
  isSubmitting,
  suppliers,
  medicines,
  totalQuantity,
  totalAmount,
  taxAmount,
  finalTotal
} = purchaseOrderFormManager

const {
  handleSubmit,
  addItem,
  removeItem,
  calculateItemTotal,
  getItemError
} = purchaseOrderFormManager

onMounted(async () => {
  await purchaseOrderFormManager.initializeForm()
})
</script>

<style scoped>
@import './PurchaseOrderForm.css';
</style>
