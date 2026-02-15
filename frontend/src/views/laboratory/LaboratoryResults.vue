<template>
  <div class="laboratory-results-page">
    <div class="page-header">
      <h1 class="page-title">نتائج الفحوصات المختبرية</h1>
      <p class="page-subtitle">عرض وإدارة نتائج الفحوصات</p>
    </div>

    <div class="results-content">
      <div class="table-header">
        <h2>قائمة النتائج</h2>
        <div class="header-actions">
          <button class="btn btn-outline">
            <i class="fas fa-download"></i>
            تصدير
          </button>
          <button class="btn btn-primary">
            <i class="fas fa-plus"></i>
            إضافة نتيجة
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="results-table">
          <thead>
            <tr>
              <th>رقم النتيجة</th>
              <th>المريض</th>
              <th>نوع الفحص</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td>RES{{ 1000 + i }}</td>
              <td>مريض {{ i }}</td>
              <td>فحص دم شامل</td>
              <td>2024-01-{{ 15 + i }}</td>
              <td>
                <span class="status-badge" :class="i % 3 === 0 ? 'abnormal' : 'normal'">
                  {{ i % 3 === 0 ? 'غير طبيعي' : 'طبيعي' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="عرض">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-icon" title="طباعة">
                    <i class="fas fa-print"></i>
                  </button>
                  <button class="btn-icon" title="تحميل">
                    <i class="fas fa-download"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { ref, onMounted } from 'vue'
import { onMounted } from 'vue'

// const results = ref([])

onMounted(() => {
  console.log('Laboratory Results page loaded')
})
</script>

<style scoped>
.laboratory-results-page {
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

.results-content {
  @apply bg-white rounded-xl shadow-lg border border-gray-200;
}

.table-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.table-header h2 {
  @apply text-xl font-semibold text-gray-800;
}

.header-actions {
  @apply flex gap-3;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.table-wrapper {
  @apply overflow-x-auto;
}

.results-table {
  @apply w-full;
}

.results-table th {
  @apply px-6 py-4 text-right text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-200;
}

.results-table td {
  @apply px-6 py-4 text-sm text-gray-800 border-b border-gray-200;
}

.status-badge {
  @apply inline-flex px-3 py-1 text-xs font-medium rounded-full;
}

.status-badge.normal {
  @apply bg-green-100 text-green-800;
}

.status-badge.abnormal {
  @apply bg-red-100 text-red-800;
}

.action-buttons {
  @apply flex gap-2;
}

.btn-icon {
  @apply w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200;
}
</style>