<template>
  <div class="system-overview">
    <div class="overview-header">
      <h3 class="overview-title">
        <i class="fas fa-server mr-2 text-blue-500"></i>
        System Overview
      </h3>
      <button @click="refreshData" class="btn-refresh" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
      </button>
    </div>

    <div class="overview-grid">
      <!-- Server Status -->
      <div class="overview-card">
        <div class="card-header">
          <div class="card-icon bg-green-100">
            <i class="fas fa-server text-green-600"></i>
          </div>
          <div class="card-title">Server Status</div>
        </div>
        <div class="card-content">
          <div class="status-indicator">
            <span class="status-dot bg-green-500"></span>
            <span class="status-text">Online</span>
          </div>
          <div class="server-details">
            <div class="detail-item">
              <span class="detail-label">PHP Version:</span>
              <span class="detail-value">{{ systemData?.server?.php_version || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Laravel Version:</span>
              <span class="detail-value">{{ systemData?.server?.laravel_version || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Memory Limit:</span>
              <span class="detail-value">{{ systemData?.server?.memory_limit || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Database Status -->
      <div class="overview-card">
        <div class="card-header">
          <div class="card-icon bg-blue-100">
            <i class="fas fa-database text-blue-600"></i>
          </div>
          <div class="card-title">Database</div>
        </div>
        <div class="card-content">
          <div class="status-indicator">
            <span class="status-dot bg-green-500"></span>
            <span class="status-text">Connected</span>
          </div>
          <div class="server-details">
            <div class="detail-item">
              <span class="detail-label">Driver:</span>
              <span class="detail-value">{{ systemData?.database?.driver || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Database:</span>
              <span class="detail-value">{{ systemData?.database?.connection || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Size:</span>
              <span class="detail-value">{{ systemData?.database?.size || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Storage Status -->
      <div class="overview-card">
        <div class="card-header">
          <div class="card-icon bg-purple-100">
            <i class="fas fa-hdd text-purple-600"></i>
          </div>
          <div class="card-title">Storage</div>
        </div>
        <div class="card-content">
          <div class="status-indicator">
            <span class="status-dot bg-green-500"></span>
            <span class="status-text">Available</span>
          </div>
          <div class="storage-details">
            <div class="storage-bar">
              <div class="storage-used" :style="{ width: storagePercentage + '%' }"></div>
            </div>
            <div class="storage-info">
              <div class="detail-item">
                <span class="detail-label">Used:</span>
                <span class="detail-value">{{ formatBytes(systemData?.storage?.used_space) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Free:</span>
                <span class="detail-value">{{ formatBytes(systemData?.storage?.free_space) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cache Status -->
      <div class="overview-card">
        <div class="card-header">
          <div class="card-icon bg-orange-100">
            <i class="fas fa-memory text-orange-600"></i>
          </div>
          <div class="card-title">Cache</div>
        </div>
        <div class="card-content">
          <div class="status-indicator">
            <span 
              class="status-dot"
              :class="getCacheStatusClass(systemData?.cache?.status)"
            ></span>
            <span class="status-text">{{ systemData?.cache?.status || 'Unknown' }}</span>
          </div>
          <div class="server-details">
            <div class="detail-item">
              <span class="detail-label">Driver:</span>
              <span class="detail-value">{{ systemData?.cache?.driver || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Max Execution:</span>
              <span class="detail-value">{{ systemData?.server?.max_execution_time || 'N/A' }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <h4 class="error-title">Error Loading System Data</h4>
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
import { useSystemOverview } from '@/scripts/admin/systemOverview'

// Get system overview functionality
const {
  loading,
  error,
  systemData,
  storagePercentage,
  refreshData,
  formatBytes,
  getCacheStatusClass
} = useSystemOverview()
</script>

<style scoped>
@import '@/assets/css/admin/systemOverview.css';
</style>
