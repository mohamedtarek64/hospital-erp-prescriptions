<template>
  <div class="laboratory-orders-page">
    <div class="page-header">
      <h1 class="page-title">طلبات الفحوصات المختبرية</h1>
      <p class="page-subtitle">إدارة طلبات الفحوصات والتحاليل</p>
    </div>

    <div class="orders-content">
      <div class="table-header">
        <h2>قائمة الطلبات</h2>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i>
          طلب فحص جديد
        </button>
      </div>
      
      <div class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>المريض</th>
              <th>الطبيب</th>
              <th>نوع الفحص</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td>LAB{{ 1000 + i }}</td>
              <td>مريض {{ i }}</td>
              <td>د. أحمد محمد</td>
              <td>فحص دم شامل</td>
              <td>2024-01-{{ 15 + i }}</td>
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
                  <button class="btn-icon" title="طباعة">
                    <i class="fas fa-print"></i>
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

// const orders = ref([])

onMounted(() => {
  console.log('Laboratory Orders page loaded')
})
</script>

