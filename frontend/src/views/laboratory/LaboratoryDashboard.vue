<template>
  <div class="laboratory-dashboard-page">
    <div class="page-header">
      <h1 class="page-title">لوحة تحكم المختبر</h1>
      <p class="page-subtitle">إدارة الفحوصات والنتائج المختبرية</p>
    </div>

    <div class="laboratory-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-flask"></i>
          </div>
          <div class="stat-content">
            <h3>الفحوصات اليوم</h3>
            <p class="stat-number">45</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>في الانتظار</h3>
            <p class="stat-number">12</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>مكتملة</h3>
            <p class="stat-number">33</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <h3>نتائج غير طبيعية</h3>
            <p class="stat-number">3</p>
          </div>
        </div>
      </div>

      <div class="laboratory-grid">
        <div class="quick-actions">
          <h2>الإجراءات السريعة</h2>
          <div class="actions-grid">
            <button class="action-btn" @click="$router.push('/laboratory/orders')">
              <i class="fas fa-clipboard-list"></i>
              <span>طلبات الفحوصات</span>
            </button>
            <button class="action-btn" @click="$router.push('/laboratory/tests')">
              <i class="fas fa-vial"></i>
              <span>إدارة الفحوصات</span>
            </button>
            <button class="action-btn" @click="$router.push('/laboratory/results')">
              <i class="fas fa-file-medical"></i>
              <span>النتائج</span>
            </button>
            <button class="action-btn" @click="$router.push('/laboratory/specimens')">
              <i class="fas fa-box"></i>
              <span>العينات</span>
            </button>
          </div>
        </div>

        <div class="recent-tests">
          <h2>الفحوصات الأخيرة</h2>
          <div class="tests-list">
            <div class="test-item" v-for="i in 5" :key="i">
              <div class="test-info">
                <h4>فحص {{ i }}</h4>
                <p>مريض {{ i }} - د. أحمد محمد</p>
                <span class="test-date">منذ {{ i }} ساعات</span>
              </div>
              <div class="test-status">
                <span class="status-badge" :class="i % 3 === 0 ? 'pending' : 'completed'">
                  {{ i % 3 === 0 ? 'في الانتظار' : 'مكتمل' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLaboratory } from '@/scripts/views/laboratory'

  const {} = useLaboratory()
</script>

<style scoped>
@import '@/assets/css/views/laboratory.css';
</style>