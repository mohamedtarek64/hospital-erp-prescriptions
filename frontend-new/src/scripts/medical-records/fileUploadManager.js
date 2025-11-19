import { ref } from 'vue'

export class FileUploadManager {
  constructor() {
    // File input reference
    this.fileInput = ref(null)
    
    // UI state
    this.isDragOver = ref(false)
    this.uploading = ref(false)
    this.uploadedCount = ref(0)
    this.totalFiles = ref(0)
    this.errors = ref([])
    
    // Modal state
    this.showPreviewModal = ref(false)
    this.previewFile = ref(null)
    this.previewUrl = ref('')
    this.previewContent = ref('')
    
    // Files
    this.uploadedFiles = ref([])
  }

  getReactiveData() {
    return {
      fileInput: this.fileInput,
      isDragOver: this.isDragOver,
      uploading: this.uploading,
      uploadedCount: this.uploadedCount,
      totalFiles: this.totalFiles,
      errors: this.errors,
      showPreviewModal: this.showPreviewModal,
      previewFile: this.previewFile,
      previewUrl: this.previewUrl,
      previewContent: this.previewContent,
      uploadedFiles: this.uploadedFiles
    }
  }

  getMethods() {
    return {
      triggerFileInput: this.triggerFileInput.bind(this),
      handleFileSelect: this.handleFileSelect.bind(this),
      handleDragOver: this.handleDragOver.bind(this),
      handleDragLeave: this.handleDragLeave.bind(this),
      handleDrop: this.handleDrop.bind(this),
      removeFile: this.removeFile.bind(this),
      handlePreviewFile: this.handlePreviewFile.bind(this),
      closePreviewModal: this.closePreviewModal.bind(this),
      downloadFile: this.downloadFile.bind(this),
      uploadFiles: this.uploadFiles.bind(this),
      clearFiles: this.clearFiles.bind(this),
      acceptedTypesText: this.acceptedTypesText.bind(this),
      maxFileSizeText: this.maxFileSizeText.bind(this),
      progressPercentage: this.progressPercentage.bind(this)
    }
  }

  // Initialize with props
  initialize(props, emitFn) {
    this.uploadedFiles.value = [...props.value]
    this.watchValue(props, emitFn)
  }

  // Computed properties
  acceptedTypesText(props) {
    if (!props.acceptedTypes) return 'جميع أنواع الملفات'
    return props.acceptedTypes.split(',').map(type => {
      const ext = type.trim()
      if (ext.startsWith('.')) {
        return ext.toUpperCase()
      }
      return ext
    }).join(', ')
  }

  maxFileSizeText(props) {
    if (!props.maxFileSize) return 'غير محدد'
    return this.formatFileSize(props.maxFileSize)
  }

  progressPercentage() {
    if (this.totalFiles.value === 0) return 0
    return Math.round((this.uploadedCount.value / this.totalFiles.value) * 100)
  }

  // File input methods
  triggerFileInput() {
    this.fileInput.value?.click()
  }

  handleFileSelect(event) {
    const files = Array.from(event.target.files)
    this.processFiles(files)
  }

  // Drag and drop methods
  handleDragOver(event) {
    event.preventDefault()
    this.isDragOver.value = true
  }

  handleDragLeave(event) {
    event.preventDefault()
    this.isDragOver.value = false
  }

  handleDrop(event) {
    event.preventDefault()
    this.isDragOver.value = false
    
    const files = Array.from(event.dataTransfer.files)
    this.processFiles(files)
  }

  // File processing
  processFiles(files) {
    const validFiles = []
    const newErrors = []

    files.forEach(file => {
      // Check file size
      if (this.props?.maxFileSize && file.size > this.props.maxFileSize) {
        newErrors.push(`الملف ${file.name} أكبر من الحجم المسموح به`)
        return
      }

      // Check file type
      if (this.props?.acceptedTypes) {
        const acceptedTypes = this.props.acceptedTypes.split(',').map(t => t.trim())
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        
        if (!acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return type.toLowerCase() === fileExtension
          }
          return type.toLowerCase() === file.type.toLowerCase()
        })) {
          newErrors.push(`نوع الملف ${file.name} غير مدعوم`)
          return
        }
      }

