<template>
  <div class="medicine-management-page">
    <div class="page-header">
      <h1 class="page-title">إدارة الأدوية</h1>
      <p class="page-subtitle">إضافة وتعديل وإدارة الأدوية</p>
    </div>

    <div class="medicine-content">
      <div class="table-header">
        <h2>قائمة الأدوية</h2>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i>
          إضافة دواء جديد
        </button>
      </div>
      
      <div class="table-filters">
        <input type="text" placeholder="البحث عن دواء..." class="search-input">
        <select class="filter-select">
          <option>جميع الفئات</option>
          <option>مضادات حيوية</option>
          <option>مسكنات</option>
          <option>فيتامينات</option>
        </select>
        <select class="filter-select">
          <option>جميع الحالات</option>
          <option>متوفر</option>
          <option>نفد المخزون</option>
          <option>منخفض المخزون</option>
        </select>
      </div>

      <div class="table-wrapper">
        <table class="medicine-table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>اسم الدواء</th>
              <th>الاسم العلمي</th>
              <th>الفئة</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>تاريخ الانتهاء</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 10" :key="i">
              <td>
                <div class="medicine-image">
                  <i class="fas fa-pills"></i>
                </div>
              </td>
              <td>
                <div class="medicine-info">
                  <h4>دواء {{ i }}</h4>
                  <p>كود: MED{{ 1000 + i }}</p>
                </div>
              </td>
              <td>Scientific Name {{ i }}</td>
              <td>
                <span class="category-badge">مضادات حيوية</span>
              </td>
              <td>{{ 50 + i * 10 }}</td>
              <td>${{ 10 + i * 2 }}</td>
              <td>2024-12-{{ 15 + i }}</td>
              <td>
                <span class="status-badge available">متوفر</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="عرض">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-icon" title="تعديل">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon" title="حذف">
                    <i class="fas fa-trash"></i>
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

// const medicines = ref([])

onMounted(() => {
  console.log('Medicine Management page loaded')
})
</script>

<style scoped>
.medicine-management-page {
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

.medicine-content {
  @apply bg-white rounded-xl shadow-lg border border-gray-200;
}

.table-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.table-header h2 {
  @apply text-xl font-semibold text-gray-800;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.table-filters {
  @apply flex gap-4 p-6 border-b border-gray-200;
}

.search-input {
  @apply flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filter-select {
  @apply px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.table-wrapper {
  @apply overflow-x-auto;
}

.medicine-table {
  @apply w-full;
}

.medicine-table th {
  @apply px-6 py-4 text-right text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-200;
}

.medicine-table td {
  @apply px-6 py-4 text-sm text-gray-800 border-b border-gray-200;
}

.medicine-image {
  @apply w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center;
}

.medicine-image i {
  @apply text-gray-500 text-lg;
}

.medicine-info h4 {
  @apply font-medium text-gray-800 mb-1;
}

.medicine-info p {
  @apply text-xs text-gray-500;
}

.category-badge {
  @apply inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800;
}

.status-badge {
  @apply inline-flex px-3 py-1 text-xs font-medium rounded-full;
}

.status-badge.available {
  @apply bg-green-100 text-green-800;
}

.action-buttons {
  @apply flex gap-2;
}

.btn-icon {
  @apply w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200;
}
</style>