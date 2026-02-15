<template>
  <div class="location-tracker-container">
    <!-- Header -->
    <div class="tracker-header">
      <h3>Equipment Location Tracker</h3>
      <div class="tracker-actions">
        <button @click="refreshLocations" class="btn-secondary btn-sm">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
        <button @click="toggleMapView" class="btn-outline btn-sm">
          <i :class="mapView ? 'fas fa-list' : 'fas fa-map'"></i>
          {{ mapView ? 'List View' : 'Map View' }}
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="tracker-filters">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search equipment or location..."
          @input="filterEquipment"
        >
        <i class="fas fa-search"></i>
      </div>
      <div class="filter-group">
        <select v-model="selectedDepartment" @change="filterEquipment">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="selectedStatus" @change="filterEquipment">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="out_of_order">Out of Order</option>
        </select>
      </div>
    </div>

    <!-- Map View -->
    <div v-if="mapView" class="map-view">
      <div class="map-container">
        <div class="building-layout">
          <div v-for="floor in buildingFloors" :key="floor.number" class="floor-section">
            <h4>Floor {{ floor.number }}</h4>
            <div class="floor-map">
              <div v-for="room in floor.rooms" :key="room.id" class="room-container">
                <div class="room-box" :class="{ 'has-equipment': room.equipment_count > 0 }">
                  <div class="room-label">{{ room.name }}</div>
                  <div class="equipment-count">{{ room.equipment_count }}</div>
                  <div class="equipment-list">
                    <div v-for="equipment in room.equipment" :key="equipment.id" class="equipment-dot" :class="equipment.status" :title="equipment.name"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="list-view">
      <div class="equipment-locations">
        <div v-for="location in filteredLocations" :key="location.id" class="location-card">
          <div class="location-header">
            <h4>{{ location.name }}</h4>
            <span class="location-type">{{ location.type }}</span>
          </div>
          
          <div class="location-details">
            <div class="detail-item">
              <i class="fas fa-building"></i>
              <span>{{ location.department?.name || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-layer-group"></i>
              <span>Floor {{ location.floor || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-user"></i>
              <span>{{ location.responsible_person?.name || 'N/A' }}</span>
            </div>
          </div>

          <div class="equipment-in-location">
            <h5>Equipment ({{ location.equipment?.length || 0 }})</h5>
            <div v-if="location.equipment && location.equipment.length > 0" class="equipment-grid">
              <div v-for="equipment in location.equipment" :key="equipment.id" class="equipment-item" @click="selectEquipment(equipment)">
                <div class="equipment-info">
                  <span class="equipment-name">{{ equipment.name }}</span>
                  <span class="equipment-status" :class="equipment.status">{{ equipment.status }}</span>
                </div>
                <div class="equipment-meta">
                  <small>{{ equipment.serial_number }}</small>
                </div>
              </div>
            </div>
            <div v-else class="no-equipment">
              <i class="fas fa-inbox"></i>
              <span>No equipment in this location</span>
            </div>
          </div>

          <div class="location-actions">
            <button @click="viewLocationDetails(location)" class="btn-outline btn-sm">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button @click="transferEquipment(location)" class="btn-primary btn-sm">
              <i class="fas fa-exchange-alt"></i>
              Transfer Equipment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Details Modal -->
    <div v-if="selectedEquipment" class="modal-overlay" @click="closeEquipmentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedEquipment.name }}</h3>
          <button @click="closeEquipmentModal" class="close-btn">&times;</button>
        </div>
        
        <div class="equipment-details">
          <div class="detail-section">
            <h4>Basic Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Model:</span>
                <span class="value">{{ selectedEquipment.model }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Serial Number:</span>
                <span class="value">{{ selectedEquipment.serial_number }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status-badge" :class="selectedEquipment.status">{{ selectedEquipment.status }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Current Location:</span>
                <span class="value">{{ selectedEquipment.location?.name || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Usage Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Total Usage Hours:</span>
                <span class="value">{{ selectedEquipment.usage_hours || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Last Used:</span>
                <span class="value">{{ formatDate(selectedEquipment.last_used) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Next Maintenance:</span>
                <span class="value">{{ formatDate(selectedEquipment.next_maintenance) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Location History</h4>
            <div class="location-history">
              <div v-for="history in selectedEquipment.location_history" :key="history.id" class="history-item">
                <div class="history-date">{{ formatDate(history.transfer_date) }}</div>
                <div class="history-location">{{ history.from_location }} → {{ history.to_location }}</div>
                <div class="history-reason">{{ history.reason }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="startEquipmentTransfer" class="btn-primary">
            <i class="fas fa-exchange-alt"></i>
            Transfer Equipment
          </button>
          <button @click="viewEquipmentHistory" class="btn-outline">
            <i class="fas fa-history"></i>
            View Full History
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Equipment Modal -->
    <div v-if="showTransferModal" class="modal-overlay" @click="closeTransferModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Transfer Equipment</h3>
          <button @click="closeTransferModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="submitTransfer" class="transfer-form">
          <div class="form-group">
            <label>Equipment</label>
            <input :value="transferForm.equipment?.name" type="text" readonly>
          </div>
          
          <div class="form-group">
            <label>From Location</label>
            <input :value="transferForm.from_location?.name" type="text" readonly>
          </div>
          
          <div class="form-group">
            <label>To Location *</label>
            <select v-model="transferForm.to_location_id" required>
              <option value="">Select Destination</option>
              <option v-for="location in availableLocations" :key="location.id" :value="location.id">
                {{ location.name }} - {{ location.department?.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Transfer Reason *</label>
            <textarea v-model="transferForm.reason" rows="3" required placeholder="Reason for transfer..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Transfer Date</label>
            <input v-model="transferForm.transfer_date" type="datetime-local">
          </div>

          <div class="form-actions">
            <button type="button" @click="closeTransferModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Transferring...' : 'Transfer Equipment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'LocationTracker',
  props: {
    equipment: {
      type: Array,
      default: () => []
    }
  },
  emits: ['equipment-selected', 'equipment-transferred'],
  setup(props, { emit }) {
    const mapView = ref(false)
    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const selectedStatus = ref('')
    const selectedEquipment = ref(null)
    const showTransferModal = ref(false)
    const loading = ref(false)

    const departments = ref([])
    const locations = ref([])
    const buildingFloors = ref([])

    const transferForm = ref({
      equipment: null,
      from_location: null,
      to_location_id: '',
      reason: '',
      transfer_date: new Date().toISOString().slice(0, 16)
    })

    const filteredLocations = computed(() => {
      let filtered = locations.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(location => 
          location.name.toLowerCase().includes(query) ||
          location.equipment?.some(eq => eq.name.toLowerCase().includes(query))
        )
      }

      if (selectedDepartment.value) {
        filtered = filtered.filter(location => location.department_id === selectedDepartment.value)
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(location => 
          location.equipment?.some(eq => eq.status === selectedStatus.value)
        )
      }

      return filtered
    })

    const availableLocations = computed(() => {
      return locations.value.filter(location => 
        location.id !== transferForm.value.from_location?.id
      )
    })

    const toggleMapView = () => {
      mapView.value = !mapView.value
    }

    const refreshLocations = async () => {
      loading.value = true
      try {
        await loadLocations()
        await loadBuildingLayout()
      } catch (error) {
        console.error('Error refreshing locations:', error)
      } finally {
        loading.value = false
      }
    }

    const filterEquipment = () => {
      // Filtering is handled by computed property
    }

    const selectEquipment = (equipment) => {
      selectedEquipment.value = equipment
    }

    const closeEquipmentModal = () => {
      selectedEquipment.value = null
    }

    const viewLocationDetails = (location) => {
      console.log('View location details:', location)
    }

    const transferEquipment = (location) => {
      transferForm.value.from_location = location
      showTransferModal.value = true
    }

    const closeTransferModal = () => {
      showTransferModal.value = false
      transferForm.value = {
        equipment: null,
        from_location: null,
        to_location_id: '',
        reason: '',
        transfer_date: new Date().toISOString().slice(0, 16)
      }
    }

    const submitTransfer = async () => {
      loading.value = true
      try {
        emit('equipment-transferred', transferForm.value)
        closeTransferModal()
      } catch (error) {
        console.error('Error transferring equipment:', error)
      } finally {
        loading.value = false
      }
    }

    const startEquipmentTransfer = () => {
      transferForm.value.equipment = selectedEquipment.value
      transferForm.value.from_location = selectedEquipment.value.location
      showTransferModal.value = true
      closeEquipmentModal()
    }

    const viewEquipmentHistory = () => {
      console.log('View equipment history:', selectedEquipment.value)
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString()
    }

    const loadLocations = async () => {
      try {
        // const response = await apiClient.get('/equipment-locations')
        // locations.value = response.data
        locations.value = [
          {
            id: 1,
            name: 'ICU Room 1',
            type: 'room',
            department_id: 1,
            floor: '2',
            room: '201',
            responsible_person_id: 1,
            equipment: [
              { id: 1, name: 'Ventilator', serial_number: 'V-001', status: 'available' },
              { id: 2, name: 'Monitor', serial_number: 'M-001', status: 'in_use' }
            ]
          }
        ]
      } catch (error) {
        console.error('Error loading locations:', error)
      }
    }

    const loadBuildingLayout = async () => {
      try {
        // Load building layout data
        buildingFloors.value = [
          {
            number: 1,
            rooms: [
              { id: 1, name: 'R101', equipment_count: 2 },
              { id: 2, name: 'R102', equipment_count: 1 }
            ]
          },
          {
            number: 2,
            rooms: [
              { id: 3, name: 'R201', equipment_count: 3 },
              { id: 4, name: 'R202', equipment_count: 0 }
            ]
          }
        ]
      } catch (error) {
        console.error('Error loading building layout:', error)
      }
    }

    onMounted(() => {
      loadLocations()
      loadBuildingLayout()
    })

    return {
      mapView,
      searchQuery,
      selectedDepartment,
      selectedStatus,
      selectedEquipment,
      showTransferModal,
      loading,
      departments,
      locations,
      buildingFloors,
      transferForm,
      filteredLocations,
      availableLocations,
      toggleMapView,
      refreshLocations,
      filterEquipment,
      selectEquipment,
      closeEquipmentModal,
      viewLocationDetails,
      transferEquipment,
      closeTransferModal,
      submitTransfer,
      startEquipmentTransfer,
      viewEquipmentHistory,
      formatDate
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/location-tracker.css';
</style>
