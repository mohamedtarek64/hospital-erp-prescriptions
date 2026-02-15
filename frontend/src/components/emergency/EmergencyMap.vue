<template>
  <div class="emergency-map">
    <div class="map-header">
      <h3 class="map-title">
        <i class="fas fa-map-marked-alt mr-2 text-blue-500"></i>
        Emergency Map
      </h3>
      <div class="map-controls">
        <button @click="refreshMap" class="btn-refresh" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
        </button>
        <button @click="toggleFullscreen" class="btn-fullscreen">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>

    <div class="map-container" ref="mapContainer">
      <div v-if="loading" class="map-loading">
        <i class="fas fa-spinner fa-spin text-blue-500"></i>
        <span>Loading map...</span>
      </div>

      <div v-else-if="error" class="map-error">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        <span>{{ error }}</span>
        <button @click="refreshMap" class="btn-retry">
          <i class="fas fa-redo mr-2"></i>
          Retry
        </button>
      </div>

      <div v-else class="map-content">
        <!-- Map will be rendered here -->
        <div class="map-placeholder">
          <i class="fas fa-map-marked-alt text-gray-400"></i>
          <p>Interactive map will be displayed here</p>
        </div>

        <!-- Emergency Cases Markers -->
        <div class="emergency-markers">
          <div 
            v-for="emergencyCase in emergencyCases" 
            :key="emergencyCase.id"
            class="emergency-marker"
            :class="`priority-${emergencyCase.priority}`"
            :style="getMarkerPosition(emergencyCase.location)"
            @click="selectEmergencyCase(emergencyCase)"
          >
            <i class="fas fa-exclamation-triangle"></i>
            <div class="marker-tooltip">
              <div class="tooltip-header">
                <span class="case-number">{{ emergencyCase.case_number }}</span>
                <span class="case-priority">{{ emergencyCase.priority.toUpperCase() }}</span>
              </div>
              <div class="tooltip-content">
                <p class="case-type">{{ emergencyCase.emergency_type }}</p>
                <p class="case-time">{{ formatTime(emergencyCase.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ambulance Markers -->
        <div class="ambulance-markers">
          <div 
            v-for="ambulance in ambulances" 
            :key="ambulance.id"
            class="ambulance-marker"
            :class="`status-${ambulance.status}`"
            :style="getMarkerPosition(ambulance.location)"
            @click="selectAmbulance(ambulance)"
          >
            <i class="fas fa-ambulance"></i>
            <div class="marker-tooltip">
              <div class="tooltip-header">
                <span class="vehicle-number">{{ ambulance.vehicle_number }}</span>
                <span class="ambulance-status">{{ ambulance.status.toUpperCase() }}</span>
              </div>
              <div class="tooltip-content">
                <p class="ambulance-type">{{ ambulance.type }}</p>
                <p class="ambulance-capacity">Capacity: {{ ambulance.capacity }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hospital Marker -->
        <div class="hospital-marker" :style="getMarkerPosition(hospitalLocation)">
          <i class="fas fa-hospital"></i>
          <div class="marker-tooltip">
            <div class="tooltip-header">
              <span class="hospital-name">Cleopatra Hospital</span>
            </div>
            <div class="tooltip-content">
              <p class="hospital-address">Main Hospital Building</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Legend -->
    <div class="map-legend">
      <div class="legend-title">Legend</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-marker priority-critical"></div>
          <span>Critical Emergency</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker priority-high"></div>
          <span>High Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker priority-medium"></div>
          <span>Medium Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker priority-low"></div>
          <span>Low Priority</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker status-available"></div>
          <span>Available Ambulance</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker status-busy"></div>
          <span>Busy Ambulance</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker hospital"></div>
          <span>Hospital</span>
        </div>
      </div>
    </div>

    <!-- Selected Item Details -->
    <div v-if="selectedItem" class="selected-details">
      <div class="details-header">
        <h4 class="details-title">
          {{ selectedItem.type === 'emergency' ? 'Emergency Case' : 'Ambulance' }} Details
        </h4>
        <button @click="closeDetails" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="details-content">
        <div v-if="selectedItem.type === 'emergency'" class="emergency-details">
          <div class="detail-item">
            <label>Case Number:</label>
            <span>{{ selectedItem.case_number }}</span>
          </div>
          <div class="detail-item">
            <label>Priority:</label>
            <span class="priority-badge" :class="`priority-${selectedItem.priority}`">
              {{ selectedItem.priority.toUpperCase() }}
            </span>
          </div>
          <div class="detail-item">
            <label>Type:</label>
            <span>{{ selectedItem.emergency_type }}</span>
          </div>
          <div class="detail-item">
            <label>Location:</label>
            <span>{{ selectedItem.location.address }}</span>
          </div>
          <div class="detail-item">
            <label>Time:</label>
            <span>{{ formatTime(selectedItem.created_at) }}</span>
          </div>
        </div>
        <div v-else class="ambulance-details">
          <div class="detail-item">
            <label>Vehicle Number:</label>
            <span>{{ selectedItem.vehicle_number }}</span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span class="status-badge" :class="`status-${selectedItem.status}`">
              {{ selectedItem.status.toUpperCase() }}
            </span>
          </div>
          <div class="detail-item">
            <label>Type:</label>
            <span>{{ selectedItem.type }}</span>
          </div>
          <div class="detail-item">
            <label>Capacity:</label>
            <span>{{ selectedItem.capacity }}</span>
          </div>
          <div class="detail-item">
            <label>Driver:</label>
            <span>{{ getStaffName(selectedItem.driver) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEmergencyMap } from '@/composables/useEmergencyMap'

// Get emergency map functionality
const {
  loading,
  error,
  emergencyCases,
  ambulances,
  hospitalLocation,
  selectedItem,
  mapContainer,
  refreshMap,
  toggleFullscreen,
  selectEmergencyCase,
  selectAmbulance,
  closeDetails,
  getMarkerPosition,
  getStaffName,
  formatTime
} = useEmergencyMap()
</script>

<style scoped>
@import '@/assets/css/emergency/emergency-map.css';
</style>
