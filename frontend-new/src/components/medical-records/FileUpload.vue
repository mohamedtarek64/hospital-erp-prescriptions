<template>
  <div class="file-upload-container">
    <!-- File Upload Area -->
    <div 
      class="file-upload"
      :class="{ 'file-upload-dragover': isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="acceptedTypes"
        class="file-upload-input"
        @change="handleFileSelect"
      />
      
      <label class="file-upload-label">
        <svg class="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <div class="file-upload-text">
          <span class="font-medium text-blue-600">انقر لاختيار الملفات</span>
          <span class="text-gray-500">أو اسحب وأفلت الملفات هنا</span>
        </div>
        <div class="file-upload-hint">
          {{ acceptedTypesText }} - الحد الأقصى: {{ maxFileSizeText }}
        </div>
      </label>
    </div>

    <!-- File List -->
    <div v-if="uploadedFiles.length > 0" class="file-list">
      <div class="file-list-header">
        <h4 class="text-sm font-medium text-gray-900">الملفات المرفوعة</h4>
        <span class="text-xs text-gray-500">{{ uploadedFiles.length }} ملف</span>
      </div>
      
      <div class="space-y-2">
        <div 
          v-for="(file, index) in uploadedFiles" 
          :key="index"
          class="file-item"
        >
          <div class="file-info">
            <span class="file-icon">{{ getFileTypeIcon(file.type) }}</span>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          
          <div class="file-actions">
            <button 
              @click="handlePreviewFile(file)"
              class="file-action-btn preview-btn"
              title="معاينة"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            
            <button 
              @click="downloadFile(file)"
              class="file-action-btn download-btn"
              title="تحميل"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
            
            <button 
              @click="removeFile(index)"
              class="file-action-btn remove-btn"
              title="إزالة"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-header">
        <span class="text-sm font-medium text-gray-900">جاري الرفع...</span>
        <span class="text-sm text-gray-500">{{ uploadedCount }}/{{ totalFiles }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="errors.length > 0" class="error-messages">
      <div v-for="(error, index) in errors" :key="index" class="error-message">
        <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm text-red-600">{{ error }}</span>
      </div>
    </div>

    <!-- File Preview Modal -->
    <div v-if="showPreviewModal" class="file-preview-modal">
      <div class="modal-overlay" @click="closePreviewModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">معاينة الملف</h3>
          <button @click="closePreviewModal" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="previewFile" class="file-preview">
            <!-- Image Preview -->
            <img 
              v-if="isImageFile(previewFile)" 
              :src="previewUrl" 
              :alt="previewFile.name"
              class="max-w-full h-auto rounded-lg"
            />
            
            <!-- PDF Preview -->
            <iframe 
              v-else-if="isPdfFile(previewFile)" 
              :src="previewUrl" 
              class="w-full h-96 border rounded-lg"
            ></iframe>
            
            <!-- Text Preview -->
            <div v-else-if="isTextFile(previewFile)" class="text-preview">
              <pre class="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">{{ previewContent }}</pre>
            </div>
            
            <!-- Default Preview -->
            <div v-else class="default-preview">
              <div class="text-center py-12">
                <span class="text-6xl text-gray-400">{{ getFileTypeIcon(previewFile.type) }}</span>
                <p class="text-lg font-medium text-gray-900 mt-4">{{ previewFile.name }}</p>
                <p class="text-gray-600">{{ formatFileSize(previewFile.size) }}</p>
                <button 
                  @click="downloadFile(previewFile)"
                  class="mt-4 btn btn-primary"
                >
                  تحميل الملف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { getFileTypeIcon, formatFileSize } from '@/utils/medicalHelpers'
import { FileUploadManager } from '@/scripts/medical-records/fileUploadManager'

const props = defineProps({
  acceptedTypes: {
    type: String,
    default: '*/*'
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  value: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:value', 'files-uploaded', 'upload-error'])

const fileUploadManager = new FileUploadManager()

// Get reactive data and methods from manager
const {
  fileInput,
  isDragOver,
  uploading,
  uploadedCount,
  totalFiles,
  errors,
  showPreviewModal,
  previewFile,
  previewUrl,
  previewContent,
  uploadedFiles
} = fileUploadManager.getReactiveData()

const {
  triggerFileInput,
  handleFileSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  removeFile,
  handlePreviewFile,
  closePreviewModal,
  downloadFile,
  uploadFiles,
  clearFiles,
  acceptedTypesText,
  maxFileSizeText,
  progressPercentage
} = fileUploadManager.getMethods(props, emit)

// Lifecycle
onMounted(() => {
  fileUploadManager.initialize(props)
})

onUnmounted(() => {
  fileUploadManager.cleanup()
})

// Expose methods
defineExpose({
  uploadFiles,
  clearFiles
})
</script>

<style scoped>
@import '@/assets/css/medical-records.css';

/* Additional styles for file upload */
.file-upload-container {
  @apply w-full;
}

.file-list-header {
  @apply flex justify-between items-center mb-3;
}

.file-action-btn {
  @apply p-1 rounded-md transition-colors duration-200;
}

.preview-btn {
  @apply text-blue-600 hover:text-blue-700 hover:bg-blue-50;
}

.download-btn {
  @apply text-green-600 hover:text-green-700 hover:bg-green-50;
}

.remove-btn {
  @apply text-red-600 hover:text-red-700 hover:bg-red-50;
}

.upload-progress {
  @apply mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200;
}

.progress-header {
  @apply flex justify-between items-center mb-2;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

.error-messages {
  @apply mt-4 space-y-2;
}

.error-message {
  @apply flex items-center p-2 bg-red-50 border border-red-200 rounded-md;
}

.file-preview-modal {
  @apply fixed inset-0 z-50 overflow-y-auto;
}

.text-preview {
  @apply max-h-96 overflow-auto;
}

.default-preview {
  @apply text-center;
}
</style>
