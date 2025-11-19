<template>
  <div class="emergency-dashboard">
    <!-- Header -->
    <div class="emergency-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-ambulance"></i>
          Emergency & Ambulance Management
        </h1>
        <p class="page-subtitle">Real-time emergency response and ambulance dispatch system</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createEmergencyCase">
          <i class="fas fa-plus"></i>
          New Emergency Case
        </button>
        <button class="btn btn-secondary" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Critical Alerts -->
    <div v-if="criticalAlerts.length > 0" class="critical-alerts-section">
      <h2 class="section-title">
        <i class="fas fa-exclamation-triangle text-red-500"></i>
        Critical Alerts
      </h2>
      <div class="alerts-grid">
        <div 
          v-for="alert in criticalAlerts" 
          :key="alert.id"
          class="alert-card"
          :class="`alert-${alert.priority}`"
        >
          <div class="alert-header">
            <span class="alert-type">{{ alert.alert_type_description }}</span>
            <span class="alert-priority">{{ alert.priority.toUpperCase() }}</span>
          </div>
          <div class="alert-content">
            <h3 class="alert-title">{{ alert.title }}</h3>
            <p class="alert-message">{{ alert.message }}</p>
            <div class="alert-meta">
              <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
              <span class="alert-age">{{ getAlertAge(alert.created_at) }}</span>
            </div>
          </div>
          <div class="alert-actions">
            <button class="btn btn-sm btn-primary" @click="acknowledgeAlert(alert.id)">
              Acknowledge
            </button>
            <button class="btn btn-sm btn-success" @click="resolveAlert(alert.id)">
              Resolve
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-ambulance"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.total_cases }}</div>
            <div class="stat-label">Today's Cases</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.active_cases }}</div>
            <div class="stat-label">Active Cases</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.critical_cases }}</div>
            <div class="stat-label">Critical Cases</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-truck"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ availableAmbulances.length }}</div>
            <div class="stat-label">Available Ambulances</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Cases -->
    <div class="active-cases-section">
      <h2 class="section-title">
        <i class="fas fa-list"></i>
        Active Emergency Cases
      </h2>
      <div class="cases-grid">
          <div 
            v-for="emergencyCase in activeCases" 
            :key="emergencyCase.id"
            class="case-card"
            :class="`priority-${emergencyCase.priority}`"
          >
          <div class="case-header">
            <span class="case-number">{{ emergencyCase.case_number }}</span>
            <span class="case-priority">{{ emergencyCase.priority.toUpperCase() }}</span>
          </div>
          <div class="case-content">
            <div class="case-info">
              <div class="case-patient">
                <strong>{{ getPatientName(emergencyCase.patient) }}</strong>
                <span class="case-type">{{ emergencyCase.emergency_type }}</span>
              </div>
              <div class="case-location">
                <i class="fas fa-map-marker-alt"></i>
                {{ emergencyCase.location.address }}
              </div>
              <div class="case-time">
                <i class="fas fa-clock"></i>
                {{ formatTime(emergencyCase.created_at) }}
              </div>
            </div>
            <div class="case-status">
              <span class="status-badge" :class="`status-${emergencyCase.status}`">
                {{ emergencyCase.status.replace('_', ' ').toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="case-actions">
            <button class="btn btn-sm btn-primary" @click="viewCase(emergencyCase.id)">
              View Details
            </button>
            <button 
              v-if="emergencyCase.status === 'pending'"
              class="btn btn-sm btn-success" 
              @click="dispatchAmbulance(emergencyCase.id)"
            >
              Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Ambulances -->
    <div class="ambulances-section">
      <h2 class="section-title">
        <i class="fas fa-truck"></i>
        Available Ambulances
      </h2>
      <div class="ambulances-grid">
        <div 
          v-for="ambulance in availableAmbulances" 
          :key="ambulance.id"
          class="ambulance-card"
        >
          <div class="ambulance-header">
            <span class="vehicle-number">{{ ambulance.vehicle_number }}</span>
            <span class="ambulance-type">{{ ambulance.type.replace('_', ' ').toUpperCase() }}</span>
          </div>
          <div class="ambulance-content">
            <div class="ambulance-info">
              <div class="ambulance-staff">
                <div class="staff-member">
                  <i class="fas fa-user"></i>
                  Driver: {{ getStaffName(ambulance.driver) }}
                </div>
                <div class="staff-member">
                  <i class="fas fa-user-md"></i>
                  Paramedic: {{ getStaffName(ambulance.paramedic) }}
                </div>
              </div>
              <div class="ambulance-capacity">
                <i class="fas fa-users"></i>
                Capacity: {{ ambulance.capacity }}
              </div>
            </div>
            <div class="ambulance-status">
              <span class="status-badge status-available">AVAILABLE</span>
            </div>
          </div>
          <div class="ambulance-actions">
            <button class="btn btn-sm btn-primary" @click="viewAmbulance(ambulance.id)">
              View Details
            </button>
            <button class="btn btn-sm btn-secondary" @click="updateLocation(ambulance.id)">
              Update Location
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Triage Queue -->
    <div class="triage-section">
      <h2 class="section-title">
        <i class="fas fa-stethoscope"></i>
        Triage Queue
      </h2>
      <div class="triage-grid">
        <div 
          v-for="assessment in triageQueue" 
          :key="assessment.id"
          class="triage-card"
          :class="`triage-${assessment.triage_level}`"
        >
          <div class="triage-header">
            <span class="triage-level">{{ assessment.triage_level.toUpperCase() }}</span>
            <span class="triage-time">{{ formatTime(assessment.assessed_at) }}</span>
          </div>
          <div class="triage-content">
            <div class="triage-patient">
              <strong>{{ getPatientName(assessment.patient) }}</strong>
            </div>
            <div class="triage-symptoms">
              {{ assessment.symptoms }}
            </div>
            <div class="triage-vitals">
              <div v-if="assessment.vital_signs.heart_rate" class="vital-sign">
                <i class="fas fa-heartbeat"></i>
                HR: {{ assessment.vital_signs.heart_rate }} bpm
              </div>
              <div v-if="assessment.vital_signs.blood_pressure" class="vital-sign">
                <i class="fas fa-tint"></i>
                BP: {{ assessment.vital_signs.blood_pressure.systolic }}/{{ assessment.vital_signs.blood_pressure.diastolic }}
              </div>
              <div v-if="assessment.vital_signs.oxygen_saturation" class="vital-sign">
                <i class="fas fa-lungs"></i>
                SpO2: {{ assessment.vital_signs.oxygen_saturation }}%
              </div>
            </div>
          </div>
          <div class="triage-actions">
            <button class="btn btn-sm btn-primary" @click="viewTriage(assessment.id)">
              View Assessment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading emergency data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useEmergencyDashboard } from '@/scripts/emergency/emergencyDashboard.js'

export default {
  name: 'EmergencyDashboard',
  setup() {
    return useEmergencyDashboard()
  }
}
</script>

<style scoped>
@import '@/assets/css/emergency/emergency-dashboard.css';
</style>
