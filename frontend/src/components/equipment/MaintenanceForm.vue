<template>
  <div class="maintenance-form-container">
    <div class="form-header">
      <h2>{{ isEdit ? 'Edit Maintenance Record' : 'Schedule Maintenance' }}</h2>
      <button @click="closeForm" class="close-btn">&times;</button>
    </div>

    <form @submit.prevent="submitForm" class="maintenance-form">
      <!-- Equipment Selection -->
      <div class="form-section">
        <h3>Equipment Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Equipment *</label>
            <select v-model="form.equipment_id" required @change="onEquipmentChange">
              <option value="">Select Equipment</option>
              <option v-for="equipment in equipmentList" :key="equipment.id" :value="equipment.id">
                {{ equipment.name }} - {{ equipment.serial_number }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Maintenance Type *</label>
            <select v-model="form.maintenance_type" required>
              <option value="">Select Type</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="emergency">Emergency</option>
              <option value="calibration">Calibration</option>
              <option value="inspection">Inspection</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Maintenance Details -->
      <div class="form-section">
        <h3>Maintenance Details</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Maintenance Date *</label>
            <input v-model="form.maintenance_date" type="date" required>
          </div>
          <div class="form-group">
            <label>Assigned Technician *</label>
            <select v-model="form.technician_id" required>
              <option value="">Select Technician</option>
              <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                {{ technician.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea v-model="form.description" rows="4" required placeholder="Describe the maintenance work to be performed..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Priority</label>
            <select v-model="form.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estimated Duration (hours)</label>
            <input v-model="form.estimated_duration" type="number" min="0.5" step="0.5" placeholder="2.5">
          </div>
        </div>
      </div>

      <!-- Cost Information -->
      <div class="form-section">
        <h3>Cost Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Labor Cost</label>
            <input v-model="form.labor_cost" type="number" step="0.01" min="0" placeholder="0.00">
          </div>
          <div class="form-group">
            <label>Parts Cost</label>
            <input v-model="form.parts_cost" type="number" step="0.01" min="0" placeholder="0.00">
          </div>
        </div>

        <div class="form-group">
          <label>Parts Replaced</label>
          <div class="parts-list">
            <div v-for="(part, index) in form.parts_replaced" :key="index" class="part-item">
              <input v-model="part.name" type="text" placeholder="Part name" class="part-name">
              <input v-model="part.quantity" type="number" min="1" placeholder="Qty" class="part-quantity">
              <input v-model="part.cost" type="number" step="0.01" min="0" placeholder="Cost" class="part-cost">
              <button type="button" @click="removePart(index)" class="remove-part-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button type="button" @click="addPart" class="add-part-btn">
              <i class="fas fa-plus"></i>
              Add Part
            </button>
          </div>
        </div>
      </div>

      <!-- Maintenance Schedule -->
      <div v-if="form.maintenance_type === 'preventive'" class="form-section">
        <h3>Schedule Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Frequency</label>
            <select v-model="form.frequency">
              <option value="">Select Frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annually">Semi-Annually</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div class="form-group">
            <label>Next Due Date</label>
            <input v-model="form.next_due_date" type="date">
          </div>
        </div>
      </div>

      <!-- Completion Information -->
      <div v-if="isEdit && form.status === 'completed'" class="form-section">
        <h3>Completion Details</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Actual Duration (hours)</label>
            <input v-model="form.actual_duration" type="number" min="0.5" step="0.5">
          </div>
          <div class="form-group">
            <label>Completion Date</label>
            <input v-model="form.completion_date" type="date">
          </div>
        </div>

        <div class="form-group">
          <label>Work Performed</label>
          <textarea v-model="form.work_performed" rows="4" placeholder="Describe the work that was actually performed..."></textarea>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="form.notes" rows="3" placeholder="Additional notes or observations..."></textarea>
        </div>
      </div>

      <!-- Status and Actions -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="form-group">
            <label>Total Cost</label>
            <input :value="totalCost" type="text" readonly class="readonly-input">
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="closeForm" class="btn-secondary">Cancel</button>
        <button type="button" @click="saveDraft" class="btn-outline" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save Draft' }}
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : (isEdit ? 'Update Maintenance' : 'Schedule Maintenance') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'MaintenanceForm',
  props: {
    maintenance: {
      type: Object,
      default: null
    },
    equipment: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel', 'save-draft'],
  setup(props, { emit }) {
    const loading = ref(false)
    const equipmentList = ref([])
    const technicians = ref([])

    const form = ref({
      equipment_id: '',
      maintenance_type: '',
      maintenance_date: '',
      technician_id: '',
      description: '',
      priority: 'medium',
      estimated_duration: '',
      labor_cost: '',
      parts_cost: '',
      parts_replaced: [],
      frequency: '',
      next_due_date: '',
      actual_duration: '',
      completion_date: '',
      work_performed: '',
      notes: '',
      status: 'scheduled'
    })

    const totalCost = computed(() => {
      const labor = parseFloat(form.value.labor_cost) || 0
      const parts = parseFloat(form.value.parts_cost) || 0
      return (labor + parts).toFixed(2)
    })

    const onEquipmentChange = () => {
      // Load equipment-specific maintenance history or recommendations
      console.log('Equipment changed:', form.value.equipment_id)
    }

    const addPart = () => {
      form.value.parts_replaced.push({
        name: '',
        quantity: 1,
        cost: 0
      })
    }

    const removePart = (index) => {
      form.value.parts_replaced.splice(index, 1)
    }

    const submitForm = async () => {
      loading.value = true
      try {
        // Calculate total parts cost
        const partsCost = form.value.parts_replaced.reduce((total, part) => {
          return total + (parseFloat(part.cost) || 0) * (parseInt(part.quantity) || 0)
        }, 0)
        form.value.parts_cost = partsCost

        emit('submit', { ...form.value })
      } catch (error) {
        console.error('Error submitting form:', error)
      } finally {
        loading.value = false
      }
    }

    const saveDraft = () => {
      emit('save-draft', { ...form.value })
    }

    const closeForm = () => {
      emit('cancel')
    }

    const loadEquipmentList = async () => {
      // Load equipment list from API
      try {
        // const response = await apiClient.get('/equipment')
        // equipmentList.value = response.data
        equipmentList.value = [
          { id: 1, name: 'X-Ray Machine', serial_number: 'XR-001' },
          { id: 2, name: 'MRI Scanner', serial_number: 'MRI-002' }
        ]
      } catch (error) {
        console.error('Error loading equipment:', error)
      }
    }

    const loadTechnicians = async () => {
      // Load technicians from API
      try {
        // const response = await apiClient.get('/users?role=technician')
        // technicians.value = response.data
        technicians.value = [
          { id: 1, name: 'John Smith' },
          { id: 2, name: 'Jane Doe' }
        ]
      } catch (error) {
        console.error('Error loading technicians:', error)
      }
    }

    // Initialize form with existing data
    watch(() => props.maintenance, (newMaintenance) => {
      if (newMaintenance) {
        Object.assign(form.value, newMaintenance)
      }
    }, { immediate: true })

    watch(() => props.equipment, (newEquipment) => {
      if (newEquipment) {
        form.value.equipment_id = newEquipment.id
      }
    }, { immediate: true })

    onMounted(() => {
      loadEquipmentList()
      loadTechnicians()
    })

    return {
      loading,
      equipmentList,
      technicians,
      form,
      totalCost,
      onEquipmentChange,
      addPart,
      removePart,
      submitForm,
      saveDraft,
      closeForm
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/maintenance-form.css';
</style>
