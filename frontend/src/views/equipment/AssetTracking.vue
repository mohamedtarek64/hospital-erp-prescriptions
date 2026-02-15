<template>
  <div class="asset-tracking">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-search-location"></i>
          Asset Tracking
        </h1>
        <p class="page-subtitle">Track and locate hospital assets in real-time</p>
      </div>
      <div class="header-actions">
        <button @click="refreshAssets" class="btn-refresh">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
        <button @click="exportAssets" class="btn-secondary">
          <i class="fas fa-download"></i>
          Export
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          @input="searchAssets"
          type="text" 
          placeholder="Search assets by name, serial number, or location..."
        >
      </div>
      <div class="filters">
        <select v-model="selectedCategory" @change="filterAssets">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <select v-model="selectedStatus" @change="filterAssets">
          <option value="">All Status</option>
          <option value="operational">Operational</option>
          <option value="maintenance">Maintenance</option>
          <option value="out_of_service">Out of Service</option>
          <option value="retired">Retired</option>
        </select>
        <select v-model="selectedLocation" @change="filterAssets">
          <option value="">All Locations</option>
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>
      </div>
    </div>

    <!-- Asset Map View Toggle -->
    <div class="view-toggle">
      <button 
        @click="viewMode = 'list'" 
        :class="{ active: viewMode === 'list' }"
        class="toggle-btn"
      >
        <i class="fas fa-list"></i>
        List View
      </button>
      <button 
        @click="viewMode = 'map'" 
        :class="{ active: viewMode === 'map' }"
        class="toggle-btn"
      >
        <i class="fas fa-map"></i>
        Map View
      </button>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="assets-list">
      <div class="list-header">
        <h2>Assets ({{ filteredAssets.length }})</h2>
        <div class="sort-options">
          <select v-model="sortBy" @change="sortAssets">
            <option value="name">Sort by Name</option>
            <option value="location">Sort by Location</option>
            <option value="status">Sort by Status</option>
            <option value="purchase_date">Sort by Purchase Date</option>
          </select>
        </div>
      </div>
      
      <div class="assets-grid">
        <div v-for="asset in filteredAssets" :key="asset.id" class="asset-card">
          <div class="asset-header">
            <h3>{{ asset.name }}</h3>
            <span :class="['status-badge', asset.status]">{{ asset.status }}</span>
          </div>
          <div class="asset-details">
            <div class="detail-item">
              <i class="fas fa-barcode"></i>
              <span>{{ asset.serial_number }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ asset.location }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-tag"></i>
              <span>{{ asset.category?.name }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(asset.purchase_date) }}</span>
            </div>
          </div>
          <div class="asset-actions">
            <button @click="viewAssetDetails(asset)" class="btn-sm btn-primary">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button @click="editAsset(asset)" class="btn-sm btn-secondary">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="trackAsset(asset)" class="btn-sm btn-info">
              <i class="fas fa-route"></i>
              Track
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map View -->
    <div v-if="viewMode === 'map'" class="map-container">
      <div class="map-header">
        <h2>Asset Locations</h2>
        <div class="map-legend">
          <div class="legend-item">
            <div class="legend-color operational"></div>
            <span>Operational</span>
          </div>
          <div class="legend-item">
            <div class="legend-color maintenance"></div>
            <span>Maintenance</span>
          </div>
          <div class="legend-item">
            <div class="legend-color out-of-service"></div>
            <span>Out of Service</span>
          </div>
        </div>
      </div>
      <div class="map-placeholder">
        <i class="fas fa-map"></i>
        <p>Interactive map view would be implemented here</p>
        <p>Showing {{ filteredAssets.length }} assets</p>
      </div>
    </div>

    <!-- Asset Details Modal -->
    <div v-if="selectedAsset" class="modal-overlay" @click="selectedAsset = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedAsset.name }} - Details</h3>
          <button @click="selectedAsset = null" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="asset-details-grid">
            <div class="detail-section">
              <h4>Basic Information</h4>
              <div class="detail-row">
                <label>Serial Number:</label>
                <span>{{ selectedAsset.serial_number }}</span>
              </div>
              <div class="detail-row">
                <label>Category:</label>
                <span>{{ selectedAsset.category?.name }}</span>
              </div>
              <div class="detail-row">
                <label>Status:</label>
                <span :class="['status-badge', selectedAsset.status]">{{ selectedAsset.status }}</span>
              </div>
              <div class="detail-row">
                <label>Location:</label>
                <span>{{ selectedAsset.location }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>Financial Information</h4>
              <div class="detail-row">
                <label>Purchase Date:</label>
                <span>{{ formatDate(selectedAsset.purchase_date) }}</span>
              </div>
              <div class="detail-row">
                <label>Purchase Price:</label>
                <span>${{ selectedAsset.purchase_price?.toLocaleString() }}</span>
              </div>
              <div class="detail-row">
                <label>Current Value:</label>
                <span>${{ selectedAsset.current_value?.toLocaleString() }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>Maintenance Information</h4>
              <div class="detail-row">
                <label>Last Maintenance:</label>
                <span>{{ selectedAsset.last_maintenance ? formatDate(selectedAsset.last_maintenance) : 'Never' }}</span>
              </div>
              <div class="detail-row">
                <label>Next Maintenance:</label>
                <span>{{ selectedAsset.next_maintenance ? formatDate(selectedAsset.next_maintenance) : 'Not scheduled' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editAsset(selectedAsset)" class="btn-primary">
            <i class="fas fa-edit"></i>
            Edit Asset
          </button>
          <button @click="selectedAsset = null" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAssetTracking } from '@/scripts/equipment/assetTracking.js'

export default {
  name: 'AssetTracking',
  setup() {
    return useAssetTracking()
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/asset-tracking.css';
</style>
