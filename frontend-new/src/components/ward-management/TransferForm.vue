<template>
  <div class="transfer-form">
    <div class="form-header">
      <h2 class="form-title">Patient Transfer</h2>
      <p class="form-subtitle">Transfer patient to a different ward or room</p>
    </div>

    <form @submit.prevent="submitTransfer" class="space-y-6">
      <!-- Patient Information -->
      <div class="form-section">
        <h3 class="section-title">Patient Information</h3>
        <div class="form-group">
          <label for="patient" class="form-label">Patient</label>
          <select id="patient" v-model="form.patient_id" class="form-select" required>
            <option value="" disabled>Select Patient</option>
            <option
              v-for="patient in patients"
              :key="patient.id"
              :value="patient.id"
            >
              {{ patient.name }} ({{ patient.patient_id }})
            </option>
          </select>
          <p v-if="errors.patient_id" class="error-message">{{ errors.patient_id[0] }}</p>
        </div>
      </div>

      <!-- Current Location -->
      <div class="form-section">
        <h3 class="section-title">Current Location</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="currentWard" class="form-label">Current Ward</label>
            <input
              id="currentWard"
              v-model="form.current_ward"
              type="text"
              class="form-input"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="currentRoom" class="form-label">Current Room</label>
            <input
              id="currentRoom"
              v-model="form.current_room"
              type="text"
              class="form-input"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Transfer Details -->
      <div class="form-section">
        <h3 class="section-title">Transfer Details</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="newWard" class="form-label">New Ward</label>
            <select id="newWard" v-model="form.new_ward_id" class="form-select" required>
              <option value="" disabled>Select Ward</option>
              <option
                v-for="ward in availableWards"
                :key="ward.id"
                :value="ward.id"
              >
                {{ ward.name }} ({{ ward.available_beds }} beds available)
              </option>
            </select>
            <p v-if="errors.new_ward_id" class="error-message">{{ errors.new_ward_id[0] }}</p>
          </div>
          <div class="form-group">
            <label for="newRoom" class="form-label">New Room</label>
            <select id="newRoom" v-model="form.new_room_id" class="form-select" required>
              <option value="" disabled>Select Room</option>
              <option
                v-for="room in availableRooms"
                :key="room.id"
                :value="room.id"
              >
                Room {{ room.number }} ({{ room.available_beds }} beds available)
              </option>
            </select>
            <p v-if="errors.new_room_id" class="error-message">{{ errors.new_room_id[0] }}</p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="newBed" class="form-label">New Bed</label>
            <select id="newBed" v-model="form.new_bed_id" class="form-select" required>
              <option value="" disabled>Select Bed</option>
              <option
                v-for="bed in availableBeds"
                :key="bed.id"
                :value="bed.id"
              >
                Bed {{ bed.number }} ({{ bed.type }})
              </option>
            </select>
            <p v-if="errors.new_bed_id" class="error-message">{{ errors.new_bed_id[0] }}</p>
          </div>
          <div class="form-group">
            <label for="transferDate" class="form-label">Transfer Date</label>
            <input
              id="transferDate"
              v-model="form.transfer_date"
              type="datetime-local"
              class="form-input"
              required
            />
            <p v-if="errors.transfer_date" class="error-message">{{ errors.transfer_date[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Transfer Reason -->
      <div class="form-section">
        <h3 class="section-title">Transfer Reason</h3>
        <div class="form-group">
          <label for="reason" class="form-label">Reason for Transfer</label>
          <select id="reason" v-model="form.reason" class="form-select" required>
            <option value="" disabled>Select Reason</option>
            <option value="medical">Medical Condition</option>
            <option value="specialist">Specialist Care</option>
            <option value="isolation">Isolation Required</option>
            <option value="capacity">Ward Capacity</option>
            <option value="patient_request">Patient Request</option>
            <option value="other">Other</option>
          </select>
          <p v-if="errors.reason" class="error-message">{{ errors.reason[0] }}</p>
        </div>

        <div class="form-group">
          <label for="notes" class="form-label">Additional Notes</label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="4"
            class="form-textarea"
            placeholder="Enter any additional notes about the transfer..."
          ></textarea>
          <p v-if="errors.notes" class="error-message">{{ errors.notes[0] }}</p>
        </div>
      </div>

      <!-- Transferring Staff -->
      <div class="form-section">
        <h3 class="section-title">Transferring Staff</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="transferringDoctor" class="form-label">Transferring Doctor</label>
            <select id="transferringDoctor" v-model="form.transferring_doctor_id" class="form-select" required>
              <option value="" disabled>Select Doctor</option>
              <option
                v-for="doctor in doctors"
                :key="doctor.id"
                :value="doctor.id"
              >
                Dr. {{ doctor.name }} ({{ doctor.specialization }})
              </option>
            </select>
            <p v-if="errors.transferring_doctor_id" class="error-message">{{ errors.transferring_doctor_id[0] }}</p>
          </div>
          <div class="form-group">
            <label for="receivingDoctor" class="form-label">Receiving Doctor</label>
            <select id="receivingDoctor" v-model="form.receiving_doctor_id" class="form-select" required>
              <option value="" disabled>Select Doctor</option>
              <option
                v-for="doctor in receivingDoctors"
                :key="doctor.id"
                :value="doctor.id"
              >
                Dr. {{ doctor.name }} ({{ doctor.specialization }})
              </option>
            </select>
            <p v-if="errors.receiving_doctor_id" class="error-message">{{ errors.receiving_doctor_id[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="cancelTransfer" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ loading ? 'Processing...' : 'Transfer Patient' }}
        </button>
      </div>

      <div v-if="successMessage" class="success-message">
        <p class="font-medium text-green-800">{{ successMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script>
import { useTransferForm } from '@/composables/useTransferForm'

export default {
  name: 'TransferForm',
  props: {
    patient: {
      type: Object,
      default: null
    },
    currentWard: {
      type: Object,
      default: null
    },
    currentRoom: {
      type: Object,
      default: null
    },
    wards: {
      type: Array,
      default: () => []
    },
    patients: {
      type: Array,
      default: () => []
    },
    doctors: {
      type: Array,
      default: () => []
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    return useTransferForm(props, { emit })
  }
}
</script>
