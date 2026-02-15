<template>
  <div class="laboratory-tests-page">
    <div class="page-header">
      <h1 class="page-title">إدارة الفحوصات المختبرية</h1>
      <p class="page-subtitle">إضافة وتعديل أنواع الفحوصات</p>
    </div>

    <div class="tests-content">
      <div class="table-header">
        <h2>قائمة الفحوصات</h2>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i>
          إضافة فحص جديد
        </button>
      </div>
      
      <div class="table-wrapper">
        <table class="tests-table">
          <thead>
            <tr>
              <th>اسم الفحص</th>
              <th>النوع</th>
              <th>المدة (ساعة)</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 10" :key="i">
              <td>
                <div class="test-info">
                  <h4>فحص {{ i }}</h4>
                  <p>كود: TEST{{ 1000 + i }}</p>
                </div>
              </td>
              <td>
                <span class="type-badge">دم</span>
              </td>
              <td>{{ 1 + i }}</td>
              <td>${{ 50 + i * 10 }}</td>
              <td>
                <span class="status-badge active">نشط</span>
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
import { ref, onMounted } from 'vue'

// const tests = ref([])

onMounted(() => {
  console.log('Laboratory Tests page loaded')
})
</script>

