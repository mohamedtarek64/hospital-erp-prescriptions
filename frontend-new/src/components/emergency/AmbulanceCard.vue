<template>
  <div class="ambulance-card">
    <div class="card-header">
      <div class="vehicle-info">
        <h4 class="vehicle-number">{{ ambulance.vehicle_number }}</h4>
        <span class="ambulance-type">{{ formatAmbulanceType(ambulance.type) }}</span>
      </div>
      <div class="status-badge" :class="getStatusClass(ambulance.status)">
        <i :class="getStatusIcon(ambulance.status)" class="mr-1"></i>
        {{ ambulance.status.toUpperCase() }}
      </div>
    </div>

    <div class="card-content">
      <div class="ambulance-details">
        <div class="detail-row">
          <div class="detail-item">
            <i class="fas fa-user text-blue-500"></i>
            <div class="detail-content">
              <span class="detail-label">Driver</span>
              <span class="detail-value">{{ getStaffName(ambulance.driver) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-item">
            <i class="fas fa-user-md text-green-500"></i>
            <div class="detail-content">
              <span class="detail-label">Paramedic</span>
              <span class="detail-value">{{ getStaffName(ambulance.paramedic) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-item">
            <i class="fas fa-users text-purple-500"></i>
            <div class="detail-content">
              <span class="detail-label">Capacity</span>
              <span class="detail-value">{{ ambulance.capacity }} patients</span>
            </div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-item">
            <i class="fas fa-map-marker-alt text-red-500"></i>
            <div class="detail-content">
              <span class="detail-label">Location</span>
              <span class="detail-value">{{ getLocationText(ambulance.location) }}</span>
            </div>
          </div>
        </div>

        <div v-if="ambulance.current_case" class="detail-row">
          <div class="detail-item">
            <i class="fas fa-ambulance text-orange-500"></i>
            <div class="detail-content">
              <span class="detail-label">Current Case</span>
              <span class="detail-value">{{ ambulance.current_case.case_number }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="equipment-list">
        <h5 class="equipment-title">
          <i class="fas fa-tools mr-2"></i>
          Equipment
        </h5>
        <div class="equipment-items">
          <span 
            v-for="equipment in ambulance.equipment" 
            :key="equipment"
            class="equipment-tag"
          >
            {{ equipment }}
          </span>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button 
        @click="viewDetails"
        class="btn-action btn-view"
        title="View Details"
      >
        <i class="fas fa-eye"></i>
        View
      </button>
      
      <button 
        v-if="ambulance.status === 'available'"
        @click="dispatchAmbulance"
        class="btn-action btn-dispatch"
        title="Dispatch Ambulance"
      >
        <i class="fas fa-paper-plane"></i>
        Dispatch
      </button>
      
      <button 
        @click="updateLocation"
        class="btn-action btn-location"
        title="Update Location"
      >
        <i class="fas fa-map-marker-alt"></i>
        Location
      </button>
      
      <button 
        @click="maintenanceRequest"
        class="btn-action btn-maintenance"
        title="Request Maintenance"
      >
        <i class="fas fa-wrench"></i>
        Maintenance
      </button>
    </div>

    <!-- Status Indicator -->
    <div class="status-indicator" :class="getStatusClass(ambulance.status)"></div>
  </div>
</template>

<script setup>
import { useAmbulanceCard } from '@/composables/useAmbulanceCard'

/**
 * Component props
 */
const props = defineProps({
  ambulance: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * Component emits
 */
const emit = defineEmits(['view', 'dispatch', 'update-location', 'maintenance'])

// Get ambulance card functionality
const {
  formatAmbulanceType,
  getStatusClass,
  getStatusIcon,
  getStaffName,
  getLocationText,
  viewDetails,
  dispatchAmbulance,
  updateLocation,
  maintenanceRequest
} = useAmbulanceCard(props, emit)
</script>

<style scoped>
@import '@/assets/css/emergency/ambulance-card.css';
</style>