      validFiles.push(file)
    })

    // Add errors
    if (newErrors.length > 0) {
      this.errors.value = [...this.errors.value, ...newErrors]
      // emit('upload-error', newErrors)
    }

    // Add valid files
    if (validFiles.length > 0) {
      this.addFiles(validFiles)
    }
  }

  addFiles(files) {
    const newFiles = files.map(file => ({
      id: this.generateFileId(),
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'pending'
    }))

    this.uploadedFiles.value = [...this.uploadedFiles.value, ...newFiles]
    // emit('update:value', this.uploadedFiles.value)
  }

  removeFile(index) {
    this.uploadedFiles.value.splice(index, 1)
    // emit('update:value', this.uploadedFiles.value)
  }

  // File preview methods
  handlePreviewFile(file) {
    this.previewFile.value = file
    this.showPreviewModal.value = true
    
    // Generate preview URL
    if (this.isImageFile(file)) {
      this.previewUrl.value = URL.createObjectURL(file)
      this.previewContent.value = ''
    } else if (this.isPdfFile(file)) {
      this.previewUrl.value = URL.createObjectURL(file)
      this.previewContent.value = 'PDF Preview'
    } else if (this.isTextFile(file)) {
      this.previewUrl.value = ''
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewContent.value = e.target.result
      }
      reader.readAsText(file)
    }
  }

  closePreviewModal() {
    this.showPreviewModal.value = false
    this.previewFile.value = null
    this.previewUrl.value = ''
    this.previewContent.value = ''
    
    // Clean up object URLs
    if (this.previewUrl.value) {
      URL.revokeObjectURL(this.previewUrl.value)
    }
  }

  // File download
  downloadFile(file) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // File upload
  async uploadFiles() {
    if (this.uploadedFiles.value.length === 0) return

    this.uploading.value = true
    this.totalFiles.value = this.uploadedFiles.value.length
    this.uploadedCount.value = 0
    this.errors.value = []

    try {
      for (let i = 0; i < this.uploadedFiles.value.length; i++) {
        const fileData = this.uploadedFiles.value[i]
        
        // Simulate upload progress
        await new Promise(resolve => setTimeout(resolve, 500))
        
        fileData.status = 'uploaded'
        this.uploadedCount.value++
        
        // Update progress
        // emit('upload-progress', {
        //   current: this.uploadedCount.value,
        //   total: this.totalFiles.value,
        //   percentage: this.progressPercentage()
        // })
      }

      // emit('files-uploaded', this.uploadedFiles.value)
    } catch (error) {
      this.errors.value.push('حدث خطأ أثناء رفع الملفات')
      // emit('upload-error', this.errors.value)
    } finally {
      this.uploading.value = false
    }
  }

  // Clear all files
  clearFiles() {
    this.uploadedFiles.value = []
    this.errors.value = []
    this.uploading.value = false
    this.uploadedCount.value = 0
    this.totalFiles.value = 0
    // emit('update:value', [])
  }

  // Utility methods
  isImageFile(file) {
    return file.type.startsWith('image/')
  }

  isPdfFile(file) {
    return file.type === 'application/pdf'
  }

  isTextFile(file) {
    return file.type.startsWith('text/') || 
           file.type === 'application/json' || 
           file.type === 'application/xml'
  }

  generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Watch for value changes
  watchValue(props) {
    if (props.value && props.value.length > 0) {
      this.uploadedFiles.value = [...props.value]
    }
  }

  // Cleanup
  cleanup() {
    if (this.previewUrl.value) {
      URL.revokeObjectURL(this.previewUrl.value)
    }
  }
}
