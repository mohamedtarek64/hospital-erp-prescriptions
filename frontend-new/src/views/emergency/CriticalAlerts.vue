<template>
  <div class="critical-alerts">
    <!-- Header -->
    <div class="alerts-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-exclamation-triangle"></i>
          Critical Alerts Management
        </h1>
        <p class="page-subtitle">Monitor and manage critical alerts and emergency notifications</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateAlertForm = true">
          <i class="fas fa-plus"></i>
          Create Alert
        </button>
        <button class="btn btn-secondary" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Alert Statistics -->
    <div class="alert-stats-section">
      <h2 class="section-title">
        <i class="fas fa-chart-bar"></i>
        Alert Statistics
      </h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon active">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.active_alerts }}</div>
            <div class="stat-label">Active Alerts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon critical">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.critical_alerts }}</div>
            <div class="stat-label">Critical Alerts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon resolved">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.resolved_alerts }}</div>
            <div class="stat-label">Resolved Today</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon response-time">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.this_week.average_response_time || 0 }}m</div>
            <div class="stat-label">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Alerts -->
    <div class="active-alerts-section">
      <h2 class="section-title">
        <i class="fas fa-list"></i>
        Active Alerts
      </h2>
      <div class="alerts-filters">
        <div class="filter-group">
          <label>Priority</label>
          <select v-model="filters.priority" @change="applyFilters">
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Alert Type</label>
          <select v-model="filters.alert_type" @change="applyFilters">
            <option value="">All Types</option>
            <option value="patient_critical">Patient Critical</option>
            <option value="equipment_failure">Equipment Failure</option>
            <option value="staff_shortage">Staff Shortage</option>
            <option value="ambulance_delay">Ambulance Delay</option>
            <option value="system_error">System Error</option>
            <option value="security_breach">Security Breach</option>
            <option value="fire">Fire</option>
            <option value="power_outage">Power Outage</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search</label>
          <input 
            type="text" 
            v-model="filters.search" 
            @input="applyFilters"
            placeholder="Search alerts..."
          >
        </div>
      </div>
      <div class="alerts-list">
        <div 
          v-for="alert in activeAlerts" 
          :key="alert.id"
          class="alert-card"
          :class="`alert-${alert.priority}`"
        >
          <div class="alert-header">
            <div class="alert-type">
              <i :class="getAlertIcon(alert.alert_type)"></i>
              <span>{{ alert.alert_type_description }}</span>
            </div>
            <div class="alert-priority">
              <span class="priority-badge" :class="`priority-${alert.priority}`">
                {{ alert.priority.toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="alert-content">
            <h3 class="alert-title">{{ alert.title }}</h3>
            <p class="alert-message">{{ alert.message }}</p>
            <div class="alert-meta">
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>Created by: {{ getStaffName(alert.creator) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>Created: {{ formatTime(alert.created_at) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-hourglass-half"></i>
                <span>Age: {{ getAlertAge(alert.created_at) }}</span>
              </div>
              <div v-if="alert.patient" class="meta-item">
                <i class="fas fa-user-injured"></i>
                <span>Patient: {{ getPatientName(alert.patient) }}</span>
              </div>
              <div v-if="alert.emergency_case" class="meta-item">
                <i class="fas fa-ambulance"></i>
                <span>Case: {{ alert.emergency_case.case_number }}</span>
              </div>
            </div>
          </div>
          <div class="alert-actions">
            <button class="btn btn-sm btn-primary" @click="acknowledgeAlert(alert.id)">
              <i class="fas fa-check"></i>
              Acknowledge
            </button>
            <button class="btn btn-sm btn-success" @click="resolveAlert(alert.id)">
              <i class="fas fa-check-double"></i>
              Resolve
            </button>
            <button class="btn btn-sm btn-secondary" @click="viewAlert(alert.id)">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button class="btn btn-sm btn-warning" @click="dismissAlert(alert.id)">
              <i class="fas fa-times"></i>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overdue Alerts -->
    <div v-if="overdueAlerts.length > 0" class="overdue-alerts-section">
      <h2 class="section-title">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        Overdue Alerts
      </h2>
      <div class="overdue-alerts-list">
        <div 
          v-for="alert in overdueAlerts" 
          :key="alert.id"
          class="alert-card overdue"
        >
          <div class="alert-header">
            <div class="alert-type">
              <i class="fas fa-exclamation-triangle"></i>
              <span>OVERDUE - {{ alert.alert_type_description }}</span>
            </div>
            <div class="alert-priority">
              <span class="priority-badge priority-critical">
                OVERDUE
              </span>
            </div>
          </div>
          <div class="alert-content">
            <h3 class="alert-title">{{ alert.title }}</h3>
            <p class="alert-message">{{ alert.message }}</p>
            <div class="alert-meta">
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>Created: {{ formatTime(alert.created_at) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-hourglass-end"></i>
                <span>Overdue by: {{ getOverdueTime(alert.created_at) }}</span>
              </div>
            </div>
          </div>
          <div class="alert-actions">
            <button class="btn btn-sm btn-danger" @click="acknowledgeAlert(alert.id)">
              <i class="fas fa-exclamation"></i>
              URGENT ACKNOWLEDGE
            </button>
            <button class="btn btn-sm btn-success" @click="resolveAlert(alert.id)">
              <i class="fas fa-check-double"></i>
              Resolve
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert History -->
    <div class="alert-history-section">
      <h2 class="section-title">
        <i class="fas fa-history"></i>
        Alert History
      </h2>
      <div class="history-filters">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Date Range</label>
          <input type="date" v-model="filters.date_from" @change="applyFilters">
          <input type="date" v-model="filters.date_to" @change="applyFilters">
        </div>
      </div>
      <div class="alerts-table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Response Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in alerts" :key="alert.id">
              <td>
                <div class="alert-type-cell">
                  <i :class="getAlertIcon(alert.alert_type)"></i>
                  <span>{{ alert.alert_type_description }}</span>
                </div>
              </td>
              <td>
                <div class="alert-title-cell">
                  <strong>{{ alert.title }}</strong>
                  <p class="alert-message-preview">{{ alert.message.substring(0, 100) }}{{ alert.message.length > 100 ? '...' : '' }}</p>
                </div>
              </td>
              <td>
                <span class="priority-badge" :class="`priority-${alert.priority}`">
                  {{ alert.priority.toUpperCase() }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="`status-${alert.status}`">
                  {{ alert.status.toUpperCase() }}
                </span>
              </td>
              <td>
                <div class="creator-info">
                  {{ getStaffName(alert.creator) }}
                </div>
              </td>
              <td>
                <div class="time-info">
                  {{ formatTime(alert.created_at) }}
                </div>
              </td>
              <td>
                <div class="response-time">
                  {{ alert.response_time ? `${alert.response_time}m` : '-' }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-primary" @click="viewAlert(alert.id)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button v-if="alert.status === 'active'" class="btn btn-sm btn-success" @click="acknowledgeAlert(alert.id)">
                    <i class="fas fa-check"></i>
                  </button>
                  <button v-if="alert.status === 'acknowledged'" class="btn btn-sm btn-success" @click="resolveAlert(alert.id)">
                    <i class="fas fa-check-double"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Alert Modal -->
    <div v-if="showCreateAlertForm" class="modal-overlay" @click="closeCreateAlertForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create Critical Alert</h3>
          <button class="modal-close" @click="closeCreateAlertForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="createAlert" class="modal-body">
          <div class="form-group">
            <label>Alert Type *</label>
            <select v-model="newAlert.alert_type" required>
              <option value="">Select Alert Type</option>
              <option value="patient_critical">Patient Critical</option>
              <option value="equipment_failure">Equipment Failure</option>
              <option value="staff_shortage">Staff Shortage</option>
              <option value="ambulance_delay">Ambulance Delay</option>
              <option value="system_error">System Error</option>
              <option value="security_breach">Security Breach</option>
              <option value="fire">Fire</option>
              <option value="power_outage">Power Outage</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priority *</label>
            <select v-model="newAlert.priority" required>
              <option value="">Select Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="form-group">
            <label>Title *</label>
            <input type="text" v-model="newAlert.title" required>
          </div>
          <div class="form-group">
            <label>Message *</label>
            <textarea v-model="newAlert.message" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label>Patient</label>
            <select v-model="newAlert.patient_id">
              <option value="">Select Patient</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.first_name }} {{ patient.last_name }} (ID: {{ patient.id }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Emergency Case</label>
            <select v-model="newAlert.emergency_case_id">
              <option value="">Select Emergency Case</option>
              <option
                v-for="emergencyCase in emergencyCases"
                :key="emergencyCase.id"
                :value="emergencyCase.id"
              >
                {{ emergencyCase.case_number }} - {{ getPatientName(emergencyCase.patient) }}
              </option>
            </select>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeCreateAlertForm">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" @click="createAlert" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            Create Alert
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading alerts data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useCriticalAlerts } from '@/scripts/emergency/criticalAlerts.js'

export default {
  name: 'CriticalAlerts',
  setup() {
    return useCriticalAlerts()
  }
}
</script>

<style scoped>
@import '@/assets/css/emergency/critical-alerts.css';
</style>
