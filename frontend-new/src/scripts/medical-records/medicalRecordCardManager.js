import { computed } from 'vue'
import { formatDate, isOverdue, getUrgencyLevel, canEditMedicalRecord, canDeleteMedicalRecord } from '@/utils/medicalHelpers'

export class MedicalRecordCardManager {
  constructor() {
    // No reactive state needed for this manager
  }

  getMethods(props, emit, authStore) {
    return {
      urgencyLevel: this.getUrgencyLevel(props),
      canEdit: this.getCanEdit(props, authStore),
      canDelete: this.getCanDelete(props, authStore),
      getStatusText: this.getStatusText.bind(this),
      getGenderText: this.getGenderText.bind(this),
      getFollowUpClass: this.getFollowUpClass.bind(this),
      getUrgencyText: this.getUrgencyText.bind(this),
      truncateText: this.truncateText.bind(this),
      confirmDelete: this.confirmDelete.bind(this, props, emit)
    }
  }

  // Computed properties
  getUrgencyLevel(props) {
    return computed(() => getUrgencyLevel(props.record))
  }

  getCanEdit(props, authStore) {
    return computed(() => canEditMedicalRecord(props.record, authStore.user))
  }

  getCanDelete(props, authStore) {
    return computed(() => canDeleteMedicalRecord(props.record, authStore.user))
  }

  // Utility methods
  getStatusText(status) {
    const texts = {
      active: 'نشط',
      completed: 'مكتمل',
      pending: 'في الانتظار',
      cancelled: 'ملغي'
    }
    return texts[status] || status
  }

  getGenderText(gender) {
    return gender === 'male' ? 'ذكر' : 'أنثى'
  }

