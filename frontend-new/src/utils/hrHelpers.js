// HR Helper Functions
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth } from 'date-fns'

/**
 * Format employee data for display
 */
export const formatEmployeeData = (employee) => {
  return {
    ...employee,
    fullName: `${employee.first_name} ${employee.last_name}`,
    formattedHireDate: format(parseISO(employee.hire_date), 'MMM dd, yyyy'),
    formattedBirthDate: format(parseISO(employee.birth_date), 'MMM dd, yyyy'),
    age: calculateAge(employee.birth_date),
    yearsOfService: calculateYearsOfService(employee.hire_date),
    statusBadge: getStatusBadge(employee.status),
    departmentBadge: getDepartmentBadge(employee.department)
  }
}

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Calculate years of service
 */
export const calculateYearsOfService = (hireDate) => {
  const today = new Date()
  const hire = new Date(hireDate)
  let years = today.getFullYear() - hire.getFullYear()
  const monthDiff = today.getMonth() - hire.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hire.getDate())) {
    years--
  }
  
  return years
}

/**
 * Get status badge configuration
 */
export const getStatusBadge = (status) => {
  const badges = {
    active: { class: 'bg-green-100 text-green-800', text: 'Active' },
    inactive: { class: 'bg-gray-100 text-gray-800', text: 'Inactive' },
    terminated: { class: 'bg-red-100 text-red-800', text: 'Terminated' },
    on_leave: { class: 'bg-yellow-100 text-yellow-800', text: 'On Leave' },
    suspended: { class: 'bg-orange-100 text-orange-800', text: 'Suspended' }
  }
  
  return badges[status] || badges.inactive
}

/**
 * Get department badge configuration
 */
export const getDepartmentBadge = (department) => {
  const badges = {
    'Human Resources': { class: 'bg-blue-100 text-blue-800', text: 'HR' },
    'Information Technology': { class: 'bg-purple-100 text-purple-800', text: 'IT' },
    'Finance': { class: 'bg-green-100 text-green-800', text: 'Finance' },
    'Administration': { class: 'bg-gray-100 text-gray-800', text: 'Admin' },
    'Medical': { class: 'bg-red-100 text-red-800', text: 'Medical' },
    'Nursing': { class: 'bg-pink-100 text-pink-800', text: 'Nursing' },
    'Pharmacy': { class: 'bg-indigo-100 text-indigo-800', text: 'Pharmacy' },
    'Laboratory': { class: 'bg-cyan-100 text-cyan-800', text: 'Lab' },
    'Radiology': { class: 'bg-teal-100 text-teal-800', text: 'Radiology' },
    'Maintenance': { class: 'bg-yellow-100 text-yellow-800', text: 'Maintenance' },
    'Security': { class: 'bg-orange-100 text-orange-800', text: 'Security' }
  }
  
  return badges[department] || { class: 'bg-gray-100 text-gray-800', text: department }
}

/**
 * Format salary for display
 */
export const formatSalary = (salary, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(salary)
}

/**
 * Calculate payroll deductions
 */
export const calculatePayrollDeductions = (grossSalary, employee) => {
  const deductions = {
    tax: 0,
    social_security: 0,
    health_insurance: 0,
    other: 0,
    total: 0
  }

  // Income Tax (simplified calculation)
  if (grossSalary > 50000) {
    deductions.tax = grossSalary * 0.22 // 22% for higher earners
  } else if (grossSalary > 30000) {
    deductions.tax = grossSalary * 0.15 // 15% for middle earners
  } else {
    deductions.tax = grossSalary * 0.10 // 10% for lower earners
  }

  // Social Security (6.2% up to wage base)
  const socialSecurityWageBase = 160200
  const taxableWage = Math.min(grossSalary, socialSecurityWageBase)
  deductions.social_security = taxableWage * 0.062

  // Health Insurance (fixed amount or percentage)
  deductions.health_insurance = employee.health_insurance_premium || 200

  // Other deductions
  deductions.other = employee.other_deductions || 0

  // Calculate total
  deductions.total = deductions.tax + deductions.social_security + 
                    deductions.health_insurance + deductions.other

  return deductions
}

/**
 * Calculate net pay
 */
export const calculateNetPay = (grossSalary, deductions) => {
  return grossSalary - deductions.total
}

/**
 * Format attendance data
 */
