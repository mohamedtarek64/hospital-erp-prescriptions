import { ref, reactive, computed, watch } from 'vue'

export function useTransferForm(props, { emit }) {
  const loading = ref(false)
  const errors = ref({})
  const successMessage = ref('')

  const form = reactive({
    patient_id: '',
    current_ward: '',
    current_room: '',
    new_ward_id: '',
    new_room_id: '',
    new_bed_id: '',
    transfer_date: '',
    reason: '',
    notes: '',
    transferring_doctor_id: '',
    receiving_doctor_id: ''
  })

  const availableWards = computed(() => {
    return props.wards.filter(ward => 
      ward.id !== props.currentWard?.id && ward.available_beds > 0
    )
  })

  const availableRooms = computed(() => {
    if (!form.new_ward_id) return []
    
    const selectedWard = props.wards.find(ward => ward.id === form.new_ward_id)
    if (!selectedWard) return []
    
    return selectedWard.rooms?.filter(room => 
      room.available_beds > 0
    ) || []
  })

  const availableBeds = computed(() => {
    if (!form.new_room_id) return []
    
    const selectedRoom = availableRooms.value.find(room => room.id === form.new_room_id)
    if (!selectedRoom) return []
    
    return selectedRoom.beds?.filter(bed => 
      bed.status === 'available'
    ) || []
  })

  const receivingDoctors = computed(() => {
    if (!form.new_ward_id) return []
    
    const selectedWard = props.wards.find(ward => ward.id === form.new_ward_id)
    if (!selectedWard) return []
    
    return props.doctors.filter(doctor => 
      doctor.ward_id === form.new_ward_id
    )
  })

  const validateForm = () => {
    errors.value = {}
    
    if (!form.patient_id) {
      errors.value.patient_id = ['Patient is required']
    }
    
    if (!form.new_ward_id) {
      errors.value.new_ward_id = ['New ward is required']
    }
    
    if (!form.new_room_id) {
      errors.value.new_room_id = ['New room is required']
    }
    
    if (!form.new_bed_id) {
      errors.value.new_bed_id = ['New bed is required']
    }
    
    if (!form.transfer_date) {
      errors.value.transfer_date = ['Transfer date is required']
    } else {
      const transferDate = new Date(form.transfer_date)
      const now = new Date()
      
      if (transferDate < now) {
        errors.value.transfer_date = ['Transfer date cannot be in the past']
      }
    }
    
    if (!form.reason) {
      errors.value.reason = ['Transfer reason is required']
    }
    
    if (!form.transferring_doctor_id) {
      errors.value.transferring_doctor_id = ['Transferring doctor is required']
    }
    
    if (!form.receiving_doctor_id) {
      errors.value.receiving_doctor_id = ['Receiving doctor is required']
    }
    
    return Object.keys(errors.value).length === 0
  }

  const submitTransfer = async () => {
    if (!validateForm()) {
      return
    }
    
    loading.value = true
    errors.value = {}
    successMessage.value = ''
    
    try {
      const transferData = {
        ...form,
        current_ward_id: props.currentWard?.id,
        current_room_id: props.currentRoom?.id
      }
      
      emit('submit', transferData)
      
      successMessage.value = 'Transfer request submitted successfully!'
      
      // Reset form after successful submission
      setTimeout(() => {
        resetForm()
      }, 2000)
      
    } catch (error) {
      console.error('Transfer error:', error)
      errors.value = error.response?.data?.errors || { general: ['Transfer failed. Please try again.'] }
    } finally {
      loading.value = false
    }
  }

  const cancelTransfer = () => {
    emit('cancel')
  }

  const resetForm = () => {
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    errors.value = {}
    successMessage.value = ''
  }

  // Initialize form with patient data
  watch(() => props.patient, (patient) => {
    if (patient) {
      form.patient_id = patient.id
      form.current_ward = props.currentWard?.name || ''
      form.current_room = props.currentRoom?.number || ''
    }
  }, { immediate: true })

  // Set default transfer date to current time
  watch(() => form.transfer_date, (date) => {
    if (!date) {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      form.transfer_date = now.toISOString().slice(0, 16)
    }
  }, { immediate: true })

  // Reset dependent fields when ward changes
  watch(() => form.new_ward_id, () => {
    form.new_room_id = ''
    form.new_bed_id = ''
    form.receiving_doctor_id = ''
  })

  // Reset bed when room changes
  watch(() => form.new_room_id, () => {
    form.new_bed_id = ''
  })

  return {
    form,
    loading,
    errors,
    successMessage,
    availableWards,
    availableRooms,
    availableBeds,
    receivingDoctors,
    submitTransfer,
    cancelTransfer,
    resetForm
  }
}
