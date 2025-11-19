<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="fas fa-cogs mr-3 text-blue-600"></i>
          System Administration
        </h1>
        <p class="dashboard-subtitle">Monitor and manage your hospital management system</p>
      </div>
      <div class="header-actions">
        <button 
          @click="refreshData"
          :disabled="loading"
          class="btn-refresh"
        >
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- System Overview Cards -->
    <div class="overview-grid">
      <div class="overview-card">
        <div class="card-icon bg-blue-100">
          <i class="fas fa-users text-blue-600"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">Users</h3>
          <div class="card-stats">
            <span class="stat-number">{{ statistics?.users?.total || 0 }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="card-details">
            <span class="detail-item">
              <i class="fas fa-check-circle text-green-500"></i>
              {{ statistics?.users?.active || 0 }} Active
            </span>
            <span class="detail-item">
              <i class="fas fa-plus-circle text-blue-500"></i>
              {{ statistics?.users?.new_this_month || 0 }} This Month
            </span>
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="card-icon bg-purple-100">
          <i class="fas fa-shield-alt text-purple-600"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">Roles & Permissions</h3>
          <div class="card-stats">
            <span class="stat-number">{{ statistics?.roles?.total || 0 }}</span>
            <span class="stat-label">Roles</span>
          </div>
          <div class="card-details">
            <span class="detail-item">
              <i class="fas fa-key text-purple-500"></i>
              {{ statistics?.roles?.permissions || 0 }} Permissions
            </span>
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="card-icon bg-green-100">
          <i class="fas fa-database text-green-600"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">System</h3>
          <div class="card-stats">
            <span class="stat-number">{{ statistics?.system?.settings || 0 }}</span>
            <span class="stat-label">Settings</span>
          </div>
          <div class="card-details">
            <span class="detail-item">
              <i class="fas fa-file-alt text-green-500"></i>
              {{ statistics?.system?.logs_today || 0 }} Logs Today
            </span>
            <span class="detail-item">
              <i class="fas fa-archive text-blue-500"></i>
              {{ statistics?.system?.backups || 0 }} Backups
            </span>
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="card-icon bg-orange-100">
          <i class="fas fa-chart-line text-orange-600"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">Activity</h3>
          <div class="card-stats">
            <span class="stat-number">{{ statistics?.activity?.total_activities || 0 }}</span>
            <span class="stat-label">This Week</span>
          </div>
          <div class="card-details">
            <span class="detail-item">
              <i class="fas fa-user text-orange-500"></i>
              {{ statistics?.activity?.unique_users || 0 }} Active Users
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- System Health -->
    <div class="system-health-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-heartbeat mr-2 text-red-500"></i>
          System Health
        </h2>
      </div>
      <div class="health-grid">
        <div class="health-card">
          <div class="health-icon bg-green-100">
            <i class="fas fa-server text-green-600"></i>
          </div>
          <div class="health-content">
            <h4 class="health-title">Server Status</h4>
            <div class="health-status">
              <span class="status-indicator bg-green-500"></span>
              <span class="status-text">Online</span>
            </div>
            <p class="health-details">
              PHP {{ systemOverview?.server?.php_version }}<br>
              Laravel {{ systemOverview?.server?.laravel_version }}
            </p>
          </div>
        </div>

        <div class="health-card">
          <div class="health-icon bg-blue-100">
            <i class="fas fa-database text-blue-600"></i>
          </div>
          <div class="health-content">
            <h4 class="health-title">Database</h4>
            <div class="health-status">
              <span class="status-indicator bg-green-500"></span>
              <span class="status-text">Connected</span>
            </div>
            <p class="health-details">
              {{ systemOverview?.database?.driver }}<br>
              Size: {{ systemOverview?.database?.size }}
            </p>
          </div>
        </div>

        <div class="health-card">
          <div class="health-icon bg-purple-100">
            <i class="fas fa-hdd text-purple-600"></i>
          </div>
          <div class="health-content">
            <h4 class="health-title">Storage</h4>
            <div class="health-status">
              <span class="status-indicator bg-green-500"></span>
              <span class="status-text">Available</span>
            </div>
            <p class="health-details">
              Free: {{ formatBytes(systemOverview?.storage?.free_space) }}<br>
              Used: {{ formatBytes(systemOverview?.storage?.used_space) }}
            </p>
          </div>
        </div>

        <div class="health-card">
          <div class="health-icon bg-orange-100">
            <i class="fas fa-memory text-orange-600"></i>
          </div>
          <div class="health-content">
            <h4 class="health-title">Cache</h4>
            <div class="health-status">
              <span class="status-indicator bg-green-500"></span>
              <span class="status-text">{{ systemOverview?.cache?.status }}</span>
            </div>
            <p class="health-details">
              Driver: {{ systemOverview?.cache?.driver }}<br>
              Memory: {{ systemOverview?.server?.memory_limit }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-bolt mr-2 text-yellow-500"></i>
          Quick Actions
        </h2>
      </div>
      <div class="actions-grid">
        <button @click="navigateToUsers" class="action-card">
          <div class="action-icon bg-blue-100">
            <i class="fas fa-users text-blue-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Manage Users</h4>
            <p class="action-description">Add, edit, or remove user accounts</p>
          </div>
        </button>

        <button @click="navigateToRoles" class="action-card">
          <div class="action-icon bg-purple-100">
            <i class="fas fa-shield-alt text-purple-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Roles & Permissions</h4>
            <p class="action-description">Configure user roles and access rights</p>
          </div>
        </button>

        <button @click="navigateToSettings" class="action-card">
          <div class="action-icon bg-green-100">
            <i class="fas fa-cog text-green-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">System Settings</h4>
            <p class="action-description">Configure system preferences</p>
          </div>
        </button>

        <button @click="navigateToBackups" class="action-card">
          <div class="action-icon bg-orange-100">
            <i class="fas fa-archive text-orange-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Backup & Restore</h4>
            <p class="action-description">Manage system backups</p>
          </div>
        </button>

        <button @click="navigateToLogs" class="action-card">
          <div class="action-icon bg-red-100">
            <i class="fas fa-file-alt text-red-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">System Logs</h4>
            <p class="action-description">View system activity logs</p>
          </div>
        </button>

        <button @click="createBackup" class="action-card">
          <div class="action-icon bg-indigo-100">
            <i class="fas fa-download text-indigo-600"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Create Backup</h4>
            <p class="action-description">Create a new system backup</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-clock mr-2 text-blue-500"></i>
          Recent Activity
        </h2>
        <button @click="navigateToLogs" class="btn-view-all">
          View All
          <i class="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
      <div class="activity-list">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin text-blue-500"></i>
          <span>Loading activity...</span>
        </div>
        <div v-else-if="recentActivity.length === 0" class="empty-state">
          <i class="fas fa-inbox text-gray-400"></i>
          <span>No recent activity</span>
        </div>
        <div v-else class="activity-items">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <i :class="getActivityIcon(activity.action)" class="text-sm"></i>
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.user?.name || 'System' }}</span>
                <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <h3 class="error-title">Error Loading Dashboard</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="refreshData" class="btn-retry">
          <i class="fas fa-redo mr-2"></i>
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useAdminDashboard } from '@/scripts/admin/adminDashboard'

// Get router instance
  // const router = useRouter()

// Get admin dashboard functionality
const {
  loading,
  error,
  statistics,
  systemOverview,
  recentActivity,
  // loadDashboardData,
  // loadSystemOverview,
  // loadRecentActivity,
  refreshData,
  createBackup,
  formatBytes,
  formatTime,
  getActivityIcon,
  navigateToUsers,
  navigateToRoles,
  navigateToSettings,
  navigateToBackups,
  navigateToLogs,
  onMountedHandler
} = useAdminDashboard()

// Lifecycle
onMounted(() => {
  onMountedHandler()
})
</script>

<style scoped>
@import '@/assets/css/admin/adminDashboard.css';
</style>
