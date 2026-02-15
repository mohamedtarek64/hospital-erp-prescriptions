/**
 * Emergency Management Helper Functions
 * Provides utility functions for emergency and ambulance management
 */

/**
 * Format emergency priority level
 */
export const formatEmergencyPriority = (priority) => {
  const priorityMap = {
    'critical': { label: 'Critical', color: 'red', icon: 'fas fa-exclamation-triangle' },
    'high': { label: 'High', color: 'orange', icon: 'fas fa-exclamation-circle' },
    'medium': { label: 'Medium', color: 'yellow', icon: 'fas fa-exclamation' },
    'low': { label: 'Low', color: 'green', icon: 'fas fa-info-circle' }
  }
  
  return priorityMap[priority] || { label: 'Unknown', color: 'gray', icon: 'fas fa-question' }
}

/**
 * Format emergency status
 */
export const formatEmergencyStatus = (status) => {
  const statusMap = {
    'pending': { label: 'Pending', color: 'yellow', icon: 'fas fa-clock' },
    'dispatched': { label: 'Dispatched', color: 'blue', icon: 'fas fa-paper-plane' },
    'en_route': { label: 'En Route', color: 'purple', icon: 'fas fa-route' },
    'arrived': { label: 'Arrived', color: 'green', icon: 'fas fa-map-marker-alt' },
    'completed': { label: 'Completed', color: 'gray', icon: 'fas fa-check-circle' },
    'cancelled': { label: 'Cancelled', color: 'red', icon: 'fas fa-times-circle' }
  }
  
  return statusMap[status] || { label: 'Unknown', color: 'gray', icon: 'fas fa-question' }
}

/**
 * Format ambulance type
 */
export const formatAmbulanceType = (type) => {
  const typeMap = {
    'basic': 'Basic Life Support',
    'advanced': 'Advanced Life Support',
    'critical_care': 'Critical Care',
    'neonatal': 'Neonatal',
    'psychiatric': 'Psychiatric'
  }
  
  return typeMap[type] || 'Unknown Type'
}

/**
 * Format triage level
 */
export const formatTriageLevel = (level) => {
  const levelMap = {
    'critical': { label: 'Critical', color: 'red', time: 'Immediate', icon: 'fas fa-exclamation-triangle' },
    'high': { label: 'High Priority', color: 'orange', time: '10 minutes', icon: 'fas fa-exclamation-circle' },
    'medium': { label: 'Medium Priority', color: 'yellow', time: '30 minutes', icon: 'fas fa-exclamation' },
    'low': { label: 'Low Priority', color: 'green', time: '2 hours', icon: 'fas fa-info-circle' }
  }
  
  return levelMap[level] || { label: 'Unknown', color: 'gray', time: 'N/A', icon: 'fas fa-question' }
}

/**
 * Calculate response time
 */
export const calculateResponseTime = (dispatchTime, arrivalTime) => {
  if (!dispatchTime || !arrivalTime) return null
  
  const dispatch = new Date(dispatchTime)
  const arrival = new Date(arrivalTime)
  const diffMs = arrival - dispatch
  const diffMinutes = Math.floor(diffMs / 60000)
  
  return diffMinutes
}

/**
 * Format response time
 */
