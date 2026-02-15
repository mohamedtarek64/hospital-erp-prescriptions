<template>
  <div class="purchase-orders-page">
    <div class="page-header">
      <h1 class="page-title">أوامر الشراء</h1>
      <p class="page-subtitle">إدارة أوامر شراء الأدوية</p>
    </div>

    <div class="purchase-orders-content">
      <div class="table-header">
        <h2>قائمة أوامر الشراء</h2>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i>
          إنشاء أمر شراء جديد
        </button>
      </div>
      
      <div class="table-wrapper">
        <table class="purchase-orders-table">
          <thead>
            <tr>
              <th>رقم الأمر</th>
              <th>المورد</th>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td>PO{{ 1000 + i }}</td>
              <td>مورد {{ i }}</td>
              <td>2024-01-{{ 15 + i }}</td>
              <td>${{ 500 + i * 100 }}</td>
              <td>
                <span class="status-badge" :class="i % 3 === 0 ? 'pending' : 'completed'">
                  {{ i % 3 === 0 ? 'في الانتظار' : 'مكتمل' }}
                </span>
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

// const purchaseOrders = ref([])

onMounted(() => {
  console.log('Purchase Orders page loaded')
})
</script>

<style scoped>
.purchase-orders-page {
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

.purchase-orders-content {
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

.table-wrapper {
  @apply overflow-x-auto;
}

.purchase-orders-table {
  @apply w-full;
}

.purchase-orders-table th {
  @apply px-6 py-4 text-right text-sm font-medium text-gray-500 bg-gray-50 border-b border-gray-200;
}

.purchase-orders-table td {
  @apply px-6 py-4 text-sm text-gray-800 border-b border-gray-200;
}

.status-badge {
  @apply inline-flex px-3 py-1 text-xs font-medium rounded-full;
}

.status-badge.pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.completed {
  @apply bg-green-100 text-green-800;
}

.action-buttons {
  @apply flex gap-2;
}

.btn-icon {
  @apply w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200;
}
</style>