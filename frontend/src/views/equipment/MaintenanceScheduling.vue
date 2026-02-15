<template>
  <div class="maintenance-scheduling">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-wrench"></i>
          Maintenance Scheduling
        </h1>
        <p class="page-subtitle">Schedule and manage equipment maintenance</p>
      </div>
      <div class="header-actions">
        <button @click="showScheduleModal = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          Schedule Maintenance
        </button>
        <button @click="refreshSchedules" class="btn-refresh">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ scheduledMaintenance }}</h3>
          <p>Scheduled</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ overdueMaintenance }}</h3>
          <p>Overdue</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-tools"></i>
        </div>
        <div class="stat-content">
          <h3>{{ completedThisMonth }}</h3>
          <p>Completed This Month</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ criticalMaintenance }}</h3>
          <p>Critical</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          @input="searchSchedules"
          type="text" 
          placeholder="Search maintenance schedules..."
        >
      </div>
      <div class="filters">
        <select v-model="selectedStatus" @change="filterSchedules">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="selectedPriority" @change="filterSchedules">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select v-model="selectedEquipment" @change="filterSchedules">
          <option value="">All Equipment</option>
          <option v-for="equipment in equipmentList" :key="equipment.id" :value="equipment.id">
            {{ equipment.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Calendar View Toggle -->
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
        @click="viewMode = 'calendar'" 
        :class="{ active: viewMode === 'calendar' }"
        class="toggle-btn"
      >
        <i class="fas fa-calendar"></i>
        Calendar View
      </button>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="schedules-list">
      <div class="list-header">
        <h2>Maintenance Schedules ({{ filteredSchedules.length }})</h2>
        <div class="sort-options">
          <select v-model="sortBy" @change="sortSchedules">
            <option value="scheduled_date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="equipment_name">Sort by Equipment</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>
      
      <div class="schedules-table">
        <table>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Type</th>
              <th>Scheduled Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in filteredSchedules" :key="schedule.id">
              <td>
                <div class="equipment-info">
                  <strong>{{ schedule.equipment?.name }}</strong>
                  <small>{{ schedule.equipment?.serial_number }}</small>
                </div>
              </td>
              <td>{{ schedule.maintenance_type }}</td>
              <td>{{ formatDate(schedule.scheduled_date) }}</td>
              <td>
                <span :class="['priority-badge', schedule.priority]">
                  {{ schedule.priority }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', schedule.status]">
                  {{ schedule.status }}
                </span>
              </td>
              <td>{{ schedule.assigned_to?.name || 'Unassigned' }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="viewSchedule(schedule)" class="btn-sm btn-primary">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="editSchedule(schedule)" class="btn-sm btn-secondary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="startMaintenance(schedule)" class="btn-sm btn-success" v-if="schedule.status === 'scheduled'">
                    <i class="fas fa-play"></i>
                  </button>
                  <button @click="completeMaintenance(schedule)" class="btn-sm btn-success" v-if="schedule.status === 'in_progress'">
                    <i class="fas fa-check"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'" class="calendar-container">
      <div class="calendar-header">
        <h2>Maintenance Calendar</h2>
        <div class="calendar-navigation">
          <button @click="previousMonth" class="btn-nav">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="current-month">{{ currentMonthYear }}</span>
          <button @click="nextMonth" class="btn-nav">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day" v-for="day in calendarDays" :key="day.date">
          <div class="day-number">{{ day.day }}</div>
          <div class="day-schedules">
            <div 
              v-for="schedule in day.schedules" 
              :key="schedule.id"
              :class="['schedule-item', schedule.priority]"
              @click="viewSchedule(schedule)"
            >
              {{ schedule.equipment?.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Maintenance Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="showScheduleModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Schedule Maintenance</h3>
          <button @click="showScheduleModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createSchedule">
            <div class="form-group">
              <label>Equipment</label>
              <select v-model="newSchedule.equipment_id" required>
                <option value="">Select Equipment</option>
                <option v-for="equipment in equipmentList" :key="equipment.id" :value="equipment.id">
                  {{ equipment.name }} ({{ equipment.serial_number }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Maintenance Type</label>
              <select v-model="newSchedule.maintenance_type" required>
                <option value="">Select Type</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="emergency">Emergency</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div class="form-group">
              <label>Scheduled Date</label>
              <input v-model="newSchedule.scheduled_date" type="datetime-local" required>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <select v-model="newSchedule.priority" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newSchedule.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Assigned To</label>
              <select v-model="newSchedule.assigned_to">
                <option value="">Select Technician</option>
                <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
                  {{ technician.name }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="showScheduleModal = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Schedule Maintenance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Schedule Details Modal -->
    <div v-if="selectedSchedule" class="modal-overlay" @click="selectedSchedule = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Maintenance Schedule Details</h3>
          <button @click="selectedSchedule = null" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="schedule-details-grid">
            <div class="detail-section">
              <h4>Schedule Information</h4>
              <div class="detail-row">
                <label>Equipment:</label>
                <span>{{ selectedSchedule.equipment?.name }}</span>
              </div>
              <div class="detail-row">
                <label>Type:</label>
                <span>{{ selectedSchedule.maintenance_type }}</span>
              </div>
              <div class="detail-row">
                <label>Scheduled Date:</label>
                <span>{{ formatDateTime(selectedSchedule.scheduled_date) }}</span>
              </div>
              <div class="detail-row">
                <label>Priority:</label>
                <span :class="['priority-badge', selectedSchedule.priority]">
                  {{ selectedSchedule.priority }}
                </span>
              </div>
              <div class="detail-row">
                <label>Status:</label>
                <span :class="['status-badge', selectedSchedule.status]">
                  {{ selectedSchedule.status }}
                </span>
              </div>
            </div>
            <div class="detail-section">
              <h4>Assignment</h4>
              <div class="detail-row">
                <label>Assigned To:</label>
                <span>{{ selectedSchedule.assigned_to?.name || 'Unassigned' }}</span>
              </div>
              <div class="detail-row">
                <label>Description:</label>
                <span>{{ selectedSchedule.description || 'No description' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editSchedule(selectedSchedule)" class="btn-primary">
            <i class="fas fa-edit"></i>
            Edit Schedule
          </button>
          <button @click="selectedSchedule = null" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMaintenanceScheduling } from '@/scripts/equipment/maintenanceScheduling.js'

export default {
  name: 'MaintenanceScheduling',
  setup() {
    return useMaintenanceScheduling()
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/maintenance-scheduling.css';
</style>
