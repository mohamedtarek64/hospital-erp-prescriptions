<template>
  <div class="medical-timeline">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">التاريخ الطبي</h3>
      <p class="text-sm text-gray-600">تتبع التطور الطبي للمريض عبر الزمن</p>
    </div>

    <!-- Timeline Items -->
    <div v-if="timelineItems.length === 0" class="text-center py-8">
      <div class="text-gray-400 text-4xl mb-2">📅</div>
      <p class="text-gray-600">لا يوجد تاريخ طبي متاح</p>
    </div>

    <div v-else class="space-y-6">
      <div 
        v-for="item in sortedTimelineItems" 
        :key="item.id" 
        class="timeline-item"
      >
        <!-- Timeline Marker -->
        <div class="timeline-marker" :class="getMarkerColor(item.type)"></div>
        
        <!-- Timeline Content -->
        <div class="timeline-content">
          <div class="timeline-header">
            <div class="flex items-center">
              <span class="timeline-icon mr-2">{{ getTypeIcon(item.type) }}</span>
              <h4 class="timeline-title">{{ getTypeTitle(item.type) }}</h4>
            </div>
            <span class="timeline-date">{{ formatDate(item.date) }}</span>
          </div>
          
          <div class="timeline-description">
            <p class="mb-2">{{ item.description }}</p>
            
            <!-- Additional Details Based on Type -->
            <div v-if="item.type === 'diagnosis'" class="diagnosis-details">
              <div class="flex items-center space-x-4 space-x-reverse text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getSeverityColor(item.severity)">
                  {{ getSeverityText(item.severity) }}
                </span>
                <span v-if="item.icd_code" class="text-gray-600">
                  رمز ICD: {{ item.icd_code }}
                </span>
                <span v-if="item.status" class="text-gray-600">
                  الحالة: {{ getStatusText(item.status) }}
                </span>
              </div>
            </div>
            
            <div v-else-if="item.type === 'prescription'" class="prescription-details">
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">الدواء:</span> {{ item.medication_name }}
                </div>
                <div>
                  <span class="font-medium">الجرعة:</span> {{ item.dosage }}
                </div>
                <div>
                  <span class="font-medium">التكرار:</span> {{ item.frequency }}
                </div>
                <div>
                  <span class="font-medium">المدة:</span> {{ item.duration }}
                </div>
              </div>
              <div v-if="item.instructions" class="mt-2 text-sm text-gray-600">
                <span class="font-medium">التعليمات:</span> {{ item.instructions }}
              </div>
            </div>
            
            <div v-else-if="item.type === 'test'" class="test-details">
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">نوع الفحص:</span> {{ getTestTypeText(item.test_type) }}
                </div>
                <div>
                  <span class="font-medium">الحالة:</span> 
                  <span class="px-2 py-1 rounded-full text-xs" :class="getTestStatusColor(item.status)">
                    {{ getTestStatusText(item.status) }}
                  </span>
                </div>
              </div>
              <div v-if="item.results" class="mt-2 text-sm text-gray-600">
                <span class="font-medium">النتائج:</span> {{ item.results }}
              </div>
              <div v-if="item.normal_range" class="mt-1 text-sm text-gray-500">
                <span class="font-medium">المدى الطبيعي:</span> {{ item.normal_range }}
              </div>
            </div>
            
            <div v-else-if="item.type === 'examination'" class="examination-details">
              <div class="text-sm text-gray-600">
                <div class="mb-2">
                  <span class="font-medium">الشكوى الرئيسية:</span>
                  <p class="mt-1">{{ item.chief_complaint }}</p>
                </div>
                <div class="mb-2">
                  <span class="font-medium">ملاحظات الفحص:</span>
                  <p class="mt-1">{{ item.examination_notes }}</p>
                </div>
                <div>
                  <span class="font-medium">خطة العلاج:</span>
                  <p class="mt-1">{{ item.treatment_plan }}</p>
                </div>
              </div>
            </div>
            
            <div v-else-if="item.type === 'attachment'" class="attachment-details">
              <div class="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
                <span class="text-lg">{{ getFileTypeIcon(item.file_type) }}</span>
                <div>
                  <div class="font-medium">{{ item.file_name }}</div>
                  <div class="text-xs text-gray-500">{{ formatFileSize(item.file_size) }}</div>
                </div>
                <div v-if="item.description" class="text-gray-600">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Doctor/Staff Info -->
          <div v-if="item.doctor || item.staff" class="mt-3 pt-3 border-t border-gray-200">
            <div class="flex items-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>{{ item.doctor?.name || item.staff?.name || 'غير محدد' }}</span>
              <span v-if="item.doctor?.department || item.staff?.department" class="mr-2">
                - {{ item.doctor?.department || item.staff?.department }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MedicalTimelineManager } from '@/scripts/medical-records/medicalTimelineManager'

const props = defineProps({
  timelineItems: {
    type: Array,
    default: () => []
  }
})

const medicalTimelineManager = new MedicalTimelineManager()

// Get methods from manager
const {
  getTypeIcon,
  getTypeTitle,
  getMarkerColor,
  getSeverityText,
  getStatusText,
  getTestTypeText,
  getTestStatusText,
  getTestStatusColor
} = medicalTimelineManager.getMethods()

// Use computed for sorted items
const sortedTimelineItems = computed(() => {
  return medicalTimelineManager.sortedTimelineItems(props.timelineItems)
})
</script>

<style scoped>
@import '@/assets/css/medical-records.css';
</style>
