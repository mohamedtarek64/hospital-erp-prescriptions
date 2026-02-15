import { computed, ref } from 'vue'
import { isOverdue, canEditMedicalRecord, canDeleteMedicalRecord } from '@/utils/medicalHelpers'

export class MedicalRecordDetailsManager {
  constructor() {
    this.activeTab = ref('overview')
    this.isPrinting = ref(false)
    this.isExporting = ref(false)
  }

  getMethods(props, emit, authStore) {
    return {
      activeTab: this.activeTab,
      isPrinting: this.isPrinting,
      isExporting: this.isExporting,
      canEdit: this.getCanEdit(props, authStore),
      canDelete: this.getCanDelete(props, authStore),
      getStatusText: this.getStatusText.bind(this),
      getGenderText: this.getGenderText.bind(this),
      getPriorityText: this.getPriorityText.bind(this),
      getUrgencyText: this.getUrgencyText.bind(this),
      getFollowUpStatus: this.getFollowUpStatus.bind(this),
      getRecordSummary: this.getRecordSummary.bind(this),
      getRecordStats: this.getRecordStats.bind(this),
      getPatientInfo: this.getPatientInfo.bind(this),
      getDoctorInfo: this.getDoctorInfo.bind(this),
      getDiagnosesInfo: this.getDiagnosesInfo.bind(this),
      getPrescriptionsInfo: this.getPrescriptionsInfo.bind(this),
      getMedicalTestsInfo: this.getMedicalTestsInfo.bind(this),
      getAttachmentsInfo: this.getAttachmentsInfo.bind(this),
      getTimelineEvents: this.getTimelineEvents.bind(this),
      handlePrint: this.handlePrint.bind(this),
      handleExport: this.handleExport.bind(this),
      handleEdit: this.handleEdit.bind(this),
      handleDelete: this.handleDelete.bind(this),
      handleStatusChange: this.handleStatusChange.bind(this),
      handlePriorityChange: this.handlePriorityChange.bind(this),
      handleFollowUpUpdate: this.handleFollowUpUpdate.bind(this),
      confirmDelete: this.confirmDelete.bind(this, props, emit)
    }
  }

  // Computed properties
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

  getPriorityText(priority) {
    const texts = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة'
    }
    return texts[priority] || priority
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

  getFollowUpStatus(followUpDate) {
    if (!followUpDate) {
      return {
        status: 'none',
        text: 'لا يوجد موعد متابعة',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        icon: '📅'
      }
    }

    if (isOverdue(followUpDate)) {
      return {
        status: 'overdue',
        text: 'متأخر',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '⚠️'
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
        bgColor: 'bg-orange-50',
        icon: '🔔'
      }
    }

    if (daysUntilFollowUp <= 3) {
      return {
        status: 'soon',
        text: `خلال ${daysUntilFollowUp} أيام`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: '⏰'
      }
    }

    if (daysUntilFollowUp <= 7) {
      return {
        status: 'upcoming',
        text: `خلال ${daysUntilFollowUp} أيام`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '📋'
      }
    }

    return {
      status: 'future',
      text: `خلال ${daysUntilFollowUp} أيام`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅'
    }
  }

  // Get record summary
  getRecordSummary(record) {
    const summary = {
      patientName: record.patient?.name || 'مريض غير محدد',
      age: record.patient?.age || null,
      gender: record.patient?.gender || null,
      phone: record.patient?.phone || null,
      email: record.patient?.email || null,
      chiefComplaint: record.chief_complaint || 'غير محدد',
      diagnosis: record.diagnosis || 'غير محدد',
      treatmentPlan: record.treatment_plan || 'غير محدد',
      doctorName: record.doctor?.name || 'طبيب غير محدد',
      department: record.doctor?.department || null,
      specialization: record.doctor?.specialization || null,
      examinationDate: record.examination_date || null,
      followUpDate: record.follow_up_date || null,
      status: record.status || 'غير محدد',
      priority: record.priority || 'medium',
      urgency: record.urgency || 'normal',
      notes: record.notes || null,
      createdAt: record.created_at || null,
      updatedAt: record.updated_at || null
    }

    return summary
  }

  // Get record statistics
  getRecordStats(record) {
    const stats = {
      diagnoses: record.diagnoses?.length || 0,
      prescriptions: record.prescriptions?.length || 0,
      tests: record.medical_tests?.length || 0,
      attachments: record.attachments?.length || 0,
      criticalDiagnoses: record.diagnoses?.filter(d => d.severity === 'critical').length || 0,
      pendingTests: record.medical_tests?.filter(t => t.status === 'pending').length || 0,
      completedTests: record.medical_tests?.filter(t => t.status === 'completed').length || 0
    }

    return stats
  }

  // Get patient information
  getPatientInfo(record) {
    if (!record.patient) return null

    return {
      id: record.patient.id,
      name: record.patient.name,
      age: record.patient.age,
      gender: record.patient.gender,
      phone: record.patient.phone,
      email: record.patient.email,
      address: record.patient.address,
      emergencyContact: record.patient.emergency_contact,
      medicalHistory: record.patient.medical_history,
      allergies: record.patient.allergies,
      bloodType: record.patient.blood_type,
      insurance: record.patient.insurance_info
    }
  }

  // Get doctor information
  getDoctorInfo(record) {
    if (!record.doctor) return null

    return {
      id: record.doctor.id,
      name: record.doctor.name,
      department: record.doctor.department,
      specialization: record.doctor.specialization,
      phone: record.doctor.phone,
      email: record.doctor.email,
      license: record.doctor.license_number,
      experience: record.doctor.years_of_experience,
      availability: record.doctor.availability
    }
  }

