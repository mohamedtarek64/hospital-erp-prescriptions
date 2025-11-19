<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :user="user" />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navigation Bar -->
      <nav class="top-nav">
        <div class="top-nav-content">
          <div class="top-nav-left">
            <h1 class="top-nav-title">تفاصيل السجل الطبي</h1>
          </div>
          
          <div class="top-nav-right">
            <div class="top-nav-user">
              <span class="top-nav-user-name">{{ user?.name }}</span>
              <span class="top-nav-user-role">{{ getRoleName(user?.role) }}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="medical-records-content">
        <div class="medical-record-details">
          <!-- Header -->
          <div class="details-header">
            <button @click="$router.go(-1)" class="btn-secondary">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              رجوع
            </button>
            <h2 class="details-title">تفاصيل السجل الطبي</h2>
          </div>

          <!-- Medical Record Details -->
          <div class="details-content">
            <div class="details-section">
              <h3 class="section-title">معلومات المريض</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">اسم المريض:</span>
                  <span class="detail-value">{{ medicalRecord.patient?.name || 'غير محدد' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">رقم الهاتف:</span>
                  <span class="detail-value">{{ medicalRecord.patient?.phone || 'غير محدد' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">العمر:</span>
                  <span class="detail-value">{{ medicalRecord.patient?.age || 'غير محدد' }} سنة</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الجنس:</span>
                  <span class="detail-value">{{ medicalRecord.patient?.gender || 'غير محدد' }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3 class="section-title">معلومات الطبيب</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">اسم الطبيب:</span>
                  <span class="detail-value">{{ medicalRecord.doctor?.name || 'غير محدد' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">التخصص:</span>
                  <span class="detail-value">{{ medicalRecord.doctor?.specialty || 'غير محدد' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">تاريخ الزيارة:</span>
                  <span class="detail-value">{{ formatDate(medicalRecord.visitDate) }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3 class="section-title">التشخيص</h3>
              <div class="diagnosis-content">
                <p class="diagnosis-text">{{ medicalRecord.diagnosis || 'لم يتم تحديد التشخيص' }}</p>
              </div>
            </div>

            <div class="details-section">
              <h3 class="section-title">الوصفة الطبية</h3>
              <div class="prescription-content">
                <p class="prescription-text">{{ medicalRecord.prescription || 'لم يتم كتابة وصفة طبية' }}</p>
              </div>
            </div>

            <div class="details-section">
              <h3 class="section-title">الملاحظات</h3>
              <div class="notes-content">
                <p class="notes-text">{{ medicalRecord.notes || 'لا توجد ملاحظات' }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/dashboard/Sidebar.vue'
import { useMedicalRecordDetails } from '@/scripts/medical-records/medicalRecordDetails.js'

// Use composable
const {
  medicalRecord,
  user,
  getRoleName,
  formatDate
} = useMedicalRecordDetails()
</script>

<style scoped>
@import '@/assets/css/medical-record-details.css';
</style>
