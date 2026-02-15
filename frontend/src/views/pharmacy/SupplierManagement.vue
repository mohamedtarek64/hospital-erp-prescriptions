<template>
  <div class="supplier-management-page">
    <div class="page-header">
      <h1 class="page-title">إدارة الموردين</h1>
      <p class="page-subtitle">إدارة بيانات موردي الأدوية</p>
    </div>

    <div class="supplier-content">
      <div class="table-header">
        <h2>قائمة الموردين</h2>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i>
          إضافة مورد جديد
        </button>
      </div>
      
      <div class="table-wrapper">
        <table class="supplier-table">
          <thead>
            <tr>
              <th>اسم المورد</th>
              <th>جهة الاتصال</th>
              <th>الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td>
                <div class="supplier-info">
                  <h4>مورد {{ i }}</h4>
                  <p>كود: SUP{{ 1000 + i }}</p>
                </div>
              </td>
              <td>أحمد محمد</td>
              <td>0123456789{{ i }}</td>
              <td>supplier{{ i }}@email.com</td>
              <td>القاهرة، مصر</td>
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
// import { ref, onMounted } from 'vue'
import { onMounted } from 'vue'

// const suppliers = ref([])

onMounted(() => {
  console.log('Supplier Management page loaded')
})
</script>
