<template>
  <div class="pharmacy-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
      <p class="text-gray-600">Manage medicines, inventory, and prescriptions</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-pills text-blue-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalMedicines }}</h3>
          <p class="stat-label">Total Medicines</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle text-yellow-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.lowStockItems }}</h3>
          <p class="stat-label">Low Stock Items</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-times text-red-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.expiringSoon }}</h3>
          <p class="stat-label">Expiring Soon</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-shopping-cart text-green-500"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.pendingOrders }}</h3>
          <p class="stat-label">Pending Orders</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2 class="section-title">Quick Actions</h2>
      <div class="actions-grid">
        <button @click="navigateTo('/pharmacy/medicines')" class="action-btn">
          <i class="fas fa-pills"></i>
          <span>Manage Medicines</span>
        </button>
        <button @click="navigateTo('/pharmacy/inventory')" class="action-btn">
          <i class="fas fa-boxes"></i>
          <span>Inventory Management</span>
        </button>
        <button @click="navigateTo('/pharmacy/purchase-orders')" class="action-btn">
          <i class="fas fa-shopping-cart"></i>
          <span>Purchase Orders</span>
        </button>
        <button @click="navigateTo('/pharmacy/suppliers')" class="action-btn">
          <i class="fas fa-truck"></i>
          <span>Suppliers</span>
        </button>
        <button @click="navigateTo('/pharmacy/prescriptions')" class="action-btn">
          <i class="fas fa-prescription"></i>
          <span>Prescription Dispensing</span>
        </button>
        <button @click="navigateTo('/pharmacy/analytics')" class="action-btn">
          <i class="fas fa-chart-bar"></i>
          <span>Analytics</span>
        </button>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities">
      <h2 class="section-title">Recent Activities</h2>
      <div class="activities-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-description">{{ activity.description }}</p>
            <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Low Stock Alerts -->
    <div class="alerts-section">
      <h2 class="section-title">Low Stock Alerts</h2>
      <div class="alerts-list">
        <div v-for="alert in lowStockAlerts" :key="alert.id" class="alert-item">
          <div class="alert-icon">
            <i class="fas fa-exclamation-triangle text-yellow-500"></i>
          </div>
          <div class="alert-content">
            <h4 class="alert-title">{{ alert.medicine_name }}</h4>
            <p class="alert-description">Only {{ alert.current_stock }} units remaining</p>
          </div>
          <button @click="reorderMedicine(alert.id)" class="reorder-btn">
            Reorder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePharmacyStore } from '@/stores/pharmacy'
import { useInventoryStore } from '@/stores/inventory'

export default {
  name: 'PharmacyDashboard',
  setup() {
    const router = useRouter()
    const pharmacyStore = usePharmacyStore()
    const inventoryStore = useInventoryStore()

    const stats = ref({
      totalMedicines: 0,
      lowStockItems: 0,
      expiringSoon: 0,
      pendingOrders: 0
    })

    const recentActivities = ref([])
    const lowStockAlerts = ref([])

    const loadDashboardData = async () => {
      try {
        await Promise.all([
          pharmacyStore.fetchDashboardStats(),
          pharmacyStore.fetchRecentActivities(),
          inventoryStore.fetchLowStockAlerts()
        ])

        stats.value = pharmacyStore.dashboardStats
        recentActivities.value = pharmacyStore.recentActivities
        lowStockAlerts.value = inventoryStore.lowStockAlerts
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const getActivityIcon = (type) => {
      const icons = {
        'medicine_added': 'fas fa-plus-circle text-green-500',
        'stock_updated': 'fas fa-edit text-blue-500',
        'order_created': 'fas fa-shopping-cart text-purple-500',
        'prescription_dispensed': 'fas fa-prescription text-orange-500'
      }
      return icons[type] || 'fas fa-info-circle text-gray-500'
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    const reorderMedicine = async (medicineId) => {
      try {
        await inventoryStore.createReorderRequest(medicineId)
        // Show success message
      } catch (error) {
        console.error('Error creating reorder request:', error)
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      stats,
      recentActivities,
      lowStockAlerts,
      navigateTo,
      getActivityIcon,
      formatTime,
      reorderMedicine
    }
  }
}
</script>

<style scoped>
/* Styles are imported from pharmacy.css */
</style>
