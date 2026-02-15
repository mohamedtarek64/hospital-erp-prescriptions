<template>
  <div class="triage-assessment">
    <!-- Header -->
    <div class="triage-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-stethoscope"></i>
          Triage Assessment
        </h1>
        <p class="page-subtitle">Patient triage and priority assessment system</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAssessmentForm = true">
          <i class="fas fa-plus"></i>
          New Assessment
        </button>
        <button class="btn btn-secondary" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Triage Statistics -->
    <div class="triage-stats-section">
      <h2 class="section-title">
        <i class="fas fa-chart-bar"></i>
        Triage Statistics
      </h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon red">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.by_level.red || 0 }}</div>
            <div class="stat-label">Red (Immediate)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.by_level.orange || 0 }}</div>
            <div class="stat-label">Orange (Very Urgent)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.by_level.yellow || 0 }}</div>
            <div class="stat-label">Yellow (Urgent)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.by_level.green || 0 }}</div>
            <div class="stat-label">Green (Less Urgent)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.today.by_level.blue || 0 }}</div>
            <div class="stat-label">Blue (Non-urgent)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon critical">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.critical_patients }}</div>
            <div class="stat-label">Critical Patients</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Triage Queue -->
    <div class="triage-queue-section">
      <h2 class="section-title">
        <i class="fas fa-list"></i>
        Triage Queue
      </h2>
      <div class="queue-filters">
        <div class="filter-group">
          <label>Triage Level</label>
          <select v-model="filters.triage_level" @change="applyFilters">
            <option value="">All Levels</option>
            <option value="red">Red (Immediate)</option>
            <option value="orange">Orange (Very Urgent)</option>
            <option value="yellow">Yellow (Urgent)</option>
            <option value="green">Green (Less Urgent)</option>
            <option value="blue">Blue (Non-urgent)</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search</label>
          <input 
            type="text" 
            v-model="filters.search" 
            @input="applyFilters"
            placeholder="Search by patient name..."
          >
        </div>
      </div>
      <div class="triage-queue">
        <div 
          v-for="assessment in triageQueue" 
          :key="assessment.id"
          class="triage-item"
          :class="`triage-${assessment.triage_level}`"
        >
          <div class="triage-priority">
            <div class="priority-indicator" :class="`priority-${assessment.triage_level}`">
              {{ assessment.triage_level.toUpperCase() }}
            </div>
            <div class="wait-time">
              {{ getWaitTime(assessment.assessed_at) }}
            </div>
          </div>
          <div class="triage-patient-info">
            <div class="patient-name">
              <strong>{{ getPatientName(assessment.patient) }}</strong>
              <span class="patient-id">ID: {{ assessment.patient.id }}</span>
            </div>
            <div class="assessment-time">
              <i class="fas fa-clock"></i>
              {{ formatTime(assessment.assessed_at) }}
            </div>
          </div>
          <div class="triage-symptoms">
            <div class="symptoms-text">
              {{ assessment.symptoms }}
            </div>
          </div>
          <div class="triage-vitals">
            <div v-if="assessment.vital_signs.heart_rate" class="vital-sign">
              <i class="fas fa-heartbeat"></i>
              <span>HR: {{ assessment.vital_signs.heart_rate }} bpm</span>
            </div>
            <div v-if="assessment.vital_signs.blood_pressure" class="vital-sign">
              <i class="fas fa-tint"></i>
              <span>BP: {{ assessment.vital_signs.blood_pressure.systolic }}/{{ assessment.vital_signs.blood_pressure.diastolic }}</span>
            </div>
            <div v-if="assessment.vital_signs.temperature" class="vital-sign">
              <i class="fas fa-thermometer-half"></i>
              <span>Temp: {{ assessment.vital_signs.temperature }}°C</span>
            </div>
            <div v-if="assessment.vital_signs.oxygen_saturation" class="vital-sign">
              <i class="fas fa-lungs"></i>
              <span>SpO2: {{ assessment.vital_signs.oxygen_saturation }}%</span>
            </div>
            <div v-if="assessment.vital_signs.respiratory_rate" class="vital-sign">
              <i class="fas fa-wind"></i>
              <span>RR: {{ assessment.vital_signs.respiratory_rate }} /min</span>
            </div>
          </div>
          <div class="triage-actions">
            <button class="btn btn-sm btn-primary" @click="viewAssessment(assessment.id)">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button class="btn btn-sm btn-secondary" @click="editAssessment(assessment.id)">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button class="btn btn-sm btn-success" @click="reassess(assessment.id)">
              <i class="fas fa-redo"></i>
              Reassess
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assessment History -->
    <div class="assessment-history-section">
      <h2 class="section-title">
        <i class="fas fa-history"></i>
        Recent Assessments
      </h2>
      <div class="history-filters">
        <div class="filter-group">
          <label>Patient</label>
          <select v-model="filters.patient_id" @change="applyFilters">
            <option value="">All Patients</option>
            <option v-for="patient in patients" :key="patient.id" :value="patient.id">
              {{ patient.first_name }} {{ patient.last_name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Date Range</label>
          <input type="date" v-model="filters.date_from" @change="applyFilters">
          <input type="date" v-model="filters.date_to" @change="applyFilters">
        </div>
      </div>
      <div class="assessments-table">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Triage Level</th>
              <th>Symptoms</th>
              <th>Vital Signs</th>
              <th>Assessed By</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="assessment in assessments" :key="assessment.id">
              <td>
                <div class="patient-info">
                  <strong>{{ getPatientName(assessment.patient) }}</strong>
                  <span class="patient-id">ID: {{ assessment.patient.id }}</span>
                </div>
              </td>
              <td>
                <span class="triage-badge" :class="`triage-${assessment.triage_level}`">
                  {{ assessment.triage_level.toUpperCase() }}
                </span>
              </td>
              <td>
                <div class="symptoms-preview">
                  {{ assessment.symptoms.substring(0, 100) }}{{ assessment.symptoms.length > 100 ? '...' : '' }}
                </div>
              </td>
              <td>
                <div class="vitals-preview">
                  <div v-if="assessment.vital_signs.heart_rate" class="vital-mini">
                    HR: {{ assessment.vital_signs.heart_rate }}
                  </div>
                  <div v-if="assessment.vital_signs.blood_pressure" class="vital-mini">
                    BP: {{ assessment.vital_signs.blood_pressure.systolic }}/{{ assessment.vital_signs.blood_pressure.diastolic }}
                  </div>
                  <div v-if="assessment.vital_signs.temperature" class="vital-mini">
                    T: {{ assessment.vital_signs.temperature }}°C
                  </div>
                </div>
              </td>
              <td>
                <div class="assessor-info">
                  {{ getStaffName(assessment.assessor) }}
                </div>
              </td>
              <td>
                <div class="time-info">
                  {{ formatTime(assessment.assessed_at) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-primary" @click="viewAssessment(assessment.id)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-secondary" @click="editAssessment(assessment.id)">
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Assessment Form Modal -->
    <div v-if="showAssessmentForm" class="modal-overlay" @click="closeAssessmentForm">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>New Triage Assessment</h3>
          <button class="modal-close" @click="closeAssessmentForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="submitAssessment" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Patient *</label>
              <select v-model="newAssessment.patient_id" required>
                <option value="">Select Patient</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.first_name }} {{ patient.last_name }} (ID: {{ patient.id }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Emergency Case</label>
              <select v-model="newAssessment.emergency_case_id">
                <option value="">Select Emergency Case</option>
                  <option v-for="emergencyCase in emergencyCases" :key="emergencyCase.id" :value="emergencyCase.id">
                    {{ emergencyCase.case_number }} - {{ getPatientName(emergencyCase.patient) }}
                </option>
              </select>
            </div>
          </div>

          <div class="vital-signs-section">
            <h4>Vital Signs</h4>
            <div class="vital-signs-grid">
              <div class="form-group">
                <label>Heart Rate (bpm)</label>
                <input type="number" v-model="newAssessment.vital_signs.heart_rate" min="30" max="250">
              </div>
              <div class="form-group">
                <label>Blood Pressure - Systolic</label>
                <input type="number" v-model="newAssessment.vital_signs.blood_pressure.systolic" min="50" max="300">
              </div>
              <div class="form-group">
                <label>Blood Pressure - Diastolic</label>
                <input type="number" v-model="newAssessment.vital_signs.blood_pressure.diastolic" min="30" max="200">
              </div>
              <div class="form-group">
                <label>Temperature (°C)</label>
                <input type="number" v-model="newAssessment.vital_signs.temperature" min="30" max="45" step="0.1">
              </div>
              <div class="form-group">
                <label>Oxygen Saturation (%)</label>
                <input type="number" v-model="newAssessment.vital_signs.oxygen_saturation" min="50" max="100">
              </div>
              <div class="form-group">
                <label>Respiratory Rate (/min)</label>
                <input type="number" v-model="newAssessment.vital_signs.respiratory_rate" min="5" max="60">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Symptoms *</label>
            <textarea v-model="newAssessment.symptoms" rows="4" required></textarea>
          </div>

          <div class="form-group">
            <label>Assessment Notes *</label>
            <textarea v-model="newAssessment.assessment_notes" rows="4" required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pain Scale (0-10)</label>
              <input type="number" v-model="newAssessment.pain_scale.score" min="0" max="10">
            </div>
            <div class="form-group">
              <label>GCS Score (3-15)</label>
              <input type="number" v-model="newAssessment.consciousness_level.gcs_score" min="3" max="15">
            </div>
          </div>

          <div class="form-group">
            <label>Allergies</label>
            <textarea v-model="newAssessment.allergies" rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>Current Medications</label>
            <textarea v-model="newAssessment.medications" rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>Medical History</label>
            <textarea v-model="newAssessment.medical_history" rows="3"></textarea>
          </div>

          <div class="triage-level-section">
            <h4>Calculated Triage Level</h4>
            <div class="triage-level-display">
              <span class="triage-badge large" :class="`triage-${calculatedTriageLevel}`">
                {{ calculatedTriageLevel.toUpperCase() }}
              </span>
              <span class="triage-description">
                {{ getTriageDescription(calculatedTriageLevel) }}
              </span>
            </div>
            <div class="form-group">
              <label>Override Triage Level</label>
              <select v-model="newAssessment.triage_level">
                <option value="red">Red (Immediate)</option>
                <option value="orange">Orange (Very Urgent)</option>
                <option value="yellow">Yellow (Urgent)</option>
                <option value="green">Green (Less Urgent)</option>
                <option value="blue">Blue (Non-urgent)</option>
              </select>
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeAssessmentForm">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" @click="submitAssessment" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            Submit Assessment
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading triage data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useTriageAssessment } from '@/scripts/emergency/triageAssessment.js'

export default {
  name: 'TriageAssessment',
  setup() {
    return useTriageAssessment()
  }
}
</script>

<style scoped>
@import '@/assets/css/emergency/triage-assessment.css';
</style>
