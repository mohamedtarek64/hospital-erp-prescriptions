<template>
  <div class="inventory-management">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-boxes"></i>
          Inventory Management
        </h1>
        <p class="page-subtitle">Manage equipment inventory and stock levels</p>
      </div>
      <div class="header-actions">
        <button @click="showAddItemModal = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          Add Item
        </button>
        <button @click="exportInventory" class="btn-secondary">
          <i class="fas fa-download"></i>
          Export
        </button>
        <button @click="refreshInventory" class="btn-refresh">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalItems }}</h3>
          <p>Total Items</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ lowStockItems }}</h3>
          <p>Low Stock</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-ban"></i>
        </div>
        <div class="stat-content">
          <h3>{{ outOfStockItems }}</h3>
          <p>Out of Stock</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>${{ totalInventoryValue.toLocaleString() }}</h3>
          <p>Total Value</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          @input="searchItems"
          type="text" 
          placeholder="Search inventory items..."
        >
      </div>
      <div class="filters">
        <select v-model="selectedCategory" @change="filterItems">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <select v-model="selectedStatus" @change="filterItems">
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
        <select v-model="selectedLocation" @change="filterItems">
          <option value="">All Locations</option>
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="inventory-table-container">
      <div class="table-header">
        <h2>Inventory Items ({{ filteredItems.length }})</h2>
        <div class="table-actions">
          <select v-model="sortBy" @change="sortItems">
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="value">Sort by Value</option>
            <option value="last_updated">Sort by Last Updated</option>
          </select>
          <button @click="bulkUpdate" class="btn-secondary">
            <i class="fas fa-edit"></i>
            Bulk Update
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
              </th>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Stock</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" :class="{ selected: selectedItems.includes(item.id) }">
              <td>
                <input type="checkbox" v-model="selectedItems" :value="item.id">
              </td>
              <td>
                <div class="item-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.sku || 'No SKU' }}</small>
                </div>
              </td>
              <td>{{ item.category?.name }}</td>
              <td>
                <span :class="getStockStatusClass(item)">
                  {{ item.quantity }}
                </span>
              </td>
              <td>{{ item.minimum_stock }}</td>
              <td>${{ item.unit_price?.toFixed(2) }}</td>
              <td>${{ (item.quantity * item.unit_price)?.toFixed(2) }}</td>
              <td>{{ item.location }}</td>
              <td>
                <span :class="['status-badge', getStockStatus(item)]">
                  {{ getStockStatus(item) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewItem(item)" class="btn-sm btn-primary">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="editItem(item)" class="btn-sm btn-secondary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="adjustStock(item)" class="btn-sm btn-info">
                    <i class="fas fa-plus-minus"></i>
                  </button>
                  <button @click="deleteItem(item)" class="btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div v-if="lowStockItems > 0" class="alert-section">
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="alert-content">
          <h4>Low Stock Alert</h4>
          <p>{{ lowStockItems }} items are running low on stock and need to be reordered.</p>
          <button @click="viewLowStockItems" class="btn-warning">
            View Low Stock Items
          </button>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddItemModal" class="modal-overlay" @click="showAddItemModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Inventory Item</h3>
          <button @click="showAddItemModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addItem">
            <div class="form-row">
              <div class="form-group">
                <label>Item Name</label>
                <input v-model="newItem.name" type="text" required>
              </div>
              <div class="form-group">
                <label>SKU</label>
                <input v-model="newItem.sku" type="text">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select v-model="newItem.category_id" required>
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Location</label>
                <input v-model="newItem.location" type="text" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quantity</label>
                <input v-model="newItem.quantity" type="number" min="0" required>
              </div>
              <div class="form-group">
                <label>Minimum Stock</label>
                <input v-model="newItem.minimum_stock" type="number" min="0" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Unit Price</label>
                <input v-model="newItem.unit_price" type="number" step="0.01" min="0" required>
              </div>
              <div class="form-group">
                <label>Supplier</label>
                <input v-model="newItem.supplier" type="text">
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newItem.description" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddItemModal = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showStockModal" class="modal-overlay" @click="showStockModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Adjust Stock - {{ selectedItem?.name }}</h3>
          <button @click="showStockModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="adjustStockQuantity">
            <div class="form-group">
              <label>Current Quantity</label>
              <input :value="selectedItem?.quantity" type="number" disabled>
            </div>
            <div class="form-group">
              <label>Adjustment Type</label>
              <select v-model="stockAdjustment.type" required>
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="set">Set Quantity</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input v-model="stockAdjustment.quantity" type="number" min="0" required>
            </div>
            <div class="form-group">
              <label>Reason</label>
              <select v-model="stockAdjustment.reason" required>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="damage">Damage</option>
                <option value="theft">Theft</option>
                <option value="adjustment">Manual Adjustment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea v-model="stockAdjustment.notes" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showStockModal = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Adjust Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Item Details Modal -->
    <div v-if="selectedItem" class="modal-overlay" @click="selectedItem = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedItem.name }} - Details</h3>
          <button @click="selectedItem = null" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="item-details-grid">
            <div class="detail-section">
              <h4>Basic Information</h4>
              <div class="detail-row">
                <label>SKU:</label>
                <span>{{ selectedItem.sku || 'No SKU' }}</span>
              </div>
              <div class="detail-row">
                <label>Category:</label>
                <span>{{ selectedItem.category?.name }}</span>
              </div>
              <div class="detail-row">
                <label>Location:</label>
                <span>{{ selectedItem.location }}</span>
              </div>
              <div class="detail-row">
                <label>Supplier:</label>
                <span>{{ selectedItem.supplier || 'No supplier' }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>Stock Information</h4>
              <div class="detail-row">
                <label>Current Quantity:</label>
                <span :class="getStockStatusClass(selectedItem)">
                  {{ selectedItem.quantity }}
                </span>
              </div>
              <div class="detail-row">
                <label>Minimum Stock:</label>
                <span>{{ selectedItem.minimum_stock }}</span>
              </div>
              <div class="detail-row">
                <label>Unit Price:</label>
                <span>${{ selectedItem.unit_price?.toFixed(2) }}</span>
              </div>
              <div class="detail-row">
                <label>Total Value:</label>
                <span>${{ (selectedItem.quantity * selectedItem.unit_price)?.toFixed(2) }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>Description</h4>
              <p>{{ selectedItem.description || 'No description available' }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editItem(selectedItem)" class="btn-primary">
            <i class="fas fa-edit"></i>
            Edit Item
          </button>
          <button @click="adjustStock(selectedItem)" class="btn-info">
            <i class="fas fa-plus-minus"></i>
            Adjust Stock
          </button>
          <button @click="selectedItem = null" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useInventoryManagement } from '@/scripts/equipment/inventoryManagement.js'

export default {
  name: 'InventoryManagement',
  setup() {
    return useInventoryManagement()
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/inventory-management.css';
</style>
