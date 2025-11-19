<template>
  <div class="inventory-management-page">
    <div class="page-header">
      <h1 class="page-title">إدارة المخزون</h1>
      <p class="page-subtitle">مراقبة وإدارة مخزون الأدوية</p>
    </div>

    <div class="inventory-content">
      <div class="inventory-stats">
        <div class="stat-card">
          <h3>إجمالي الأدوية</h3>
          <p class="stat-number">2,456</p>
        </div>
        <div class="stat-card">
          <h3>منخفض المخزون</h3>
          <p class="stat-number">23</p>
        </div>
        <div class="stat-card">
          <h3>منتهي الصلاحية</h3>
          <p class="stat-number">5</p>
        </div>
        <div class="stat-card">
          <h3>قيمة المخزون</h3>
          <p class="stat-number">$45,678</p>
        </div>
      </div>

      <div class="inventory-table-container">
        <div class="table-header">
          <h2>مخزون الأدوية</h2>
          <button class="btn btn-primary">
            <i class="fas fa-plus"></i>
            إضافة مخزون
          </button>
        </div>
        
        <div class="table-wrapper">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>اسم الدواء</th>
                <th>الكمية الحالية</th>
                <th>الحد الأدنى</th>
                <th>تاريخ الانتهاء</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 10" :key="i">
                <td>
                  <div class="medicine-info">
                    <h4>دواء {{ i }}</h4>
                    <p>كود: MED{{ 1000 + i }}</p>
                  </div>
                </td>
                <td>{{ 50 + i * 5 }}</td>
                <td>20</td>
                <td>2024-12-{{ 15 + i }}</td>
                <td>
                  <span class="status-badge" :class="i % 3 === 0 ? 'low' : 'good'">
                    {{ i % 3 === 0 ? 'منخفض' : 'جيد' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="تحديث">
                      <i class="fas fa-sync"></i>
                    </button>
                    <button class="btn-icon" title="عرض">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { ref, onMounted } from 'vue'
import { onMounted } from 'vue'

// const inventory = ref([])

onMounted(() => {
  console.log('Inventory Management page loaded')
})
</script>

