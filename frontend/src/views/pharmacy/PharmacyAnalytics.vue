<template>
  <div class="pharmacy-analytics-page">
    <div class="page-header">
      <h1 class="page-title">تحليلات الصيدلية</h1>
      <p class="page-subtitle">إحصائيات وتحليلات الأدوية والمبيعات</p>
    </div>

    <div class="analytics-content">
      <div class="analytics-cards">
        <div class="analytics-card">
          <div class="card-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="card-content">
            <h3>إجمالي المبيعات</h3>
            <p class="card-value">$12,456</p>
            <span class="card-change positive">+12%</span>
          </div>
        </div>
        
        <div class="analytics-card">
          <div class="card-icon">
            <i class="fas fa-pills"></i>
          </div>
          <div class="card-content">
            <h3>الأدوية المباعة</h3>
            <p class="card-value">1,234</p>
            <span class="card-change positive">+8%</span>
          </div>
        </div>
        
        <div class="analytics-card">
          <div class="card-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="card-content">
            <h3>المرضى</h3>
            <p class="card-value">456</p>
            <span class="card-change positive">+15%</span>
          </div>
        </div>
        
        <div class="analytics-card">
          <div class="card-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="card-content">
            <h3>منخفض المخزون</h3>
            <p class="card-value">23</p>
            <span class="card-change negative">+3</span>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <h2>مبيعات الأدوية</h2>
          <div class="chart-placeholder">
            <i class="fas fa-chart-bar"></i>
            <p>رسم بياني للمبيعات</p>
          </div>
        </div>
        
        <div class="chart-card">
          <h2>أكثر الأدوية مبيعاً</h2>
          <div class="top-medicines">
            <div class="medicine-item" v-for="i in 5" :key="i">
              <span class="medicine-name">دواء {{ i }}</span>
              <span class="medicine-sales">{{ 100 + i * 20 }} وحدة</span>
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

// const analytics = ref({})

onMounted(() => {
  console.log('Pharmacy Analytics page loaded')
})
</script>

<style scoped>
.pharmacy-analytics-page {
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

.analytics-content {
  @apply space-y-8;
}

.analytics-cards {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.analytics-card {
  @apply bg-white rounded-xl shadow-lg border border-gray-200 p-6;
  @apply flex items-center space-x-4 space-x-reverse;
}

.card-icon {
  @apply w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center;
}

.card-icon i {
  @apply text-2xl text-blue-600;
}

.card-content h3 {
  @apply text-sm font-medium text-gray-600 mb-1;
}

.card-value {
  @apply text-2xl font-bold text-gray-800 mb-1;
}

.card-change {
  @apply text-sm font-medium;
}

.card-change.positive {
  @apply text-green-600;
}

.card-change.negative {
  @apply text-red-600;
}

.charts-section {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
}

.chart-card {
  @apply bg-white rounded-xl shadow-lg border border-gray-200 p-6;
}

.chart-card h2 {
  @apply text-xl font-semibold text-gray-800 mb-6;
}

.chart-placeholder {
  @apply h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500;
}

.chart-placeholder i {
  @apply text-4xl mb-2;
}

.top-medicines {
  @apply space-y-4;
}

.medicine-item {
  @apply flex justify-between items-center p-3 bg-gray-50 rounded-lg;
}

.medicine-name {
  @apply font-medium text-gray-800;
}

.medicine-sales {
  @apply text-sm text-gray-600;
}
</style>