  // Get diagnoses information
  getDiagnosesInfo(record) {
    if (!record.diagnoses || record.diagnoses.length === 0) return []

    return record.diagnoses.map(diagnosis => ({
      id: diagnosis.id,
      name: diagnosis.name,
      description: diagnosis.description,
      severity: diagnosis.severity,
      icdCode: diagnosis.icd_code,
      date: diagnosis.diagnosis_date,
      notes: diagnosis.notes,
      confirmed: diagnosis.confirmed || false
    }))
  }

  // Get prescriptions information
  getPrescriptionsInfo(record) {
    if (!record.prescriptions || record.prescriptions.length === 0) return []

    return record.prescriptions.map(prescription => ({
      id: prescription.id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      startDate: prescription.start_date,
      endDate: prescription.end_date,
      status: prescription.status || 'active',
      refills: prescription.refills || 0
    }))
  }

  // Get medical tests information
  getMedicalTestsInfo(record) {
    if (!record.medical_tests || record.medical_tests.length === 0) return []

    return record.medical_tests.map(test => ({
      id: test.id,
      name: test.test_name,
      type: test.test_type,
      status: test.status,
      results: test.results,
      notes: test.notes,
      orderedDate: test.ordered_date,
      completedDate: test.completed_date,
      lab: test.laboratory,
      cost: test.cost
    }))
  }

  // Get attachments information
  getAttachmentsInfo(record) {
    if (!record.attachments || record.attachments.length === 0) return []

    return record.attachments.map(attachment => ({
      id: attachment.id,
      fileName: attachment.file_name,
      fileType: attachment.file_type,
      fileSize: attachment.file_size,
      description: attachment.description,
      uploadedDate: attachment.uploaded_date,
      uploadedBy: attachment.uploaded_by,
      url: attachment.file_url
    }))
  }

  // Get timeline events
  getTimelineEvents(record) {
    const events = []

    // Record creation
    if (record.created_at) {
      events.push({
        type: 'created',
        title: 'إنشاء السجل الطبي',
        description: 'تم إنشاء السجل الطبي',
        date: record.created_at,
        icon: '📝',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      })
    }

    // Examination date
    if (record.examination_date) {
      events.push({
        type: 'examination',
        title: 'تاريخ الفحص',
        description: 'تم إجراء الفحص الطبي',
        date: record.examination_date,
        icon: '🏥',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      })
    }

    // Follow-up date
    if (record.follow_up_date) {
      events.push({
        type: 'followup',
        title: 'موعد المتابعة',
        description: 'موعد المتابعة المحدد',
        date: record.follow_up_date,
        icon: '📅',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      })
    }

    // Status changes
    if (record.status_changes && record.status_changes.length > 0) {
      record.status_changes.forEach(change => {
        events.push({
          type: 'status_change',
          title: `تغيير الحالة إلى ${this.getStatusText(change.new_status)}`,
          description: change.reason || 'تغيير في حالة السجل',
          date: change.changed_at,
          icon: '🔄',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        })
      })
    }

    // Test results
    if (record.medical_tests) {
      record.medical_tests.forEach(test => {
        if (test.completed_date) {
          events.push({
            type: 'test_completed',
            title: `اكتمال فحص ${test.test_name}`,
            description: 'تم إكمال الفحص الطبي',
            date: test.completed_date,
            icon: '🔬',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          })
        }
      })
    }

    // Last update
    if (record.updated_at && record.updated_at !== record.created_at) {
      events.push({
        type: 'updated',
        title: 'آخر تحديث',
        description: 'تم تحديث السجل الطبي',
        date: record.updated_at,
        icon: '✏️',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      })
    }

    // Sort events by date (newest first)
    return events.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // Handle print
  handlePrint() {
    this.isPrinting.value = true
    
    setTimeout(() => {
      window.print()
      this.isPrinting.value = false
    }, 100)
  }

  // Handle export
  async handleExport(format = 'pdf') {
    this.isExporting.value = true
    
    try {
      // Implementation for export functionality
      console.log(`Exporting record in ${format} format`)
      
      // Emit export event
      // emit('export', { format, recordId: props.record.id })
      
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      this.isExporting.value = false
    }
  }

  // Handle edit
  handleEdit(record) {
    // Emit edit event
    // emit('edit', record)
    console.log('Edit record:', record)
  }

  // Handle delete
  handleDelete(record) {
    // Emit delete event
    // emit('delete', record)
    console.log('Delete record:', record)
  }

  // Handle status change
  handleStatusChange(newStatus, reason = '') {
    // Emit status change event
    // emit('statusChange', { newStatus, reason, recordId: props.record.id })
    console.log('Status change:', { newStatus, reason })
  }

  // Handle priority change
  handlePriorityChange(newPriority) {
    // Emit priority change event
    // emit('priorityChange', { newPriority, recordId: props.record.id })
    console.log('Priority change:', newPriority)
  }

  // Handle follow-up update
  handleFollowUpUpdate(newDate) {
    // Emit follow-up update event
    // emit('followUpUpdate', { newDate, recordId: props.record.id })
    console.log('Follow-up update:', newDate)
  }

  // Confirm delete
  confirmDelete(props, emit) {
    if (confirm('هل أنت متأكد من حذف هذا السجل الطبي؟')) {
      emit('delete', props.record)
    }
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
        text: `أولوية ${this.getPriorityText(record.priority)}`,
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

  // Get record metrics
  getRecordMetrics(record) {
    const metrics = {
      totalVisits: record.visit_count || 1,
      daysActive: record.created_at ? Math.ceil((new Date() - new Date(record.created_at)) / (1000 * 60 * 60 * 24)) : 0,
      followUpCount: record.follow_up_count || 0,
      prescriptionCount: record.prescriptions?.length || 0,
      testCount: record.medical_tests?.length || 0,
      attachmentCount: record.attachments?.length || 0
    }

    return metrics
  }
}
