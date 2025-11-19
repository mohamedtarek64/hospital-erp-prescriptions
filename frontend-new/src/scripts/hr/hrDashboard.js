import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHRStore } from '@/stores/hr'
import { formatDistanceToNow } from 'date-fns'

/**
 * Composable for HR Dashboard functionality
 * Handles dashboard statistics, charts, and recent activities
 */
export function useHRDashboard() {
  // Router and stores
  const router = useRouter()
  const hrStore = useHRStore()

  // Reactive data
  const stats = ref({
    total_employees: 0,
    active_employees: 0,
    pending_leave_requests: 0,
    attendance_today: 0
  })

  const recentActivities = ref([])
  const departmentChart = ref(null)
  const attendanceChart = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Methods
  const loadDashboardData = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await hrStore.getDashboardStats()
      stats.value = data

      // Load recent activities
      recentActivities.value = [
        {
          id: 1,
          icon: 'fas fa-user-plus',
          color: '#10B981',
          description: 'New employee John Doe joined',
          created_at: new Date()
        },
        {
          id: 2,
          icon: 'fas fa-calendar-times',
          color: '#F59E0B',
          description: 'Leave request from Jane Smith',
          created_at: new Date(Date.now() - 3600000)
        },
        {
          id: 3,
          icon: 'fas fa-money-bill-wave',
          color: '#3B82F6',
          description: 'Payroll processed for December',
          created_at: new Date(Date.now() - 7200000)
        },
        {
          id: 4,
          icon: 'fas fa-user-check',
          color: '#8B5CF6',
          description: 'Performance review completed for Mike Johnson',
          created_at: new Date(Date.now() - 10800000)
        },
        {
          id: 5,
          icon: 'fas fa-clock',
          color: '#EF4444',
          description: 'Late attendance marked for Sarah Wilson',
          created_at: new Date(Date.now() - 14400000)
        }
      ]
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      error.value = 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const navigateTo = (path) => {
    router.push(path)
  }

  const refreshData = () => {
    loadDashboardData()
  }

  // Lifecycle
  onMounted(() => {
    loadDashboardData()
  })

  return {
    // State
    stats,
    recentActivities,
    departmentChart,
    attendanceChart,
    loading,
    error,

    // Methods
    loadDashboardData,
    formatTime,
    navigateTo,
    refreshData
  }
}
