<template>
  <div class="supplier-form">
    <form @submit.prevent="handleSubmit" class="form-container">
      <!-- Basic Information Section -->
      <div class="form-section">
        <h4 class="section-title">المعلومات الأساسية</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label for="name" class="form-label">اسم المورد *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ 'error': errors.name }"
              placeholder="أدخل اسم المورد"
              required
            >
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
          
          <div class="form-group">
            <label for="contact_person" class="form-label">الشخص المسؤول</label>
            <input
              id="contact_person"
              v-model="form.contact_person"
              type="text"
              class="form-input"
              :class="{ 'error': errors.contact_person }"
              placeholder="أدخل اسم الشخص المسؤول"
            >
            <span v-if="errors.contact_person" class="error-message">{{ errors.contact_person }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email" class="form-label">البريد الإلكتروني *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'error': errors.email }"
              placeholder="أدخل البريد الإلكتروني"
              required
            >
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          
          <div class="form-group">
            <label for="phone" class="form-label">رقم الهاتف *</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="form-input"
              :class="{ 'error': errors.phone }"
              placeholder="أدخل رقم الهاتف"
              required
            >
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Address Section -->
      <div class="form-section">
        <h4 class="section-title">العنوان</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label for="country" class="form-label">البلد</label>
            <select
              id="country"
              v-model="form.country"
              class="form-select"
              :class="{ 'error': errors.country }"
              @change="handleCountryChange"
            >
              <option value="">اختر البلد</option>
              <option v-for="country in countries" :key="country" :value="country">
                {{ country }}
              </option>
            </select>
            <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
          </div>
          
          <div class="form-group">
            <label for="city" class="form-label">المدينة</label>
            <select
              id="city"
              v-model="form.city"
              class="form-select"
              :class="{ 'error': errors.city }"
            >
              <option value="">اختر المدينة</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="address" class="form-label">العنوان التفصيلي</label>
          <textarea
            id="address"
            v-model="form.address"
            class="form-textarea"
            :class="{ 'error': errors.address }"
            placeholder="أدخل العنوان التفصيلي"
            rows="3"
          ></textarea>
          <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>
      </div>

      <!-- Business Information Section -->
      <div class="form-section">
        <h4 class="section-title">معلومات العمل</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label for="tax_number" class="form-label">الرقم الضريبي</label>
            <input
              id="tax_number"
              v-model="form.tax_number"
              type="text"
              class="form-input"
              :class="{ 'error': errors.tax_number }"
              placeholder="أدخل الرقم الضريبي"
            >
            <span v-if="errors.tax_number" class="error-message">{{ errors.tax_number }}</span>
          </div>
          
          <div class="form-group">
            <label for="credit_limit" class="form-label">حد الائتمان</label>
            <input
              id="credit_limit"
              v-model="form.credit_limit"
              type="number"
              class="form-input"
              :class="{ 'error': errors.credit_limit }"
              placeholder="أدخل حد الائتمان"
              min="0"
              step="0.01"
            >
            <span v-if="errors.credit_limit" class="error-message">{{ errors.credit_limit }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="payment_terms" class="form-label">شروط الدفع</label>
            <select
              id="payment_terms"
              v-model="form.payment_terms"
              class="form-select"
              :class="{ 'error': errors.payment_terms }"
            >
              <option value="">اختر شروط الدفع</option>
              <option value="immediate">دفع فوري</option>
              <option value="7_days">7 أيام</option>
              <option value="15_days">15 يوم</option>
              <option value="30_days">30 يوم</option>
              <option value="45_days">45 يوم</option>
              <option value="60_days">60 يوم</option>
            </select>
            <span v-if="errors.payment_terms" class="error-message">{{ errors.payment_terms }}</span>
          </div>
          
          <div class="form-group">
            <label for="status" class="form-label">الحالة *</label>
            <select
              id="status"
              v-model="form.status"
              class="form-select"
              :class="{ 'error': errors.status }"
              required
            >
              <option value="">اختر الحالة</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">معلق</option>
            </select>
            <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="form-section">
        <h4 class="section-title">ملاحظات إضافية</h4>
        
        <div class="form-group">
          <label for="notes" class="form-label">ملاحظات</label>
          <textarea
            id="notes"
            v-model="form.notes"
            class="form-textarea"
            :class="{ 'error': errors.notes }"
            placeholder="أدخل أي ملاحظات إضافية"
            rows="3"
          ></textarea>
          <span v-if="errors.notes" class="error-message">{{ errors.notes }}</span>
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
        
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <svg v-if="isSubmitting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ isEditing ? 'تحديث المورد' : 'إضافة المورد' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSupplierFormManager } from './SupplierForm.js'

const props = defineProps({
  supplier: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close'])

const manager = useSupplierFormManager(props, emit)

const {
  form,
  errors,
  isSubmitting,
  isEditing,
  countries,
  cities
} = manager

const { handleSubmit, handleCountryChange, initializeForm, initializeData } = manager

onMounted(async () => {
  initializeForm()
  await initializeData()
})
</script>

<style scoped>
@import './SupplierForm.css';
</style>