  getFollowUpClass(followUpDate) {
    if (!followUpDate) return ''
    
    if (isOverdue(followUpDate)) {
      return 'text-red-600 font-medium'
    }
    
    const followUpDateObj = new Date(followUpDate)
    const today = new Date()
    const daysUntilFollowUp = Math.ceil((followUpDateObj - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilFollowUp <= 3) {
      return 'text-orange-600 font-medium'
    }
    
    if (daysUntilFollowUp <= 7) {
      return 'text-yellow-600 font-medium'
    }
    
    return 'text-green-600'
  }

  getUrgencyText(urgency) {
    const texts = {
      critical: 'حرج - يتطلب اهتمام فوري',
      high: 'عالٍ - يتطلب اهتمام سريع',
      medium: 'متوسط - يتطلب متابعة',
      normal: 'عادي - لا يتطلب اهتمام خاص'
    }
    return texts[urgency] || urgency
  }

  truncateText(text, maxLength) {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  confirmDelete(props, emit) {
    if (confirm('هل أنت متأكد من حذف هذا السجل الطبي؟')) {
      emit('delete', props.record)
    }
  }

  // Get record summary
  getRecordSummary(record) {
    const summary = {
      patientName: record.patient?.name || 'مريض غير محدد',
      age: record.patient?.age || null,
      gender: record.patient?.gender || null,
      phone: record.patient?.phone || null,
      chiefComplaint: record.chief_complaint || 'غير محدد',
      diagnosis: record.diagnosis || 'غير محدد',
      treatmentPlan: record.treatment_plan || 'غير محدد',
      doctorName: record.doctor?.name || 'طبيب غير محدد',
      department: record.doctor?.department || null,
      examinationDate: record.examination_date || null,
      followUpDate: record.follow_up_date || null,
      status: record.status || 'غير محدد',
      priority: record.priority || 'medium'
    }

    return summary
  }

  // Get record statistics
  getRecordStats(record) {
    const stats = {
      diagnoses: record.diagnoses?.length || 0,
      prescriptions: record.prescriptions?.length || 0,
      tests: record.medical_tests?.length || 0,
      attachments: record.attachments?.length || 0
    }

    return stats
  }

  // Get record priority info
  getPriorityInfo(priority) {
    const priorityInfo = {
      low: {
        text: 'منخفضة',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '🔵'
      },
      medium: {
        text: 'متوسطة',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: '🟡'
      },
      high: {
        text: 'عالية',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: '🟠'
      },
      urgent: {
        text: 'عاجلة',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '🔴'
      }
    }

    return priorityInfo[priority] || priorityInfo.medium
  }

  // Get follow-up status
  getFollowUpStatus(followUpDate) {
    if (!followUpDate) {
      return {
        status: 'none',
        text: 'لا يوجد موعد متابعة',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50'
      }
    }

    if (isOverdue(followUpDate)) {
      return {
        status: 'overdue',
        text: 'متأخر',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      }
    }

    const followUpDateObj = new Date(followUpDate)
    const today = new Date()
    const daysUntilFollowUp = Math.ceil((followUpDateObj - today) / (1000 * 60 * 60 * 24))

    if (daysUntilFollowUp <= 0) {
      return {
        status: 'due',
        text: 'مستحق اليوم',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    }

    if (daysUntilFollowUp <= 3) {
      return {
        status: 'soon',
        text: `خلال ${daysUntilFollowUp} أيام`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      }
    }

    if (daysUntilFollowUp <= 7) {
      return {
        status: 'upcoming',
        text: `خلال ${daysUntilFollowUp} أيام`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    }

    return {
      status: 'future',
      text: `خلال ${daysUntilFollowUp} أيام`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  }

  // Get record actions based on status and permissions
  getAvailableActions(record, user) {
    const actions = []

    // View action - always available
    actions.push({
      name: 'view',
      text: 'عرض',
      icon: '👁️',
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
      action: 'view'
    })

    // Edit action - based on permissions and status
    if (canEditMedicalRecord(record, user)) {
      actions.push({
        name: 'edit',
        text: 'تعديل',
        icon: '✏️',
        color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
        action: 'edit'
      })
    }

    // Delete action - based on permissions
    if (canDeleteMedicalRecord(record, user)) {
      actions.push({
        name: 'delete',
        text: 'حذف',
        icon: '🗑️',
        color: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        action: 'delete'
      })
    }

    // Special actions based on status
    if (record.status === 'active' && record.follow_up_date) {
      actions.push({
        name: 'followup',
        text: 'متابعة',
        icon: '📅',
        color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
        action: 'followup'
      })
    }

    if (record.status === 'active') {
      actions.push({
        name: 'complete',
        text: 'إكمال',
        icon: '✅',
        color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
        action: 'complete'
      })
    }

    return actions
  }

  // Format record dates
  formatRecordDates(record) {
    const dates = {}

    if (record.examination_date) {
      dates.examination = formatDate(record.examination_date)
    }

    if (record.follow_up_date) {
      dates.followUp = formatDate(record.follow_up_date)
      dates.followUpStatus = this.getFollowUpStatus(record.follow_up_date)
    }

    if (record.created_at) {
      dates.created = formatDate(record.created_at)
    }

    if (record.updated_at) {
      dates.updated = formatDate(record.updated_at)
    }

    return dates
  }

  // Get record alerts
  getRecordAlerts(record) {
    const alerts = []

    // Follow-up overdue
    if (record.follow_up_date && isOverdue(record.follow_up_date)) {
      alerts.push({
        type: 'warning',
        text: 'موعد المتابعة متأخر',
        icon: '⚠️',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      })
    }

    // High priority
    if (record.priority === 'high' || record.priority === 'urgent') {
      alerts.push({
        type: 'priority',
        text: `أولوية ${this.getPriorityInfo(record.priority).text}`,
        icon: '🚨',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      })
    }

    // Critical diagnoses
    if (record.diagnoses) {
      const criticalDiagnoses = record.diagnoses.filter(d => d.severity === 'critical')
      if (criticalDiagnoses.length > 0) {
        alerts.push({
          type: 'critical',
          text: `${criticalDiagnoses.length} تشخيص حرج`,
          icon: '🚑',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        })
      }
    }

    // Pending tests
    if (record.medical_tests) {
      const pendingTests = record.medical_tests.filter(t => t.status === 'pending')
      if (pendingTests.length > 0) {
        alerts.push({
          type: 'pending',
          text: `${pendingTests.length} فحص في الانتظار`,
          icon: '⏳',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        })
      }
    }

    return alerts
  }
}
