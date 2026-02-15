<template>
  <div class="laboratory-specimens-page">
    <div class="page-header">
      <h1 class="page-title">إدارة العينات المختبرية</h1>
      <p class="page-subtitle">تتبع وإدارة العينات والمواد المختبرية</p>
    </div>

    <div class="specimens-content">
      <div class="table-header">
        <h2>قائمة العينات</h2>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i>
          إضافة عينة جديدة
        </button>
      </div>
      
      <div class="table-wrapper">
        <table class="specimens-table">
          <thead>
            <tr>
              <th>رقم العينة</th>
              <th>المريض</th>
              <th>نوع العينة</th>
              <th>تاريخ الاستلام</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td>SPE{{ 1000 + i }}</td>
              <td>مريض {{ i }}</td>
              <td>
                <span class="specimen-type">دم</span>
              </td>
              <td>2024-01-{{ 15 + i }}</td>
              <td>
                <span class="status-badge" :class="i % 3 === 0 ? 'processing' : 'ready'">
                  {{ i % 3 === 0 ? 'قيد المعالجة' : 'جاهز' }}
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

// const specimens = ref([])

onMounted(() => {
  console.log('Laboratory Specimens page loaded')
})
</script>
