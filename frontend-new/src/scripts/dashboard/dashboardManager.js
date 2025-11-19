/**
 * Dashboard Manager
 * Handles dashboard data and functionality
 */

import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { usePatientsStore } from '@/stores/patients'

export default class DashboardManager {
  constructor(router) {
    this.router = router
    this.authStore = useAuthStore()
    this.dashboardStore = useDashboardStore()
    this.patientsStore = usePatientsStore()
    
    this.dashboardData = {
      stats: {
        totalPatients: 0,
        todayAppointments: 0,
        activeDoctors: 0,
        monthlyRevenue: 0
      },
      todaysAppointments: [],
      recentActivities: []
    }
  }

  getReactiveData() {
    return {
      user: this.authStore.user,
      loading: this.dashboardStore.loading || false
    }
  }

  getMethods() {
    return {
      getRoleName: this.getRoleName.bind(this),
      getUserDepartmentInfo: this.getUserDepartmentInfo.bind(this),
      getDashboardStats: this.getDashboardStats.bind(this),
      navigateTo: this.navigateTo.bind(this),
      getTodaysAppointments: this.getTodaysAppointments.bind(this),
      getRecentActivities: this.getRecentActivities.bind(this),
      getStatusText: this.getStatusText.bind(this),
      getActivityIcon: this.getActivityIcon.bind(this)
    }
  }

  getRoleName(role) {
    const roles = {
      'admin': 'مدير النظام',
      'doctor': 'طبيب',
      'nurse': 'ممرض',
      'receptionist': 'موظف استقبال',
      'pharmacist': 'صيدلي',
      'lab_technician': 'فني مختبر'
    }
    return roles[role] || 'مستخدم'
  }

  getUserDepartmentInfo() {
    if (this.dashboardData.user?.department) {
      return `في قسم ${this.dashboardData.user.department}`
    }
    return ''
  }

  getDashboardStats() {
    return this.dashboardStore.stats || this.dashboardData.stats
  }

  navigateTo(path) {
    this.router.push(path)
  }

  getTodaysAppointments() {
    return this.dashboardStore.todaysAppointments || this.dashboardData.todaysAppointments
  }

  getRecentActivities() {
    return this.dashboardStore.recentActivities || this.dashboardData.recentActivities
  }

  getStatusText(status) {
    const statuses = {
      'confirmed': 'مؤكد',
      'pending': 'في الانتظار',
      'cancelled': 'ملغي',
      'completed': 'مكتمل'
    }
    return statuses[status] || status
  }

  getActivityIcon(type) {
    const icons = {
      'appointment': 'fas fa-calendar-check',
      'medical_record': 'fas fa-file-medical',
      'prescription': 'fas fa-prescription-bottle',
      'lab': 'fas fa-flask',
      'patient': 'fas fa-user'
    }
    return icons[type] || 'fas fa-info-circle'
  }

  async onMounted() {
    try {
      // Load dashboard data from API
      await this.dashboardStore.fetchDashboardStats()
      await this.dashboardStore.fetchTodaysAppointments()
      await this.dashboardStore.fetchRecentActivities()
      console.log('Dashboard manager mounted')
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }
}