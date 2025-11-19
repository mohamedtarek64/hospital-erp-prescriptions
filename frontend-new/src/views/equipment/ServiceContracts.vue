<template>
  <div class="service-contracts-container">
    <!-- Header Section -->
    <div class="contracts-header">
      <div class="header-content">
        <h1 class="page-title">Service Contracts</h1>
        <p class="page-subtitle">Manage equipment service contracts and warranties</p>
      </div>
      <div class="header-actions">
        <button @click="showAddContractForm = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          Add Contract
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status" @change="filterContracts">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Type:</label>
        <select v-model="filters.type" @change="filterContracts">
          <option value="">All Types</option>
          <option value="warranty">Warranty</option>
          <option value="maintenance">Maintenance</option>
          <option value="service">Service</option>
          <option value="support">Support</option>
          <option value="calibration">Calibration</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Equipment:</label>
        <select v-model="filters.equipment" @change="filterContracts">
          <option value="">All Equipment</option>
          <option v-for="equipment in equipmentList" :key="equipment.id" :value="equipment.id">
            {{ equipment.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <button @click="clearFilters" class="btn-secondary">Clear Filters</button>
      </div>
    </div>

    <!-- Contracts Grid -->
    <div class="contracts-grid">
      <div v-for="contract in filteredContracts" :key="contract.id" class="contract-card">
        <div class="contract-header">
          <h3 class="contract-title">{{ contract.contract_number }}</h3>
          <span :class="['status-badge', contract.status_color]">
            {{ contract.status }}
          </span>
        </div>
        
        <div class="contract-details">
          <div class="detail-row">
            <span class="label">Equipment:</span>
            <span class="value">{{ contract.equipment?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Vendor:</span>
            <span class="value">{{ contract.vendor?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Type:</span>
            <span class="value">{{ contract.contract_type }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Duration:</span>
            <span class="value">{{ contract.start_date }} - {{ contract.end_date }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Cost:</span>
            <span class="value">${{ contract.cost }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Days Remaining:</span>
            <span class="value" :class="{ 'expiring': contract.is_expiring_soon }">
              {{ contract.days_until_expiration }}
            </span>
          </div>
        </div>

        <div class="contract-actions">
          <button @click="viewContract(contract)" class="btn-outline">
            <i class="fas fa-eye"></i>
            View
          </button>
          <button @click="editContract(contract)" class="btn-outline">
            <i class="fas fa-edit"></i>
            Edit
          </button>
          <button @click="deleteContract(contract)" class="btn-danger">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Contract Modal -->
    <div v-if="showAddContractForm || showEditContractForm" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddContractForm ? 'Add New Contract' : 'Edit Contract' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveContract" class="contract-form">
          <div class="form-row">
            <div class="form-group">
              <label>Equipment *</label>
              <select v-model="contractForm.equipment_id" required>
                <option value="">Select Equipment</option>
                <option v-for="equipment in equipmentList" :key="equipment.id" :value="equipment.id">
                  {{ equipment.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Vendor *</label>
              <select v-model="contractForm.vendor_id" required>
                <option value="">Select Vendor</option>
                <option v-for="vendor in vendorList" :key="vendor.id" :value="vendor.id">
                  {{ vendor.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contract Number</label>
              <input v-model="contractForm.contract_number" type="text" placeholder="Auto-generated if empty">
            </div>
            <div class="form-group">
              <label>Contract Type *</label>
              <select v-model="contractForm.contract_type" required>
                <option value="">Select Type</option>
                <option value="warranty">Warranty</option>
                <option value="maintenance">Maintenance</option>
                <option value="service">Service</option>
                <option value="support">Support</option>
                <option value="calibration">Calibration</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Date *</label>
              <input v-model="contractForm.start_date" type="date" required>
            </div>
            <div class="form-group">
              <label>End Date *</label>
              <input v-model="contractForm.end_date" type="date" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Cost *</label>
              <input v-model="contractForm.cost" type="number" step="0.01" required>
            </div>
            <div class="form-group">
              <label>Payment Terms</label>
              <select v-model="contractForm.payment_terms">
                <option value="one_time">One Time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Contact Person</label>
            <input v-model="contractForm.contact_person" type="text">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contact Phone</label>
              <input v-model="contractForm.contact_phone" type="tel">
            </div>
            <div class="form-group">
              <label>Contact Email</label>
              <input v-model="contractForm.contact_email" type="email">
            </div>
          </div>

          <div class="form-group">
            <label>Terms & Conditions</label>
            <textarea v-model="contractForm.terms" rows="4" placeholder="Contract terms and conditions..."></textarea>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="contractForm.notes" rows="3" placeholder="Additional notes..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save Contract' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useServiceContracts } from '@/scripts/equipment/serviceContracts'

export default {
  name: 'ServiceContracts',
  setup() {
    return useServiceContracts()
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/service-contracts.css';
</style>
