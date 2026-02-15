<template>
  <div class="task-form">
    <div class="form-header">
      <h3>{{ isEditing ? 'Edit Task' : 'Add New Task' }}</h3>
      <button @click="closeForm" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="form-content">
      <div class="form-group">
        <label for="title">Task Title *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          required
          class="form-input"
          placeholder="Enter task title"
        />
      </div>
      
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          class="form-textarea"
          rows="3"
          placeholder="Enter task description"
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="priority">Priority *</label>
          <select
            id="priority"
            v-model="formData.priority"
            required
            class="form-select"
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="category">Category *</label>
          <select
            id="category"
            v-model="formData.category"
            required
            class="form-select"
          >
            <option value="">Select Category</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="supply">Supply</option>
            <option value="safety">Safety</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="assigned_to">Assigned To</label>
          <select
            id="assigned_to"
            v-model="formData.assigned_to"
            class="form-select"
          >
            <option value="">Select Staff Member</option>
            <option
              v-for="staff in staffMembers"
              :key="staff.id"
              :value="staff.id"
            >
              {{ staff.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="due_date">Due Date</label>
          <input
            id="due_date"
            v-model="formData.due_date"
            type="datetime-local"
            class="form-input"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="location">Location</label>
        <input
          id="location"
          v-model="formData.location"
          type="text"
          class="form-input"
          placeholder="Enter task location"
        />
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="formData.is_recurring"
            type="checkbox"
            class="form-checkbox"
          />
          <span class="checkbox-text">Recurring Task</span>
        </label>
      </div>
      
      <div v-if="formData.is_recurring" class="form-group">
        <label for="recurrence">Recurrence</label>
        <select
          id="recurrence"
          v-model="formData.recurrence"
          class="form-select"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <div class="form-actions">
        <button
          type="button"
          @click="closeForm"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ isEditing ? 'Update Task' : 'Create Task' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
// import { ref, reactive, watch, onMounted, computed } from 'vue'
import { reactive, watch, onMounted, computed } from 'vue'

// Props
const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  staffMembers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'close'])

// State
const formData = reactive({
  title: '',
  description: '',
  priority: '',
  category: '',
  assigned_to: '',
  due_date: '',
  location: '',
  is_recurring: false,
  recurrence: 'daily'
})

// Computed
const isEditing = computed(() => !!props.task)

// Methods
const closeForm = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', { ...formData })
}

const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    priority: '',
    category: '',
    assigned_to: '',
    due_date: '',
    location: '',
    is_recurring: false,
    recurrence: 'daily'
  })
}

// Watch for task changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    Object.assign(formData, {
      title: newTask.title || '',
      description: newTask.description || '',
      priority: newTask.priority || '',
      category: newTask.category || '',
      assigned_to: newTask.assigned_to || '',
      due_date: newTask.due_date || '',
      location: newTask.location || '',
      is_recurring: newTask.is_recurring || false,
      recurrence: newTask.recurrence || 'daily'
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// Initialize
onMounted(() => {
  if (props.task) {
    Object.assign(formData, props.task)
  }
})
</script>

