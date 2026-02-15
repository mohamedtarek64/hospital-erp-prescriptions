<template>
  <div class="ambulance-dispatch">
    <!-- Header -->
    <div class="dispatch-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-truck"></i>
          Ambulance Dispatch
        </h1>
        <p class="page-subtitle">Manage ambulance fleet and dispatch operations</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddAmbulanceForm = true">
          <i class="fas fa-plus"></i>
          Add Ambulance
        </button>
        <button class="btn btn-secondary" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Fleet Status -->
    <div class="fleet-status-section">
      <h2 class="section-title">
        <i class="fas fa-chart-pie"></i>
        Fleet Status
      </h2>
      <div class="fleet-stats-grid">
        <div class="fleet-stat-card">
          <div class="stat-icon available">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ fleetStatus.available }}</div>
            <div class="stat-label">Available</div>
          </div>
        </div>
        <div class="fleet-stat-card">
          <div class="stat-icon dispatched">
            <i class="fas fa-paper-plane"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ fleetStatus.dispatched }}</div>
            <div class="stat-label">Dispatched</div>
          </div>
        </div>
        <div class="fleet-stat-card">
          <div class="stat-icon on-scene">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ fleetStatus.on_scene }}</div>
            <div class="stat-label">On Scene</div>
          </div>
        </div>
        <div class="fleet-stat-card">
          <div class="stat-icon transporting">
            <i class="fas fa-ambulance"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ fleetStatus.transporting }}</div>
            <div class="stat-label">Transporting</div>
          </div>
        </div>
        <div class="fleet-stat-card">
          <div class="stat-icon maintenance">
            <i class="fas fa-wrench"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ fleetStatus.maintenance }}</div>
            <div class="stat-label">Maintenance</div>
          </div>
        </div>
        <div class="fleet-stat-card">
          <div class="stat-icon out-of-service">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ fleetStatus.out_of_service }}</div>
            <div class="stat-label">Out of Service</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="dispatched">Dispatched</option>
            <option value="on_scene">On Scene</option>
            <option value="transporting">Transporting</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type</label>
          <select v-model="filters.type" @change="applyFilters">
            <option value="">All Types</option>
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="critical_care">Critical Care</option>
            <option value="neonatal">Neonatal</option>
            <option value="psychiatric">Psychiatric</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search</label>
          <input 
            type="text" 
            v-model="filters.search" 
            @input="applyFilters"
            placeholder="Search by vehicle number..."
          >
        </div>
      </div>
    </div>

    <!-- Ambulances Grid -->
    <div class="ambulances-section">
      <div class="ambulances-grid">
        <div 
          v-for="ambulance in ambulances" 
          :key="ambulance.id"
          class="ambulance-card"
          :class="`status-${ambulance.status}`"
        >
          <div class="ambulance-header">
            <div class="vehicle-info">
              <span class="vehicle-number">{{ ambulance.vehicle_number }}</span>
              <span class="ambulance-type">{{ ambulance.type.replace('_', ' ').toUpperCase() }}</span>
            </div>
            <div class="status-indicator">
              <span class="status-badge" :class="`status-${ambulance.status}`">
                {{ ambulance.status.replace('_', ' ').toUpperCase() }}
              </span>
            </div>
          </div>

          <div class="ambulance-content">
            <div class="ambulance-details">
              <div class="detail-row">
                <i class="fas fa-users"></i>
                <span>Capacity: {{ ambulance.capacity }}</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-user"></i>
                <span>Driver: {{ getStaffName(ambulance.driver) }}</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-user-md"></i>
                <span>Paramedic: {{ getStaffName(ambulance.paramedic) }}</span>
              </div>
              <div v-if="ambulance.location" class="detail-row">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ ambulance.location.address }}</span>
              </div>
            </div>

            <div class="ambulance-equipment">
              <h4>Equipment</h4>
              <div class="equipment-list">
                <span 
                  v-for="equipment in ambulance.equipment" 
                  :key="equipment"
                  class="equipment-item"
                >
                  {{ equipment }}
                </span>
              </div>
            </div>
          </div>

          <div class="ambulance-actions">
            <button class="btn btn-sm btn-primary" @click="viewAmbulance(ambulance.id)">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button class="btn btn-sm btn-secondary" @click="editAmbulance(ambulance.id)">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button 
              v-if="ambulance.status === 'available'"
              class="btn btn-sm btn-success" 
              @click="dispatchAmbulance(ambulance.id)"
            >
              <i class="fas fa-paper-plane"></i>
              Dispatch
            </button>
            <button 
              v-if="ambulance.needs_maintenance"
              class="btn btn-sm btn-warning" 
              @click="scheduleMaintenance(ambulance.id)"
            >
              <i class="fas fa-wrench"></i>
              Maintenance
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination">
        <button 
          class="pagination-btn"
          :disabled="pagination.current_page === 1"
          @click="changePage(pagination.current_page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span 
          v-for="page in getPageNumbers()" 
          :key="page"
          class="pagination-page"
          :class="{ 'pagination-page--active': page === pagination.current_page }"
          @click="changePage(page)"
        >
          {{ page }}
        </span>
        <button 
          class="pagination-btn"
          :disabled="pagination.current_page === pagination.last_page"
          @click="changePage(pagination.current_page + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add Ambulance Modal -->
    <div v-if="showAddAmbulanceForm" class="modal-overlay" @click="closeAddAmbulanceForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Ambulance</h3>
          <button class="modal-close" @click="closeAddAmbulanceForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="addAmbulance" class="modal-body">
          <div class="form-group">
            <label>Vehicle Number *</label>
            <input type="text" v-model="newAmbulance.vehicle_number" required>
          </div>
          <div class="form-group">
            <label>Type *</label>
            <select v-model="newAmbulance.type" required>
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
              <option value="critical_care">Critical Care</option>
              <option value="neonatal">Neonatal</option>
              <option value="psychiatric">Psychiatric</option>
            </select>
          </div>
          <div class="form-group">
            <label>Capacity *</label>
            <input type="number" v-model="newAmbulance.capacity" min="1" max="10" required>
          </div>
          <div class="form-group">
            <label>Driver</label>
            <select v-model="newAmbulance.driver_id">
              <option value="">Select Driver</option>
              <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                {{ driver.first_name }} {{ driver.last_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Paramedic</label>
            <select v-model="newAmbulance.paramedic_id">
              <option value="">Select Paramedic</option>
              <option v-for="paramedic in paramedics" :key="paramedic.id" :value="paramedic.id">
                {{ paramedic.first_name }} {{ paramedic.last_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Equipment</label>
            <div class="equipment-input">
              <input 
                type="text" 
                v-model="equipmentInput" 
                @keyup.enter="addEquipment"
                placeholder="Add equipment and press Enter"
              >
              <button type="button" @click="addEquipment" class="btn btn-sm btn-primary">
                Add
              </button>
            </div>
            <div class="equipment-list">
              <span 
                v-for="(equipment, index) in newAmbulance.equipment" 
                :key="index"
                class="equipment-tag"
              >
                {{ equipment }}
                <button type="button" @click="removeEquipment(index)" class="remove-equipment">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="newAmbulance.notes" rows="3"></textarea>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeAddAmbulanceForm">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" @click="addAmbulance" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            Add Ambulance
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading ambulance data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAmbulanceDispatch } from '@/scripts/emergency/ambulanceDispatch.js'

export default {
  name: 'AmbulanceDispatch',
  setup() {
    return useAmbulanceDispatch()
  }
}
</script>

<style scoped>
@import '@/assets/css/emergency/ambulance-dispatch.css';
</style>
