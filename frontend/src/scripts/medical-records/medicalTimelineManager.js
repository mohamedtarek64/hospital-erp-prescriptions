// import { computed } from 'vue'
import { getSeverityColor, formatFileSize, getFileTypeIcon } from '@/utils/medicalHelpers'

export class MedicalTimelineManager {
  constructor() {
    // No reactive state needed for this manager
  }

  getMethods() {
    return {
      sortedTimelineItems: this.sortedTimelineItems.bind(this),
      getTypeIcon: this.getTypeIcon.bind(this),
      getTypeTitle: this.getTypeTitle.bind(this),
      getMarkerColor: this.getMarkerColor.bind(this),
      getSeverityText: this.getSeverityText.bind(this),
      getStatusText: this.getStatusText.bind(this),
      getTestTypeText: this.getTestTypeText.bind(this),
      getTestStatusText: this.getTestStatusText.bind(this),
      getTestStatusColor: this.getTestStatusColor.bind(this)
    }
  }

  // Computed properties
  sortedTimelineItems(timelineItems) {
    if (!timelineItems || timelineItems.length === 0) return []
    
    return [...timelineItems].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA // Most recent first
    })
  }

  // Type icons
  getTypeIcon(type) {
    const icons = {
      examination: '🔍',
      diagnosis: '📋',
      prescription: '💊',
      test: '🔬',
      attachment: '📎',
      appointment: '📅',
      surgery: '⚕️',
      followup: '🔄'
    }
    return icons[type] || '📝'
  }

  // Type titles
  getTypeTitle(type) {
    const titles = {
      examination: 'فحص طبي',
      diagnosis: 'تشخيص',
      prescription: 'وصفة طبية',
      test: 'فحص مخبري',
      attachment: 'ملف مرفق',
      appointment: 'موعد',
      surgery: 'عملية جراحية',
      followup: 'متابعة'
    }
    return titles[type] || 'حدث طبي'
  }

  // Marker colors
  getMarkerColor(type) {
    const colors = {
      examination: 'bg-blue-500',
      diagnosis: 'bg-green-500',
      prescription: 'bg-purple-500',
      test: 'bg-orange-500',
      attachment: 'bg-gray-500',
      appointment: 'bg-indigo-500',
      surgery: 'bg-red-500',
      followup: 'bg-yellow-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  // Severity text
  getSeverityText(severity) {
    const texts = {
      mild: 'خفيف',
      moderate: 'متوسط',
      severe: 'شديد',
      critical: 'حرج'
    }
    return texts[severity] || severity
  }

  // Status text
  getStatusText(status) {
    const texts = {
      active: 'نشط',
      resolved: 'محلول',
      chronic: 'مزمن',
      pending: 'في الانتظار',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }
    return texts[status] || status
  }

  // Test type text
  getTestTypeText(testType) {
    const texts = {
      blood: 'فحص دم',
      urine: 'فحص بول',
      xray: 'أشعة سينية',
      mri: 'رنين مغناطيسي',
      ct: 'أشعة مقطعية',
      ultrasound: 'موجات فوق صوتية',
      biopsy: 'خزعة',
      culture: 'مزرعة'
    }
    return texts[testType] || testType
  }

  // Test status text
  getTestStatusText(status) {
    const texts = {
      pending: 'في الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      abnormal: 'غير طبيعي',
      normal: 'طبيعي'
    }
    return texts[status] || status
  }

  // Test status color
  getTestStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      abnormal: 'bg-red-100 text-red-800',
      normal: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Format timeline item description
  formatDescription(item) {
    let description = item.description || ''
    
    // Add severity if available
    if (item.severity) {
      description += ` (${this.getSeverityText(item.severity)})`
    }
    
    // Add status if available
    if (item.status) {
      description += ` - ${this.getStatusText(item.status)}`
    }
    
    return description
  }

  // Get additional details for timeline items
  getAdditionalDetails(item) {
    const details = []
    
    switch (item.type) {
      case 'diagnosis':
        if (item.severity) {
          details.push({
            label: 'الشدة',
            value: this.getSeverityText(item.severity),
            color: getSeverityColor(item.severity)
          })
        }
        if (item.icd_code) {
          details.push({
            label: 'رمز ICD',
            value: item.icd_code,
            color: 'text-blue-600'
          })
        }
        break
        
      case 'prescription':
        if (item.dosage) {
          details.push({
            label: 'الجرعة',
            value: item.dosage,
            color: 'text-green-600'
          })
        }
        if (item.duration) {
          details.push({
            label: 'المدة',
            value: item.duration,
            color: 'text-purple-600'
          })
        }
        break
        
      case 'test':
        if (item.results) {
          details.push({
            label: 'النتائج',
            value: item.results,
            color: item.status === 'abnormal' ? 'text-red-600' : 'text-green-600'
          })
        }
        if (item.normal_range) {
          details.push({
            label: 'المدى الطبيعي',
            value: item.normal_range,
            color: 'text-gray-600'
          })
        }
        break
        
      case 'attachment':
        if (item.fileType) {
          details.push({
            label: 'نوع الملف',
            value: item.fileType,
            icon: getFileTypeIcon(item.fileType)
          })
        }
        if (item.fileSize) {
          details.push({
            label: 'حجم الملف',
            value: formatFileSize(item.fileSize),
            color: 'text-gray-600'
          })
        }
        break
    }
    
    return details
  }

  // Get timeline item priority
  getItemPriority(item) {
    let priority = 0
    
    // High priority items
    if (item.type === 'surgery') priority += 100
    if (item.severity === 'critical') priority += 80
    if (item.status === 'abnormal') priority += 60
    
    // Medium priority items
    if (item.type === 'diagnosis') priority += 40
    if (item.severity === 'severe') priority += 30
    if (item.type === 'test' && item.status === 'pending') priority += 20
    
    // Low priority items
    if (item.type === 'attachment') priority += 10
    if (item.type === 'followup') priority += 5
    
    return priority
  }

  // Sort timeline items by priority and date
  sortByPriority(timelineItems) {
    if (!timelineItems || timelineItems.length === 0) return []
    
    return [...timelineItems].sort((a, b) => {
      const priorityA = this.getItemPriority(a)
      const priorityB = this.getItemPriority(b)
      
      // Sort by priority first, then by date
      if (priorityA !== priorityB) {
        return priorityB - priorityA // Higher priority first
      }
      
      // If same priority, sort by date (most recent first)
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA
    })
  }

  // Group timeline items by date
  groupByDate(timelineItems) {
    if (!timelineItems || timelineItems.length === 0) return {}
    
    const groups = {}
    
    timelineItems.forEach(item => {
      const date = new Date(item.date)
      const dateKey = date.toDateString()
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      
      groups[dateKey].push(item)
    })
    
    // Sort items within each group by priority
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey] = this.sortByPriority(groups[dateKey])
    })
    
    return groups
  }

  // Get timeline statistics
  getTimelineStats(timelineItems) {
    if (!timelineItems || timelineItems.length === 0) {
      return {
        total: 0,
        byType: {},
        byStatus: {},
        bySeverity: {}
      }
    }
    
    const stats = {
      total: timelineItems.length,
      byType: {},
      byStatus: {},
      bySeverity: {}
    }
    
    timelineItems.forEach(item => {
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1
      
      // Count by status
      if (item.status) {
        stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1
      }
      
      // Count by severity
      if (item.severity) {
        stats.bySeverity[item.severity] = (stats.bySeverity[item.severity] || 0) + 1
      }
    })
    
    return stats
  }
}