export const formatAttendanceData = (attendance) => {
  return {
    ...attendance,
    formattedDate: format(parseISO(attendance.date), 'MMM dd, yyyy'),
    formattedCheckIn: attendance.check_in ? format(parseISO(attendance.check_in), 'HH:mm') : 'N/A',
    formattedCheckOut: attendance.check_out ? format(parseISO(attendance.check_out), 'HH:mm') : 'N/A',
    totalHours: calculateTotalHours(attendance.check_in, attendance.check_out),
    statusBadge: getAttendanceStatusBadge(attendance.status)
  }
}

/**
 * Calculate total hours worked
 */
export const calculateTotalHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffMs = end - start
  const diffHours = diffMs / (1000 * 60 * 60)
  
  return Math.round(diffHours * 100) / 100 // Round to 2 decimal places
}

/**
 * Get attendance status badge
 */
export const getAttendanceStatusBadge = (status) => {
  const badges = {
    present: { class: 'bg-green-100 text-green-800', text: 'Present' },
    absent: { class: 'bg-red-100 text-red-800', text: 'Absent' },
    late: { class: 'bg-yellow-100 text-yellow-800', text: 'Late' },
    half_day: { class: 'bg-orange-100 text-orange-800', text: 'Half Day' },
    on_leave: { class: 'bg-blue-100 text-blue-800', text: 'On Leave' }
  }
  
  return badges[status] || badges.absent
}

/**
 * Format leave request data
 */
export const formatLeaveRequestData = (leaveRequest) => {
  return {
    ...leaveRequest,
    formattedStartDate: format(parseISO(leaveRequest.start_date), 'MMM dd, yyyy'),
    formattedEndDate: format(parseISO(leaveRequest.end_date), 'MMM dd, yyyy'),
    formattedAppliedDate: format(parseISO(leaveRequest.applied_date), 'MMM dd, yyyy'),
    duration: calculateLeaveDuration(leaveRequest.start_date, leaveRequest.end_date),
    statusBadge: getLeaveStatusBadge(leaveRequest.status),
    typeBadge: getLeaveTypeBadge(leaveRequest.leave_type)
  }
}

/**
 * Calculate leave duration in days
 */
export const calculateLeaveDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return differenceInDays(end, start) + 1
}

/**
 * Get leave status badge
 */
