import { ref, onMounted, computed } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'

export function useAppointments() {
  const appointmentsStore = useAppointmentsStore()
  const currentDate = ref(new Date())
  const selectedDate = ref(new Date())

  const loadAppointments = async () => {
    try {
      await appointmentsStore.fetchAppointments()
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  const addAppointment = async (appointmentData) => {
    try {
      const result = await appointmentsStore.createAppointment(appointmentData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error adding appointment:', error)
      throw error
    }
  }

  const updateAppointment = async (id, appointmentData) => {
    try {
      const result = await appointmentsStore.updateAppointment(id, appointmentData)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  const deleteAppointment = async (id) => {
    try {
      const result = await appointmentsStore.deleteAppointment(id)
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }

  const startAppointment = async (id) => {
    try {
      const result = await appointmentsStore.updateAppointment(id, { status: 'in-progress' })
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error starting appointment:', error)
      throw error
    }
  }

  const completeAppointment = async (id) => {
    try {
      const result = await appointmentsStore.updateAppointment(id, { status: 'completed' })
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error completing appointment:', error)
      throw error
    }
  }

  const cancelAppointment = async (id) => {
    try {
      const result = await appointmentsStore.updateAppointment(id, { status: 'cancelled' })
      if (result.success) {
        return result
      }
      throw new Error(result.message)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      throw error
    }
  }

  const todaysAppointments = computed(() => {
    return appointmentsStore.todaysAppointments
  })

  const pendingAppointments = computed(() => {
    return appointmentsStore.pendingAppointments
  })

  const completedAppointments = computed(() => {
    return appointmentsStore.completedAppointments
  })

  onMounted(() => {
    loadAppointments()
  })

  return {
    appointments: appointmentsStore.appointments,
    loading: appointmentsStore.loading,
    error: appointmentsStore.error,
    currentDate,
    selectedDate,
    todaysAppointments,
    pendingAppointments,
    completedAppointments,
    loadAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    startAppointment,
    completeAppointment,
    cancelAppointment,
    clearError: appointmentsStore.clearError
  }
}
