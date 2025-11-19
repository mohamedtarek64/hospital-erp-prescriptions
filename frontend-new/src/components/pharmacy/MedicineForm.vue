<template>
  <div class="medicine-form-container">
    <div class="medicine-form-header">
      <h2 class="medicine-form-title">
        {{ isEditing ? 'تعديل الدواء' : 'إضافة دواء جديد' }}
      </h2>
      <button 
        @click="$emit('close')" 
        class="close-btn"
        type="button"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="medicine-form">
      <div class="form-grid">
        <!-- Basic Information -->
        <div class="form-section">
          <h3 class="section-title">المعلومات الأساسية</h3>
          
          <div class="form-group">
            <label for="name" class="form-label">اسم الدواء *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.name }"
              placeholder="أدخل اسم الدواء"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category" class="form-label">الفئة *</label>
              <select
                id="category"
                v-model="form.category"
                class="form-select"
                :class="{ 'form-select--error': errors.category }"
                required
              >
                <option value="">اختر الفئة</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
              <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
            </div>

            <div class="form-group">
              <label for="manufacturer" class="form-label">الشركة المصنعة *</label>
              <select
                id="manufacturer"
                v-model="form.manufacturer"
                class="form-select"
                :class="{ 'form-select--error': errors.manufacturer }"
                required
              >
                <option value="">اختر الشركة</option>
                <option v-for="man in manufacturers" :key="man" :value="man">
                  {{ man }}
                </option>
              </select>
              <span v-if="errors.manufacturer" class="error-message">{{ errors.manufacturer }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price" class="form-label">السعر (ج.م) *</label>
              <input
                id="price"
                v-model.number="form.price"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                :class="{ 'form-input--error': errors.price }"
                placeholder="0.00"
                required
              />
              <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
            </div>

            <div class="form-group">
              <label for="unit" class="form-label">وحدة القياس</label>
              <select
                id="unit"
                v-model="form.unit"
                class="form-select"
              >
                <option value="tablet">قرص</option>
                <option value="capsule">كبسولة</option>
                <option value="ml">ملليلتر</option>
                <option value="mg">مليجرام</option>
                <option value="g">جرام</option>
                <option value="piece">قطعة</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Inventory Information -->
        <div class="form-section">
          <h3 class="section-title">معلومات المخزون</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="available_quantity" class="form-label">الكمية المتاحة</label>
              <input
                id="available_quantity"
                v-model.number="form.available_quantity"
                type="number"
                min="0"
                class="form-input"
                placeholder="0"
              />
            </div>

            <div class="form-group">
              <label for="low_stock_threshold" class="form-label">حد التنبيه</label>
              <input
                id="low_stock_threshold"
                v-model.number="form.low_stock_threshold"
                type="number"
                min="0"
                class="form-input"
                placeholder="10"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="storage_location" class="form-label">موقع التخزين</label>
            <input
              id="storage_location"
              v-model="form.storage_location"
              type="text"
              class="form-input"
              placeholder="مثال: رف أ - خزانة 3"
            />
          </div>

          <div class="form-group">
            <label for="expiry_date" class="form-label">تاريخ انتهاء الصلاحية</label>
            <input
              id="expiry_date"
              v-model="form.expiry_date"
              type="date"
              class="form-input"
              :min="minDate"
            />
          </div>
        </div>

        <!-- Additional Information -->
        <div class="form-section">
          <h3 class="section-title">معلومات إضافية</h3>
          
          <div class="form-group">
            <label for="description" class="form-label">الوصف</label>
            <textarea
              id="description"
              v-model="form.description"
              class="form-textarea"
              rows="3"
              placeholder="أدخل وصف الدواء..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="active_ingredient" class="form-label">المادة الفعالة</label>
            <input
              id="active_ingredient"
              v-model="form.active_ingredient"
              type="text"
              class="form-input"
              placeholder="أدخل المادة الفعالة"
            />
          </div>

          <div class="form-group">
            <label for="dosage_form" class="form-label">شكل الجرعة</label>
            <select
              id="dosage_form"
              v-model="form.dosage_form"
              class="form-select"
            >
              <option value="">اختر الشكل</option>
              <option value="tablet">أقراص</option>
              <option value="capsule">كبسولات</option>
              <option value="syrup">شراب</option>
              <option value="injection">حقن</option>
              <option value="cream">كريم</option>
              <option value="ointment">مرهم</option>
              <option value="drops">قطرات</option>
            </select>
          </div>

          <div class="form-group">
            <label for="prescription_required" class="form-label">
              <input
                id="prescription_required"
                v-model="form.prescription_required"
                type="checkbox"
                class="form-checkbox"
              />
              <span class="checkbox-label">يتطلب وصفة طبية</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn--secondary"
        >
          إلغاء
        </button>
        
        <button
          type="submit"
          class="btn btn--primary"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ isEditing ? 'تحديث' : 'إضافة' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMedicineFormManager } from './MedicineForm.js'

const props = defineProps({
  medicine: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'close'])

const manager = useMedicineFormManager(props, emit)

// Expose manager properties and methods
const { form, errors, categories, manufacturers, isEditing, minDate } = manager
const { handleSubmit } = manager

onMounted(async () => {
  manager.initializeForm()
  await manager.initializeData()
})
</script>

<style scoped>
@import './MedicineForm.css';
</style>
