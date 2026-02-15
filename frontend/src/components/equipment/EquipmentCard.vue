<template>
  <div class="equipment-card" :class="{ 'selected': isSelected }">
    <!-- Equipment Image/Icon -->
    <div class="equipment-image">
      <div v-if="equipment.image_url" class="image-container">
        <img :src="equipment.image_url" :alt="equipment.name">
      </div>
      <div v-else class="default-icon">
        <i :class="getEquipmentIcon(equipment.category?.name)"></i>
      </div>
      <div class="status-indicator" :class="equipment.status"></div>
    </div>

    <!-- Equipment Info -->
    <div class="equipment-info">
      <h3 class="equipment-name">{{ equipment.name }}</h3>
      <p class="equipment-model">{{ equipment.model }}</p>
      <p class="equipment-serial">SN: {{ equipment.serial_number }}</p>
      
      <div class="equipment-details">
        <div class="detail-item">
          <span class="label">Category:</span>
          <span class="value">{{ equipment.category?.name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Location:</span>
          <span class="value">{{ equipment.location?.name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Condition:</span>
          <span class="value condition-rating" :class="getConditionClass(equipment.condition_rating)">
            {{ getConditionText(equipment.condition_rating) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Equipment Metrics -->
    <div class="equipment-metrics">
      <div class="metric-item">
        <div class="metric-value">{{ equipment.usage_hours || 0 }}</div>
        <div class="metric-label">Usage Hours</div>
      </div>
      <div class="metric-item">
        <div class="metric-value">{{ equipment.maintenance_count || 0 }}</div>
        <div class="metric-label">Maintenance</div>
      </div>
      <div class="metric-item">
        <div class="metric-value">{{ getDaysSinceLastMaintenance() }}</div>
        <div class="metric-label">Days Since Service</div>
      </div>
    </div>

    <!-- Equipment Actions -->
    <div class="equipment-actions">
      <button @click="viewDetails" class="btn-outline btn-sm">
        <i class="fas fa-eye"></i>
        View
      </button>
      <button @click="startUsage" class="btn-primary btn-sm" :disabled="equipment.status !== 'available'">
        <i class="fas fa-play"></i>
        Use
      </button>
      <button @click="scheduleMaintenance" class="btn-warning btn-sm">
        <i class="fas fa-wrench"></i>
        Service
      </button>
      <div class="dropdown">
        <button @click="toggleDropdown" class="btn-secondary btn-sm dropdown-toggle">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <div v-if="showDropdown" class="dropdown-menu">
          <a @click="editEquipment" class="dropdown-item">
            <i class="fas fa-edit"></i>
            Edit
          </a>
          <a @click="viewHistory" class="dropdown-item">
            <i class="fas fa-history"></i>
            History
          </a>
          <a @click="generateReport" class="dropdown-item">
            <i class="fas fa-chart-bar"></i>
            Report
          </a>
          <a @click="transferEquipment" class="dropdown-item">
            <i class="fas fa-exchange-alt"></i>
            Transfer
          </a>
          <hr class="dropdown-divider">
          <a @click="deleteEquipment" class="dropdown-item text-danger">
            <i class="fas fa-trash"></i>
            Delete
          </a>
        </div>
      </div>
    </div>

    <!-- Equipment Alerts -->
    <div v-if="hasAlerts" class="equipment-alerts">
      <div v-for="alert in equipment.alerts" :key="alert.id" class="alert-item" :class="alert.type">
        <i :class="getAlertIcon(alert.type)"></i>
        <span>{{ alert.message }}</span>
      </div>
    </div>

    <!-- Selection Checkbox -->
    <div v-if="selectable" class="selection-checkbox">
      <input 
        type="checkbox" 
        :checked="isSelected" 
        @change="toggleSelection"
        class="checkbox-input"
      >
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'EquipmentCard',
  props: {
    equipment: {
      type: Object,
      required: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'deselect', 'view', 'edit', 'delete', 'use', 'maintenance', 'transfer', 'history', 'report'],
  setup(props, { emit }) {
    const showDropdown = ref(false)

    const isSelected = computed(() => props.selected)

    const hasAlerts = computed(() => {
      return props.equipment.alerts && props.equipment.alerts.length > 0
    })

    const getEquipmentIcon = (categoryName) => {
      const iconMap = {
        'Medical': 'fas fa-stethoscope',
        'Surgical': 'fas fa-cut',
        'Diagnostic': 'fas fa-search',
        'Monitoring': 'fas fa-heartbeat',
        'Laboratory': 'fas fa-flask',
        'Imaging': 'fas fa-x-ray',
        'Therapy': 'fas fa-hand-holding-medical',
        'Emergency': 'fas fa-ambulance',
        'default': 'fas fa-cog'
      }
      return iconMap[categoryName] || iconMap.default
    }

    const getConditionClass = (rating) => {
      if (rating >= 8) return 'excellent'
      if (rating >= 6) return 'good'
      if (rating >= 4) return 'fair'
      if (rating >= 2) return 'poor'
      return 'critical'
    }

    const getConditionText = (rating) => {
      if (rating >= 8) return 'Excellent'
      if (rating >= 6) return 'Good'
      if (rating >= 4) return 'Fair'
      if (rating >= 2) return 'Poor'
      return 'Critical'
    }

    const getAlertIcon = (type) => {
      const iconMap = {
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle',
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle'
      }
      return iconMap[type] || iconMap.info
    }

    const getDaysSinceLastMaintenance = () => {
      if (!props.equipment.last_maintenance_date) return 'N/A'
      const lastMaintenance = new Date(props.equipment.last_maintenance_date)
      const now = new Date()
      const diffTime = Math.abs(now - lastMaintenance)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }

    const toggleSelection = () => {
      if (isSelected.value) {
        emit('deselect', props.equipment)
      } else {
        emit('select', props.equipment)
      }
    }

    const viewDetails = () => {
      emit('view', props.equipment)
    }

    const editEquipment = () => {
      emit('edit', props.equipment)
      showDropdown.value = false
    }

    const deleteEquipment = () => {
      emit('delete', props.equipment)
      showDropdown.value = false
    }

    const startUsage = () => {
      emit('use', props.equipment)
    }

    const scheduleMaintenance = () => {
      emit('maintenance', props.equipment)
    }

    const transferEquipment = () => {
      emit('transfer', props.equipment)
      showDropdown.value = false
    }

    const viewHistory = () => {
      emit('history', props.equipment)
      showDropdown.value = false
    }

    const generateReport = () => {
      emit('report', props.equipment)
      showDropdown.value = false
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        showDropdown.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      showDropdown,
      isSelected,
      hasAlerts,
      getEquipmentIcon,
      getConditionClass,
      getConditionText,
      getAlertIcon,
      getDaysSinceLastMaintenance,
      toggleDropdown,
      toggleSelection,
      viewDetails,
      editEquipment,
      deleteEquipment,
      startUsage,
      scheduleMaintenance,
      transferEquipment,
      viewHistory,
      generateReport
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/equipment-card.css';
</style>
