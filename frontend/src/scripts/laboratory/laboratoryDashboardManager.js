import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { laboratoryManager } from '@/scripts/laboratory/laboratoryManager'

export const laboratoryDashboardManager = {
  setup() {
    const router = useRouter()
    
    const statusChart = ref(null)
    const trendChart = ref(null)
    
    const stats = ref([])
    const recentOrders = ref([])
    const alerts = ref([])

    const initializeCharts = () => {
      // Status Chart
      const statusCtx = statusChart.value.getContext('2d')
      new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Collected', 'Processing', 'Completed', 'Cancelled'],
          datasets: [{
            data: [12, 19, 8, 25, 3],
            backgroundColor: [
              '#FCD34D', // yellow
              '#3B82F6', // blue
              '#F97316', // orange
              '#10B981', // green
              '#EF4444'  // red
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })

      // Trend Chart
      const trendCtx = trendChart.value.getContext('2d')
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Orders',
            data: [12, 19, 15, 25, 22, 18, 24],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }

    const loadDashboardData = async () => {
      try {
        const data = await laboratoryManager.getDashboardData()
        stats.value = data.stats
        recentOrders.value = data.recentOrders
        alerts.value = data.alerts
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        collected: 'bg-blue-100 text-blue-800',
        processing: 'bg-orange-100 text-orange-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      }
      return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const createNewOrder = () => {
      router.push('/laboratory/orders/new')
    }

    const createNewResult = () => {
      router.push('/laboratory/results/new')
    }

    const navigateToOrders = () => {
      router.push('/laboratory/orders')
    }

    const navigateToResults = () => {
      router.push('/laboratory/results')
    }

    const navigateToSpecimens = () => {
      router.push('/laboratory/specimens')
    }

    const navigateToTests = () => {
      router.push('/laboratory/tests')
    }

    const navigateToReports = () => {
      router.push('/laboratory/reports')
    }

    const navigateToSettings = () => {
      router.push('/laboratory/settings')
    }

    const viewOrder = (id) => {
      router.push(`/laboratory/orders/${id}`)
    }

    const handleAlert = (alert) => {
      // Handle alert actions
      console.log('Handling alert:', alert)
    }

    const initialize = () => {
      loadDashboardData()
      initializeCharts()
    }

    return {
      // Refs
      statusChart,
      trendChart,
      stats,
      recentOrders,
      alerts,
      
      // Methods
      getStatusColor,
      formatDate,
      createNewOrder,
      createNewResult,
      navigateToOrders,
      navigateToResults,
      navigateToSpecimens,
      navigateToTests,
      navigateToReports,
      navigateToSettings,
      viewOrder,
      handleAlert,
      initialize
    }
  }
}
