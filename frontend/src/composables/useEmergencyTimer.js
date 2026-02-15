import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

export function useEmergencyTimer(props, emit) {
  // Reactive state
  const isRunning = ref(false)
  const startTime = ref(null)
  const currentTime = ref(0)
  const dispatchTime = ref(null)
  const arrivalTime = ref(null)
  const hospitalTime = ref(null)
  const targetTime = ref(15) // Default 15 minutes
  const emergencyType = ref('medium')
  
  // Timer interval
  let timerInterval = null

  // Milestones
  const milestones = reactive([
    {
      id: 'dispatch',
      name: 'Ambulance Dispatched',
      icon: 'fas fa-paper-plane',
      completed: false,
      current: false,
      time: null
    },
    {
      id: 'arrival',
      name: 'Ambulance Arrived',
      icon: 'fas fa-map-marker-alt',
      completed: false,
      current: false,
      time: null
    },
    {
      id: 'hospital',
      name: 'Arrived at Hospital',
      icon: 'fas fa-hospital',
      completed: false,
      current: false,
      time: null
    }
  ])

  // Computed properties
  const canStart = computed(() => {
    return !isRunning.value && props.emergencyCase
  })

  const formattedTime = computed(() => {
    return formatTime(currentTime.value)
  })

  const formattedDispatchTime = computed(() => {
    return dispatchTime.value ? formatTime(dispatchTime.value) : '--:--'
  })

  const formattedArrivalTime = computed(() => {
    return arrivalTime.value ? formatTime(arrivalTime.value) : '--:--'
  })

  const formattedHospitalTime = computed(() => {
    return hospitalTime.value ? formatTime(hospitalTime.value) : '--:--'
  })

  const showWarning = computed(() => {
    return currentTime.value > targetTime.value * 60 && currentTime.value <= targetTime.value * 60 * 1.5
  })

  const showCritical = computed(() => {
    return currentTime.value > targetTime.value * 60 * 1.5
  })

  // Methods
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    if (!props.emergencyCase) return
    
    isRunning.value = true
    startTime.value = Date.now()
    
    timerInterval = setInterval(() => {
      currentTime.value = Math.floor((Date.now() - startTime.value) / 1000)
      
      // Check for warnings and critical alerts
      if (showWarning.value && !showCritical.value) {
        emit('target-exceeded', { time: currentTime.value, target: targetTime.value })
      }
      
      if (showCritical.value) {
        emit('critical-exceeded', { time: currentTime.value, target: targetTime.value })
      }
    }, 1000)
  }

  const pauseTimer = () => {
    isRunning.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const resetTimer = () => {
    pauseTimer()
    currentTime.value = 0
    dispatchTime.value = null
    arrivalTime.value = null
    hospitalTime.value = null
    startTime.value = null
    
    // Reset milestones
    milestones.forEach(milestone => {
      milestone.completed = false
      milestone.current = false
      milestone.time = null
    })
  }

  const toggleTimer = () => {
    if (isRunning.value) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  const markMilestone = (milestoneId) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (!milestone || milestone.completed) return
    
    milestone.completed = true
    milestone.current = false
    milestone.time = formatTime(currentTime.value)
    
    // Set the time for the specific milestone
    switch (milestoneId) {
      case 'dispatch':
        dispatchTime.value = currentTime.value
        break
      case 'arrival':
        arrivalTime.value = currentTime.value
        break
      case 'hospital':
        hospitalTime.value = currentTime.value
        break
    }
    
    emit('milestone-reached', { milestone: milestoneId, time: currentTime.value })
  }

  const setCurrentMilestone = (milestoneId) => {
    milestones.forEach(milestone => {
      milestone.current = milestone.id === milestoneId
    })
  }

  // Watch for emergency case changes
  watch(() => props.emergencyCase, (newCase) => {
    if (newCase) {
      // Set target time based on emergency type
      const targetTimes = {
        critical: 5,
        high: 10,
        medium: 15,
        low: 30
      }
      targetTime.value = targetTimes[newCase.priority] || 15
      emergencyType.value = newCase.priority || 'medium'
      
      // Auto-start if enabled
      if (props.autoStart) {
        startTimer()
      }
    }
  }, { immediate: true })

  // Lifecycle
  onMounted(() => {
    if (props.autoStart && props.emergencyCase) {
      startTimer()
    }
  })

  onUnmounted(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
  })

  return {
    // State
    isRunning,
    canStart,
    formattedTime,
    formattedDispatchTime,
    formattedArrivalTime,
    formattedHospitalTime,
    milestones,
    targetTime,
    emergencyType,
    showWarning,
    showCritical,
    
    // Methods
    toggleTimer,
    resetTimer,
    markMilestone,
    setCurrentMilestone
  }
}
