<template>
  <div class="equipment-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="fas fa-cogs"></i>
          Equipment & Asset Management
        </h1>
        <p class="dashboard-subtitle">Monitor and manage hospital equipment and assets</p>
      </div>
      <div class="header-actions">
        <button @click="refreshDashboard" class="btn-refresh">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
        <button @click="showAddEquipmentModal = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          Add Equipment
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-cogs"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalEquipment }}</h3>
          <p>Total Equipment</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-tools"></i>
        </div>
        <div class="stat-content">
          <h3>{{ maintenanceDue }}</h3>
          <p>Maintenance Due</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ criticalIssues }}</h3>
          <p>Critical Issues</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>${{ totalValue.toLocaleString() }}</h3>
          <p>Total Asset Value</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <button @click="navigateToAssetTracking" class="action-card">
          <i class="fas fa-search-location"></i>
          <span>Asset Tracking</span>
        </button>
        <button @click="navigateToMaintenance" class="action-card">
          <i class="fas fa-wrench"></i>
          <span>Maintenance</span>
        </button>
        <button @click="navigateToInventory" class="action-card">
          <i class="fas fa-boxes"></i>
          <span>Inventory</span>
        </button>
        <button @click="navigateToReports" class="action-card">
          <i class="fas fa-chart-bar"></i>
          <span>Reports</span>
        </button>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities">
      <h2>Recent Activities</h2>
      <div class="activities-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <h4>{{ activity.title }}</h4>
            <p>{{ activity.description }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Status Overview -->
    <div class="equipment-overview">
      <h2>Equipment Status Overview</h2>
      <div class="overview-grid">
        <div class="overview-card">
          <h3>Operational</h3>
          <div class="status-count operational">{{ operationalCount }}</div>
        </div>
        <div class="overview-card">
          <h3>Maintenance</h3>
          <div class="status-count maintenance">{{ maintenanceCount }}</div>
        </div>
        <div class="overview-card">
          <h3>Out of Service</h3>
          <div class="status-count out-of-service">{{ outOfServiceCount }}</div>
        </div>
        <div class="overview-card">
          <h3>Retired</h3>
          <div class="status-count retired">{{ retiredCount }}</div>
        </div>
      </div>
    </div>

    <!-- Add Equipment Modal -->
    <div v-if="showAddEquipmentModal" class="modal-overlay" @click="showAddEquipmentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Equipment</h3>
          <button @click="showAddEquipmentModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addEquipment">
            <div class="form-group">
              <label>Equipment Name</label>
              <input v-model="newEquipment.name" type="text" required>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="newEquipment.category_id" required>
                <option value="">Select Category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Serial Number</label>
              <input v-model="newEquipment.serial_number" type="text" required>
            </div>
            <div class="form-group">
              <label>Location</label>
              <input v-model="newEquipment.location" type="text" required>
            </div>
            <div class="form-group">
              <label>Purchase Date</label>
              <input v-model="newEquipment.purchase_date" type="date" required>
            </div>
            <div class="form-group">
              <label>Purchase Price</label>
              <input v-model="newEquipment.purchase_price" type="number" step="0.01" required>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddEquipmentModal = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Add Equipment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEquipmentDashboard } from '@/scripts/equipment/equipmentDashboard.js'

export default {
  name: 'EquipmentDashboard',
  setup() {
    return useEquipmentDashboard()
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/equipment-dashboard.css';
</style>
