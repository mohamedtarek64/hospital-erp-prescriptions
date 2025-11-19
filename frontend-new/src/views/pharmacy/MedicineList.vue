<template>
  <div class="medicine-list">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800">Medicine List</h1>
      <button @click="showAddModal = true" class="add-btn">
        <i class="fas fa-plus"></i>
        Add Medicine
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search medicines..."
          class="search-input"
        >
        <select v-model="filters.category" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Medicine Grid -->
    <div class="medicine-grid">
      <div v-for="medicine in filteredMedicines" :key="medicine.id" class="medicine-card">
        <div class="medicine-header">
          <h3 class="medicine-name">{{ medicine.name }}</h3>
          <span :class="getStatusClass(medicine.status)">{{ medicine.status }}</span>
        </div>
        
        <div class="medicine-details">
          <p class="medicine-info">
            <i class="fas fa-tag"></i>
            {{ medicine.generic_name }}
          </p>
          <p class="medicine-info">
            <i class="fas fa-industry"></i>
            {{ medicine.manufacturer }}
          </p>
          <p class="medicine-info">
            <i class="fas fa-dollar-sign"></i>
            ${{ medicine.unit_price }}
          </p>
        </div>

        <div class="medicine-actions">
          <button @click="editMedicine(medicine)" class="action-btn edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="viewMedicine(medicine)" class="action-btn view">
            <i class="fas fa-eye"></i>
          </button>
          <button @click="deleteMedicine(medicine.id)" class="action-btn delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? 'Add Medicine' : 'Edit Medicine' }}</h2>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveMedicine" class="medicine-form">
          <div class="form-group">
            <label>Medicine Name *</label>
            <input v-model="medicineForm.name" type="text" required>
          </div>

          <div class="form-group">
            <label>Generic Name</label>
            <input v-model="medicineForm.generic_name" type="text">
          </div>

          <div class="form-group">
            <label>Brand Name</label>
            <input v-model="medicineForm.brand_name" type="text">
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="medicineForm.category_id">
              <option value="">Select Category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Manufacturer</label>
            <input v-model="medicineForm.manufacturer" type="text">
          </div>

          <div class="form-group">
            <label>Unit Type</label>
            <select v-model="medicineForm.unit_type">
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
              <option value="cream">Cream</option>
              <option value="drops">Drops</option>
            </select>
          </div>

          <div class="form-group">
            <label>Unit Price *</label>
            <input v-model="medicineForm.unit_price" type="number" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="medicineForm.description" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePharmacyStore } from '@/stores/pharmacy'

export default {
  name: 'MedicineList',
  setup() {
    const pharmacyStore = usePharmacyStore()
    
    const medicines = ref([])
    const categories = ref([])
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const editingMedicine = ref(null)

    const filters = ref({
      search: '',
      category: '',
      status: ''
    })

    const medicineForm = ref({
      name: '',
      generic_name: '',
      brand_name: '',
      category_id: '',
      manufacturer: '',
      unit_type: 'tablet',
      unit_price: '',
      description: ''
    })

    const filteredMedicines = computed(() => {
      let filtered = medicines.value

      if (filters.value.search) {
        filtered = filtered.filter(medicine =>
          medicine.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          medicine.generic_name.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }

      if (filters.value.category) {
        filtered = filtered.filter(medicine => medicine.category_id == filters.value.category)
      }

      if (filters.value.status) {
        filtered = filtered.filter(medicine => medicine.status === filters.value.status)
      }

      return filtered
    })

    const loadData = async () => {
      try {
        await Promise.all([
          pharmacyStore.fetchMedicines(),
          pharmacyStore.fetchCategories()
        ])
        medicines.value = pharmacyStore.medicines
        categories.value = pharmacyStore.categories
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    const editMedicine = (medicine) => {
      editingMedicine.value = medicine
      medicineForm.value = { ...medicine }
      showEditModal.value = true
    }

    const viewMedicine = (medicine) => {
      // Navigate to medicine details
      console.log('View medicine:', medicine)
    }

    const deleteMedicine = async (medicineId) => {
      if (confirm('Are you sure you want to delete this medicine?')) {
        try {
          await pharmacyStore.deleteMedicine(medicineId)
          await loadData()
        } catch (error) {
          console.error('Error deleting medicine:', error)
        }
      }
    }

    const saveMedicine = async () => {
      try {
        if (showAddModal.value) {
          await pharmacyStore.createMedicine(medicineForm.value)
        } else {
          await pharmacyStore.updateMedicine(editingMedicine.value.id, medicineForm.value)
        }
        await loadData()
        closeModal()
      } catch (error) {
        console.error('Error saving medicine:', error)
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      editingMedicine.value = null
      medicineForm.value = {
        name: '',
        generic_name: '',
        brand_name: '',
        category_id: '',
        manufacturer: '',
        unit_type: 'tablet',
        unit_price: '',
        description: ''
      }
    }

    const getStatusClass = (status) => {
      return status === 'active' ? 'status-active' : 'status-inactive'
    }

    onMounted(() => {
      loadData()
    })

    return {
      medicines,
      categories,
      filters,
      medicineForm,
      filteredMedicines,
      showAddModal,
      showEditModal,
      editMedicine,
      viewMedicine,
      deleteMedicine,
      saveMedicine,
      closeModal,
      getStatusClass
    }
  }
}
</script>

<style scoped>
/* Styles are imported from pharmacy.css */
</style>