export const formatResponseTime = (minutes) => {
  if (minutes === null || minutes === undefined) return 'N/A'
  
  if (minutes < 60) {
    return `${minutes}m`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
}

/**
 * Get emergency type icon
 */
export const getEmergencyTypeIcon = (type) => {
  const iconMap = {
    'cardiac': 'fas fa-heartbeat',
    'trauma': 'fas fa-car-crash',
    'respiratory': 'fas fa-lungs',
    'neurological': 'fas fa-brain',
    'pediatric': 'fas fa-child',
    'obstetric': 'fas fa-baby',
    'psychiatric': 'fas fa-user-injured',
    'burn': 'fas fa-fire',
    'poisoning': 'fas fa-skull-crossbones',
    'other': 'fas fa-ambulance'
  }
  
  return iconMap[type] || 'fas fa-ambulance'
}

/**
 * Get ambulance status color
 */
export const getAmbulanceStatusColor = (status) => {
  const colorMap = {
    'available': 'green',
    'busy': 'blue',
    'maintenance': 'yellow',
    'offline': 'red'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Calculate distance between two coordinates
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return distance
}

/**
 * Format distance
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else {
    return `${distance.toFixed(1)}km`
  }
}

/**
 * Get nearest available ambulance
 */
export const getNearestAmbulance = (ambulances, targetLat, targetLon) => {
  if (!ambulances || ambulances.length === 0) return null
  
  const availableAmbulances = ambulances.filter(ambulance => 
    ambulance.status === 'available' && 
    ambulance.location && 
    ambulance.location.lat && 
    ambulance.location.lng
  )
  
  if (availableAmbulances.length === 0) return null
  
  let nearest = availableAmbulances[0]
  let minDistance = calculateDistance(
    targetLat, targetLon,
    nearest.location.lat, nearest.location.lng
  )
  
  for (let i = 1; i < availableAmbulances.length; i++) {
    const ambulance = availableAmbulances[i]
    const distance = calculateDistance(
      targetLat, targetLon,
      ambulance.location.lat, ambulance.location.lng
    )
    
    if (distance < minDistance) {
      minDistance = distance
      nearest = ambulance
    }
  }
  
  return {
    ...nearest,
    distance: minDistance
  }
}

/**
 * Format emergency case number
 */
export const formatEmergencyCaseNumber = (caseNumber) => {
  if (!caseNumber) return 'N/A'
  return `EM-${caseNumber.toString().padStart(6, '0')}`
}

/**
 * Format ambulance vehicle number
 */
export const formatAmbulanceNumber = (vehicleNumber) => {
  if (!vehicleNumber) return 'N/A'
  return `AMB-${vehicleNumber.toString().padStart(3, '0')}`
}

/**
 * Get emergency severity score
 */
export const getEmergencySeverityScore = (vitalSigns, symptoms) => {
  let score = 0
  
  // Vital signs scoring
  if (vitalSigns) {
    if (vitalSigns.heart_rate < 60 || vitalSigns.heart_rate > 120) score += 2
    if (vitalSigns.systolic_bp < 90 || vitalSigns.systolic_bp > 180) score += 2
    if (vitalSigns.temperature < 36 || vitalSigns.temperature > 38.5) score += 1
    if (vitalSigns.oxygen_saturation < 95) score += 3
  }
  
  // Symptoms scoring
  if (symptoms) {
    const criticalSymptoms = ['chest_pain', 'difficulty_breathing', 'unconscious', 'severe_bleeding']
    const urgentSymptoms = ['severe_pain', 'high_fever', 'confusion', 'nausea']
    
    criticalSymptoms.forEach(symptom => {
      if (symptoms.includes(symptom)) score += 3
    })
    
    urgentSymptoms.forEach(symptom => {
      if (symptoms.includes(symptom)) score += 1
    })
  }
  
  return Math.min(score, 10) // Cap at 10
}

/**
 * Get triage level from severity score
 */
export const getTriageLevelFromScore = (score) => {
  if (score >= 8) return 'critical'
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

/**
 * Format time duration
 */
export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A'
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end - start
  const diffMinutes = Math.floor(diffMs / 60000)
  
  return formatResponseTime(diffMinutes)
}

/**
 * Get emergency statistics
 */
export const getEmergencyStatistics = (emergencyCases) => {
  if (!emergencyCases || emergencyCases.length === 0) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      averageResponseTime: 0,
      priorityDistribution: {}
    }
  }
  
  const total = emergencyCases.length
  const active = emergencyCases.filter(case_ => case_.status === 'active').length
  const completed = emergencyCases.filter(case_ => case_.status === 'completed').length
  
  // Calculate average response time
  const responseTimes = emergencyCases
    .filter(case_ => case_.dispatch_time && case_.arrival_time)
    .map(case_ => calculateResponseTime(case_.dispatch_time, case_.arrival_time))
    .filter(time => time !== null)
  
  const averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0
  
  // Priority distribution
  const priorityDistribution = emergencyCases.reduce((acc, case_) => {
    acc[case_.priority] = (acc[case_.priority] || 0) + 1
    return acc
  }, {})
  
  return {
    total,
    active,
    completed,
    averageResponseTime: Math.round(averageResponseTime),
    priorityDistribution
  }
}

/**
 * Get ambulance fleet statistics
 */
export const getAmbulanceFleetStatistics = (ambulances) => {
  if (!ambulances || ambulances.length === 0) {
    return {
      total: 0,
      available: 0,
      busy: 0,
      maintenance: 0,
      offline: 0,
      utilizationRate: 0
    }
  }
  
  const total = ambulances.length
  const available = ambulances.filter(amb => amb.status === 'available').length
  const busy = ambulances.filter(amb => amb.status === 'busy').length
  const maintenance = ambulances.filter(amb => amb.status === 'maintenance').length
  const offline = ambulances.filter(amb => amb.status === 'offline').length
  
  const utilizationRate = total > 0 ? ((busy / total) * 100) : 0
  
  return {
    total,
    available,
    busy,
    maintenance,
    offline,
    utilizationRate: Math.round(utilizationRate)
  }
}

