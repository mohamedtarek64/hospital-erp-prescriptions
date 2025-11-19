<template>
  <div class="emergency-room">
    <!-- Header -->
    <div class="emergency-room-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-hospital"></i>
          Emergency Room Management
        </h1>
        <p class="page-subtitle">Real-time emergency room bed allocation and patient management</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showBedAllocationForm = true">
          <i class="fas fa-bed"></i>
          Allocate Bed
        </button>
        <button class="btn btn-secondary" @click="refreshData">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Emergency Room Status -->
    <div class="room-status-section">
      <h2 class="section-title">
        <i class="fas fa-chart-pie"></i>
        Emergency Room Status
      </h2>
      <div class="status-grid">
        <div class="status-card">
          <div class="status-icon occupied">
            <i class="fas fa-bed"></i>
          </div>
          <div class="status-content">
            <div class="status-value">{{ roomStatus.occupied }}</div>
            <div class="status-label">Occupied Beds</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon available">
            <i class="fas fa-bed"></i>
          </div>
          <div class="status-content">
            <div class="status-value">{{ roomStatus.available }}</div>
            <div class="status-label">Available Beds</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon maintenance">
            <i class="fas fa-wrench"></i>
          </div>
          <div class="status-content">
            <div class="status-value">{{ roomStatus.maintenance }}</div>
            <div class="status-label">Maintenance</div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-icon total">
            <i class="fas fa-hospital"></i>
          </div>
          <div class="status-content">
            <div class="status-value">{{ roomStatus.total }}</div>
            <div class="status-label">Total Beds</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bed Layout -->
    <div class="bed-layout-section">
      <h2 class="section-title">
        <i class="fas fa-th-large"></i>
        Bed Layout
      </h2>
      <div class="bed-layout">
        <div 
          v-for="bed in beds" 
          :key="bed.id"
          class="bed-card"
          :class="`bed-${bed.status}`"
        >
          <div class="bed-header">
            <span class="bed-number">Bed {{ bed.bed_number }}</span>
            <span class="bed-status" :class="`status-${bed.status}`">
              {{ bed.status.toUpperCase() }}
            </span>
          </div>
          <div class="bed-content">
            <div v-if="bed.patient" class="patient-info">
              <div class="patient-name">
                <strong>{{ getPatientName(bed.patient) }}</strong>
              </div>
              <div class="patient-details">
                <div class="detail-item">
                  <i class="fas fa-id-card"></i>
                  ID: {{ bed.patient.id }}
                </div>
                <div class="detail-item">
                  <i class="fas fa-clock"></i>
                  Admitted: {{ formatTime(bed.admission_time) }}
                </div>
                <div v-if="bed.triage_level" class="detail-item">
                  <i class="fas fa-stethoscope"></i>
                  Triage: 
                  <span class="triage-badge" :class="`triage-${bed.triage_level}`">
                    {{ bed.triage_level.toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="bed-empty">
              <i class="fas fa-bed"></i>
              <span>Available</span>
            </div>
          </div>
          <div class="bed-actions">
            <button v-if="bed.status === 'available'" class="btn btn-sm btn-primary" @click="allocateBed(bed.id)">
              <i class="fas fa-user-plus"></i>
              Allocate
            </button>
            <button v-if="bed.patient" class="btn btn-sm btn-secondary" @click="viewPatient(bed.patient.id)">
              <i class="fas fa-eye"></i>
              View Patient
            </button>
            <button v-if="bed.patient" class="btn btn-sm btn-success" @click="dischargePatient(bed.id)">
              <i class="fas fa-sign-out-alt"></i>
              Discharge
            </button>
            <button v-if="bed.status === 'maintenance'" class="btn btn-sm btn-warning" @click="repairBed(bed.id)">
              <i class="fas fa-wrench"></i>
              Repair
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Patients -->
    <div class="active-patients-section">
      <h2 class="section-title">
        <i class="fas fa-users"></i>
        Active Patients
      </h2>
      <div class="patients-grid">
        <div 
          v-for="patient in activePatients" 
          :key="patient.id"
          class="patient-card"
          :class="`triage-${patient.triage_level}`"
        >
          <div class="patient-header">
            <div class="patient-name">
              <strong>{{ getPatientName(patient) }}</strong>
              <span class="patient-id">ID: {{ patient.id }}</span>
            </div>
            <div class="triage-level">
              <span class="triage-badge" :class="`triage-${patient.triage_level}`">
                {{ patient.triage_level.toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="patient-content">
            <div class="patient-info">
              <div class="info-item">
                <i class="fas fa-bed"></i>
                <span>Bed: {{ patient.bed_number }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>Admitted: {{ formatTime(patient.admission_time) }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-user-md"></i>
                <span>Doctor: {{ getStaffName(patient.assigned_doctor) }}</span>
              </div>
            </div>
            <div class="patient-symptoms">
              <strong>Symptoms:</strong>
              <p>{{ patient.symptoms }}</p>
            </div>
            <div class="patient-vitals">
              <div v-if="patient.vital_signs.heart_rate" class="vital-sign">
                <i class="fas fa-heartbeat"></i>
                <span>HR: {{ patient.vital_signs.heart_rate }} bpm</span>
              </div>
              <div v-if="patient.vital_signs.blood_pressure" class="vital-sign">
                <i class="fas fa-tint"></i>
                <span>BP: {{ patient.vital_signs.blood_pressure.systolic }}/{{ patient.vital_signs.blood_pressure.diastolic }}</span>
              </div>
              <div v-if="patient.vital_signs.temperature" class="vital-sign">
                <i class="fas fa-thermometer-half"></i>
                <span>T: {{ patient.vital_signs.temperature }}°C</span>
              </div>
              <div v-if="patient.vital_signs.oxygen_saturation" class="vital-sign">
                <i class="fas fa-lungs"></i>
                <span>SpO2: {{ patient.vital_signs.oxygen_saturation }}%</span>
              </div>
            </div>
          </div>
          <div class="patient-actions">
            <button class="btn btn-sm btn-primary" @click="viewPatient(patient.id)">
              <i class="fas fa-eye"></i>
              View
            </button>
            <button class="btn btn-sm btn-secondary" @click="updateVitals(patient.id)">
              <i class="fas fa-heartbeat"></i>
              Update Vitals
            </button>
            <button class="btn btn-sm btn-success" @click="dischargePatient(patient.bed_id)">
              <i class="fas fa-sign-out-alt"></i>
              Discharge
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bed Allocation Modal -->
    <div v-if="showBedAllocationForm" class="modal-overlay" @click="closeBedAllocationForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Allocate Bed</h3>
          <button class="modal-close" @click="closeBedAllocationForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="allocateBedToPatient" class="modal-body">
          <div class="form-group">
            <label>Available Beds</label>
            <select v-model="bedAllocation.bed_id" required>
              <option value="">Select Bed</option>
              <option v-for="bed in availableBeds" :key="bed.id" :value="bed.id">
                Bed {{ bed.bed_number }} - {{ bed.room_type }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Patient *</label>
            <select v-model="bedAllocation.patient_id" required>
              <option value="">Select Patient</option>
              <option v-for="patient in waitingPatients" :key="patient.id" :value="patient.id">
                {{ patient.first_name }} {{ patient.last_name }} (ID: {{ patient.id }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Assigned Doctor</label>
            <select v-model="bedAllocation.assigned_doctor_id">
              <option value="">Select Doctor</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.first_name }} {{ doctor.last_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Admission Notes</label>
            <textarea v-model="bedAllocation.notes" rows="3"></textarea>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeBedAllocationForm">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" @click="allocateBedToPatient" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            Allocate Bed
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading emergency room data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useEmergencyRoom } from '@/scripts/emergency/emergencyRoom.js'

export default {
  name: 'EmergencyRoom',
  setup() {
    return useEmergencyRoom()
  }
}
</script>

<style scoped>
@import '@/assets/css/emergency/emergency-room.css';
</style>
