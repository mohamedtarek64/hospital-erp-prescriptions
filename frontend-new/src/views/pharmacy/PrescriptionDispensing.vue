<template>
  <div class="prescription-dispensing-page">
    <div class="page-header">
      <h1 class="page-title">صرف الوصفات الطبية</h1>
      <p class="page-subtitle">صرف الأدوية للمرضى</p>
    </div>

    <div class="prescription-dispensing-content">
      <div class="prescription-search">
        <div class="search-form">
          <input type="text" placeholder="رقم الوصفة أو اسم المريض..." class="search-input">
          <button class="btn btn-primary">
            <i class="fas fa-search"></i>
            بحث
          </button>
        </div>
      </div>

      <div class="prescriptions-list">
        <div class="prescription-item" v-for="i in 6" :key="i">
          <div class="prescription-header">
            <h3>وصفة #{{ 1000 + i }}</h3>
            <span class="prescription-date">2024-01-{{ 15 + i }}</span>
          </div>
          
          <div class="prescription-details">
            <div class="patient-info">
              <h4>مريض {{ i }}</h4>
              <p>د. أحمد محمد</p>
            </div>
            
            <div class="medicines-list">
              <div class="medicine-item" v-for="j in 2" :key="j">
                <span class="medicine-name">دواء {{ j }}</span>
                <span class="medicine-dosage">{{ 1 + j }} حبة × 3 مرات يومياً</span>
                <span class="medicine-quantity">{{ 10 + j * 5 }} حبة</span>
              </div>
            </div>
            
            <div class="prescription-actions">
              <button class="btn btn-success">
                <i class="fas fa-check"></i>
                صرف
              </button>
              <button class="btn btn-outline">
                <i class="fas fa-eye"></i>
                عرض التفاصيل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { ref, onMounted } from 'vue'
import { onMounted } from 'vue'

// const prescriptions = ref([])

onMounted(() => {
  console.log('Prescription Dispensing page loaded')
})
</script>

<style scoped>
.prescription-dispensing-page {
  @apply p-6 bg-gray-50 min-h-screen;
}

.page-header {
  @apply mb-8;
}

.page-title {
  @apply text-3xl font-bold text-gray-800 mb-2;
}

.page-subtitle {
  @apply text-gray-600;
}

.prescription-dispensing-content {
  @apply space-y-6;
}

.prescription-search {
  @apply bg-white rounded-xl shadow-lg border border-gray-200 p-6;
}

.search-form {
  @apply flex gap-4;
}

.search-input {
  @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.prescriptions-list {
  @apply space-y-4;
}

.prescription-item {
  @apply bg-white rounded-xl shadow-lg border border-gray-200 p-6;
}

.prescription-header {
  @apply flex justify-between items-center mb-4 pb-4 border-b border-gray-200;
}

.prescription-header h3 {
  @apply text-lg font-semibold text-gray-800;
}

.prescription-date {
  @apply text-sm text-gray-600;
}

.prescription-details {
  @apply space-y-4;
}

.patient-info h4 {
  @apply font-medium text-gray-800 mb-1;
}

.patient-info p {
  @apply text-sm text-gray-600;
}

.medicines-list {
  @apply space-y-2;
}

.medicine-item {
  @apply flex justify-between items-center p-3 bg-gray-50 rounded-lg;
}

.medicine-name {
  @apply font-medium text-gray-800;
}

.medicine-dosage {
  @apply text-sm text-gray-600;
}

.medicine-quantity {
  @apply text-sm font-medium text-blue-600;
}

.prescription-actions {
  @apply flex gap-3 pt-4 border-t border-gray-200;
}
</style>