export const getLeaveStatusBadge = (status) => {
  const badges = {
    pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    approved: { class: 'bg-green-100 text-green-800', text: 'Approved' },
    rejected: { class: 'bg-red-100 text-red-800', text: 'Rejected' },
    cancelled: { class: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
  }
  
  return badges[status] || badges.pending
}

/**
 * Get leave type badge
 */
export const getLeaveTypeBadge = (type) => {
  const badges = {
    annual: { class: 'bg-blue-100 text-blue-800', text: 'Annual' },
    sick: { class: 'bg-red-100 text-red-800', text: 'Sick' },
    personal: { class: 'bg-purple-100 text-purple-800', text: 'Personal' },
    maternity: { class: 'bg-pink-100 text-pink-800', text: 'Maternity' },
    paternity: { class: 'bg-cyan-100 text-cyan-800', text: 'Paternity' },
    emergency: { class: 'bg-orange-100 text-orange-800', text: 'Emergency' }
  }
  
  return badges[type] || { class: 'bg-gray-100 text-gray-800', text: type }
}

/**
 * Calculate overtime hours
 */
export const calculateOvertimeHours = (totalHours, regularHours = 8) => {
  return Math.max(0, totalHours - regularHours)
}

/**
 * Calculate overtime pay
 */
export const calculateOvertimePay = (overtimeHours, hourlyRate, overtimeMultiplier = 1.5) => {
  return overtimeHours * hourlyRate * overtimeMultiplier
}

/**
 * Generate employee ID
 */
export const generateEmployeeId = (department, sequence) => {
  const deptCodes = {
    'Human Resources': 'HR',
    'Information Technology': 'IT',
    'Finance': 'FN',
    'Administration': 'AD',
    'Medical': 'MD',
    'Nursing': 'NS',
    'Pharmacy': 'PH',
    'Laboratory': 'LB',
    'Radiology': 'RD',
    'Maintenance': 'MT',
    'Security': 'SC'
  }
  
  const deptCode = deptCodes[department] || 'XX'
  const year = new Date().getFullYear()
  const sequenceStr = sequence.toString().padStart(4, '0')
  
  return `${deptCode}${year}${sequenceStr}`
}

/**
 * Validate employee data
 */
export const validateEmployeeData = (employeeData) => {
  const errors = {}

  if (!employeeData.first_name || employeeData.first_name.trim().length < 2) {
    errors.first_name = 'First name must be at least 2 characters'
  }

  if (!employeeData.last_name || employeeData.last_name.trim().length < 2) {
    errors.last_name = 'Last name must be at least 2 characters'
  }

  if (!employeeData.email || !isValidEmail(employeeData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!employeeData.phone || !isValidPhone(employeeData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!employeeData.department) {
    errors.department = 'Please select a department'
  }

  if (!employeeData.position) {
    errors.position = 'Please enter a position'
  }

  if (!employeeData.hire_date) {
    errors.hire_date = 'Please select a hire date'
  }

  if (!employeeData.salary || employeeData.salary <= 0) {
    errors.salary = 'Please enter a valid salary'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Format performance review data
 */
export const formatPerformanceReviewData = (review) => {
  return {
    ...review,
    formattedReviewDate: format(parseISO(review.review_date), 'MMM dd, yyyy'),
    formattedNextReviewDate: format(parseISO(review.next_review_date), 'MMM dd, yyyy'),
    overallRating: calculateOverallRating(review.ratings),
    ratingBadge: getRatingBadge(calculateOverallRating(review.ratings))
  }
}

/**
 * Calculate overall performance rating
 */
export const calculateOverallRating = (ratings) => {
  const values = Object.values(ratings).filter(rating => typeof rating === 'number')
  if (values.length === 0) return 0
  
  const sum = values.reduce((total, rating) => total + rating, 0)
  return Math.round((sum / values.length) * 10) / 10
}

/**
 * Get rating badge configuration
 */
export const getRatingBadge = (rating) => {
  if (rating >= 4.5) {
    return { class: 'bg-green-100 text-green-800', text: 'Excellent' }
  } else if (rating >= 3.5) {
    return { class: 'bg-blue-100 text-blue-800', text: 'Good' }
  } else if (rating >= 2.5) {
    return { class: 'bg-yellow-100 text-yellow-800', text: 'Average' }
  } else if (rating >= 1.5) {
    return { class: 'bg-orange-100 text-orange-800', text: 'Below Average' }
  } else {
    return { class: 'bg-red-100 text-red-800', text: 'Poor' }
  }
}

/**
 * Get current pay period
 */
export const getCurrentPayPeriod = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get pay period range
 */
export const getPayPeriodRange = (period) => {
  const [year, month] = period.split('-')
  const startDate = startOfMonth(new Date(year, month - 1))
  const endDate = endOfMonth(new Date(year, month - 1))
  
  return {
    start: startDate,
    end: endDate,
    formatted: `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`
  }
}

/**
 * Calculate attendance statistics
 */
export const calculateAttendanceStats = (attendanceRecords) => {
  const stats = {
    totalDays: attendanceRecords.length,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalHours: 0,
    averageHours: 0
  }

  attendanceRecords.forEach(record => {
    switch (record.status) {
      case 'present':
        stats.presentDays++
        break
      case 'absent':
        stats.absentDays++
        break
      case 'late':
        stats.lateDays++
        break
    }

    if (record.check_in && record.check_out) {
      stats.totalHours += calculateTotalHours(record.check_in, record.check_out)
    }
  })

  stats.averageHours = stats.totalDays > 0 ? stats.totalHours / stats.totalDays : 0
  stats.attendanceRate = stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0

  return stats
}

/**
 * Export all helper functions
 */
export default {
  formatEmployeeData,
  calculateAge,
  calculateYearsOfService,
  getStatusBadge,
  getDepartmentBadge,
  formatSalary,
  calculatePayrollDeductions,
  calculateNetPay,
  formatAttendanceData,
  calculateTotalHours,
  getAttendanceStatusBadge,
  formatLeaveRequestData,
  calculateLeaveDuration,
  getLeaveStatusBadge,
  getLeaveTypeBadge,
  calculateOvertimeHours,
  calculateOvertimePay,
  generateEmployeeId,
  validateEmployeeData,
  isValidEmail,
  isValidPhone,
  formatPerformanceReviewData,
  calculateOverallRating,
  getRatingBadge,
  getCurrentPayPeriod,
  getPayPeriodRange,
  calculateAttendanceStats
}