/**
 * Validate emergency case data
 */
export const validateEmergencyCase = (caseData) => {
  const errors = []
  
  if (!caseData.patient_name) {
    errors.push('Patient name is required')
  }
  
  if (!caseData.caller_phone) {
    errors.push('Caller phone number is required')
  }
  
  if (!caseData.location) {
    errors.push('Location is required')
  }
  
  if (!caseData.emergency_type) {
    errors.push('Emergency type is required')
  }
  
  if (!caseData.priority) {
    errors.push('Priority level is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate triage assessment data
 */
export const validateTriageAssessment = (assessmentData) => {
  const errors = []
  
  if (!assessmentData.patient_name) {
    errors.push('Patient name is required')
  }
  
  if (!assessmentData.age) {
    errors.push('Age is required')
  }
  
  if (!assessmentData.gender) {
    errors.push('Gender is required')
  }
  
  if (!assessmentData.chief_complaint) {
    errors.push('Chief complaint is required')
  }
  
  if (!assessmentData.triage_level) {
    errors.push('Triage level is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate emergency case ID
 */
export const generateEmergencyCaseId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `EM${timestamp}${random.toString().padStart(3, '0')}`
}

/**
 * Generate ambulance dispatch ID
 */
export const generateDispatchId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 100)
  return `DISP${timestamp}${random.toString().padStart(2, '0')}`
}

/**
 * Get emergency type from symptoms
 */
export const getEmergencyTypeFromSymptoms = (symptoms) => {
  if (!symptoms || symptoms.length === 0) return 'other'
  
  const symptomMap = {
    'chest_pain': 'cardiac',
    'heart_attack': 'cardiac',
    'stroke': 'neurological',
    'difficulty_breathing': 'respiratory',
    'severe_bleeding': 'trauma',
    'car_accident': 'trauma',
    'burn': 'burn',
    'poisoning': 'poisoning',
    'psychiatric_emergency': 'psychiatric',
    'pregnancy_complications': 'obstetric',
    'child_emergency': 'pediatric'
  }
  
  for (const symptom of symptoms) {
    if (symptomMap[symptom]) {
      return symptomMap[symptom]
    }
  }
  
  return 'other'
}

/**
 * Get priority from emergency type and symptoms
 */
export const getPriorityFromEmergencyType = (emergencyType, symptoms) => {
  const criticalTypes = ['cardiac', 'neurological', 'trauma', 'respiratory']
  const urgentTypes = ['burn', 'poisoning', 'obstetric', 'pediatric']
  
  if (criticalTypes.includes(emergencyType)) {
    return 'critical'
  } else if (urgentTypes.includes(emergencyType)) {
    return 'high'
  } else if (symptoms && symptoms.includes('severe_pain')) {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * Format emergency location
 */
export const formatEmergencyLocation = (location) => {
  if (!location) return 'Unknown Location'
  
  if (typeof location === 'string') {
    return location
  }
  
  if (location.address) {
    return location.address
  }
  
  if (location.lat && location.lng) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
  }
  
  return 'Unknown Location'
}

/**
 * Get emergency case status color
 */
export const getEmergencyCaseStatusColor = (status) => {
  const colorMap = {
    'pending': 'yellow',
    'dispatched': 'blue',
    'en_route': 'purple',
    'arrived': 'green',
    'completed': 'gray',
    'cancelled': 'red'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Get triage level color
 */
export const getTriageLevelColor = (level) => {
  const colorMap = {
    'critical': 'red',
    'high': 'orange',
    'medium': 'yellow',
    'low': 'green'
  }
  
  return colorMap[level] || 'gray'
}

/**
 * Calculate estimated arrival time
 */
export const calculateEstimatedArrivalTime = (ambulanceLocation, emergencyLocation, averageSpeed = 60) => {
  if (!ambulanceLocation || !emergencyLocation) return null
  
  const distance = calculateDistance(
    ambulanceLocation.lat, ambulanceLocation.lng,
    emergencyLocation.lat, emergencyLocation.lng
  )
  
  const timeInHours = distance / averageSpeed
  const timeInMinutes = timeInHours * 60
  
  const estimatedArrival = new Date()
  estimatedArrival.setMinutes(estimatedArrival.getMinutes() + Math.ceil(timeInMinutes))
  
  return estimatedArrival
}

/**
 * Format estimated arrival time
 */
export const formatEstimatedArrivalTime = (estimatedTime) => {
  if (!estimatedTime) return 'N/A'
  
  const now = new Date()
  const diffMs = estimatedTime - now
  const diffMinutes = Math.ceil(diffMs / 60000)
  
  if (diffMinutes <= 0) return 'Arriving now'
  if (diffMinutes < 60) return `${diffMinutes}m`
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return `${hours}h ${minutes}m`
}

/**
 * Get emergency case summary
 */
export const getEmergencyCaseSummary = (emergencyCase) => {
  if (!emergencyCase) return 'No emergency case data'
  
  const priority = formatEmergencyPriority(emergencyCase.priority)
  const status = formatEmergencyStatus(emergencyCase.status)
  const location = formatEmergencyLocation(emergencyCase.location)
  
  return `${priority.label} priority ${emergencyCase.emergency_type} emergency - ${status.label} - ${location}`
}

/**
 * Get ambulance summary
 */
export const getAmbulanceSummary = (ambulance) => {
  if (!ambulance) return 'No ambulance data'
  
  const type = formatAmbulanceType(ambulance.type)
  const status = formatEmergencyStatus(ambulance.status)
  const location = formatEmergencyLocation(ambulance.location)
  
  return `${type} ambulance - ${status.label} - ${location}`
}

/**
 * Check if emergency case is urgent
 */
export const isUrgentEmergency = (emergencyCase) => {
  if (!emergencyCase) return false
  
  const urgentPriorities = ['critical', 'high']
  return urgentPriorities.includes(emergencyCase.priority)
}

/**
 * Check if ambulance is available
 */
export const isAmbulanceAvailable = (ambulance) => {
  if (!ambulance) return false
  return ambulance.status === 'available'
}

/**
 * Get emergency case age
 */
export const getEmergencyCaseAge = (createdAt) => {
  if (!createdAt) return 'Unknown'
  
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now - created
  const diffMinutes = Math.floor(diffMs / 60000)
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

/**
 * Sort emergency cases by priority and time
 */
export const sortEmergencyCasesByPriority = (cases) => {
  if (!cases || cases.length === 0) return []
  
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
  
  return [...cases].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    return new Date(a.created_at) - new Date(b.created_at)
  })
}

/**
 * Filter emergency cases by status
 */
export const filterEmergencyCasesByStatus = (cases, status) => {
  if (!cases || cases.length === 0) return []
  if (!status) return cases
  
  return cases.filter(case_ => case_.status === status)
}

/**
 * Filter emergency cases by priority
 */
export const filterEmergencyCasesByPriority = (cases, priority) => {
  if (!cases || cases.length === 0) return []
  if (!priority) return cases
  
  return cases.filter(case_ => case_.priority === priority)
}

/**
 * Get emergency case statistics by time period
 */
export const getEmergencyCaseStatisticsByPeriod = (cases, period = 'day') => {
  if (!cases || cases.length === 0) return {}
  
  const now = new Date()
  const periodMap = {
    'hour': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000
  }
  
  const periodMs = periodMap[period] || periodMap['day']
  const startTime = new Date(now.getTime() - periodMs)
  
  const filteredCases = cases.filter(case_ => 
    new Date(case_.created_at) >= startTime
  )
  
  return getEmergencyStatistics(filteredCases)
}

/**
 * Export all helper functions
 */
export default {
  formatEmergencyPriority,
  formatEmergencyStatus,
  formatAmbulanceType,
  formatTriageLevel,
  calculateResponseTime,
  formatResponseTime,
  getEmergencyTypeIcon,
  getAmbulanceStatusColor,
  calculateDistance,
  formatDistance,
  getNearestAmbulance,
  formatEmergencyCaseNumber,
  formatAmbulanceNumber,
  getEmergencySeverityScore,
  getTriageLevelFromScore,
  formatDuration,
  getEmergencyStatistics,
  getAmbulanceFleetStatistics,
  validateEmergencyCase,
  validateTriageAssessment,
  generateEmergencyCaseId,
  generateDispatchId,
  getEmergencyTypeFromSymptoms,
  getPriorityFromEmergencyType,
  formatEmergencyLocation,
  getEmergencyCaseStatusColor,
  getTriageLevelColor,
  calculateEstimatedArrivalTime,
  formatEstimatedArrivalTime,
  getEmergencyCaseSummary,
  getAmbulanceSummary,
  isUrgentEmergency,
  isAmbulanceAvailable,
  getEmergencyCaseAge,
  sortEmergencyCasesByPriority,
  filterEmergencyCasesByStatus,
  filterEmergencyCasesByPriority,
  getEmergencyCaseStatisticsByPeriod
}
