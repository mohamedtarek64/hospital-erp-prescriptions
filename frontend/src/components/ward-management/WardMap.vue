<template>
  <div class="ward-map">
    <div class="map-header">
      <h3 class="map-title">{{ title }}</h3>
      <div class="map-actions">
        <button @click="refreshMap" class="btn-icon" :disabled="isLoading">
          <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
        </button>
        <button @click="toggleView" class="btn-icon">
          <ArrowsPointingOutIcon class="h-4 w-4" />
        </button>
        <button @click="exportMap" class="btn-icon">
          <ArrowDownTrayIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="map-filters">
      <div class="filter-group">
        <select v-model="selectedWard" @change="onWardChange" class="filter-select">
          <option value="">All Wards</option>
          <option
            v-for="ward in wards"
            :key="ward.id"
            :value="ward.id"
          >
            {{ ward.name }}
          </option>
        </select>
        
        <select v-model="selectedFloor" @change="onFloorChange" class="filter-select">
          <option value="">All Floors</option>
          <option
            v-for="floor in floors"
            :key="floor"
            :value="floor"
          >
            Floor {{ floor }}
          </option>
        </select>
        
        <select v-model="selectedView" @change="onViewChange" class="filter-select">
          <option value="beds">Bed Status</option>
          <option value="occupancy">Occupancy</option>
          <option value="maintenance">Maintenance</option>
          <option value="cleaning">Cleaning Status</option>
        </select>
      </div>
    </div>

    <div class="map-container">
      <div v-if="isLoading" class="map-loading">
        <div class="loading-spinner">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">Loading map...</p>
        </div>
      </div>

      <div v-else-if="error" class="map-error">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="error-text">{{ error }}</p>
        <button @click="refreshMap" class="btn-secondary mt-4">
          Try Again
        </button>
      </div>

      <div v-else class="map-content">
        <div class="map-grid" :style="mapGridStyle">
          <div
            v-for="room in filteredRooms"
            :key="room.id"
            class="room-cell"
            :class="getRoomClasses(room)"
            @click="selectRoom(room)"
            @mouseenter="hoverRoom(room)"
            @mouseleave="unhoverRoom"
          >
            <div class="room-number">{{ room.number }}</div>
            <div class="room-status">
              <div class="status-indicator" :class="getStatusClass(room.status)"></div>
            </div>
            <div v-if="room.patient" class="patient-indicator">
              <UserIcon class="h-3 w-3" />
            </div>
            <div v-if="room.maintenance" class="maintenance-indicator">
              <WrenchScrewdriverIcon class="h-3 w-3" />
            </div>
            <div v-if="room.cleaning" class="cleaning-indicator">
              <SparklesIcon class="h-3 w-3" />
            </div>
          </div>
        </div>

        <!-- Map Legend -->
        <div class="map-legend">
          <h4 class="legend-title">Legend</h4>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-color bg-green-500"></div>
              <span>Available</span>
            </div>
            <div class="legend-item">
              <div class="legend-color bg-red-500"></div>
              <span>Occupied</span>
            </div>
            <div class="legend-item">
              <div class="legend-color bg-yellow-500"></div>
              <span>Maintenance</span>
            </div>
            <div class="legend-item">
              <div class="legend-color bg-blue-500"></div>
              <span>Cleaning</span>
            </div>
            <div class="legend-item">
              <div class="legend-color bg-gray-500"></div>
              <span>Out of Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Room Details Panel -->
    <div v-if="selectedRoom" class="room-details-panel">
      <div class="panel-header">
        <h4 class="panel-title">Room {{ selectedRoom.number }}</h4>
        <button @click="closeRoomDetails" class="btn-close">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      
      <div class="panel-content">
        <div class="room-info">
          <div class="info-item">
            <label>Status:</label>
            <span class="status-badge" :class="getStatusClass(selectedRoom.status)">
              {{ selectedRoom.status }}
            </span>
          </div>
          
          <div class="info-item">
            <label>Type:</label>
            <span>{{ selectedRoom.type }}</span>
          </div>
          
          <div class="info-item">
            <label>Capacity:</label>
            <span>{{ selectedRoom.capacity }} beds</span>
          </div>
          
          <div v-if="selectedRoom.patient" class="info-item">
            <label>Patient:</label>
            <span>{{ selectedRoom.patient.name }}</span>
          </div>
          
          <div v-if="selectedRoom.assigned_staff" class="info-item">
            <label>Assigned Staff:</label>
            <span>{{ selectedRoom.assigned_staff.name }}</span>
          </div>
        </div>
        
        <div class="panel-actions">
          <button @click="viewRoomDetails" class="btn-primary btn-sm">
            View Details
          </button>
          <button @click="editRoom" class="btn-secondary btn-sm">
            Edit Room
          </button>
        </div>
      </div>
    </div>

    <!-- Map Statistics -->
    <div class="map-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Rooms</div>
          <div class="stat-value">{{ mapStats.totalRooms }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Available</div>
          <div class="stat-value text-green-600">{{ mapStats.availableRooms }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Occupied</div>
          <div class="stat-value text-red-600">{{ mapStats.occupiedRooms }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Maintenance</div>
          <div class="stat-value text-yellow-600">{{ mapStats.maintenanceRooms }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Cleaning</div>
          <div class="stat-value text-blue-600">{{ mapStats.cleaningRooms }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useWardMap } from '@/composables/useWardMap'
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'WardMap',
  components: {
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    ArrowDownTrayIcon,
    ExclamationTriangleIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    SparklesIcon,
    XMarkIcon
  },
  props: {
    title: {
      type: String,
      default: 'Ward Map'
    },
    wards: {
      type: Array,
      default: () => []
    },
    rooms: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['room-select', 'room-hover', 'ward-change', 'floor-change', 'view-change', 'refresh', 'export'],
  setup(props, { emit }) {
    return useWardMap(props, { emit })
  }
}
</script>
