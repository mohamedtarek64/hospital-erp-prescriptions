<template>
  <div class="report-filter">
    <div class="filter-header">
      <h3 class="filter-title">Report Filters</h3>
      <div class="filter-actions">
        <button @click="resetFilters" class="btn-secondary btn-sm">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Reset
        </button>
        <button @click="applyFilters" class="btn-primary btn-sm">
          <FunnelIcon class="h-4 w-4 mr-2" />
          Apply
        </button>
      </div>
    </div>

    <div class="filter-content">
      <!-- Date Range Filter -->
      <div class="filter-section">
        <h4 class="section-title">Date Range</h4>
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">Period</label>
            <select v-model="filters.period" class="filter-select">
              <option value="">Select Period</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="this_year">This Year</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div v-if="filters.period === 'custom'" class="filter-item">
            <label class="filter-label">Start Date</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="filter-input"
            />
          </div>

          <div v-if="filters.period === 'custom'" class="filter-item">
            <label class="filter-label">End Date</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="filter-input"
            />
          </div>
        </div>
      </div>

      <!-- Department Filter -->
      <div class="filter-section">
        <h4 class="section-title">Department</h4>
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">Department</label>
            <select v-model="filters.department" class="filter-select">
              <option value="">All Departments</option>
              <option
                v-for="dept in departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="filter-section">
        <h4 class="section-title">Status</h4>
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">Status</label>
            <select v-model="filters.status" class="filter-select">
              <option value="">All Statuses</option>
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="filter-section">
        <h4 class="section-title">Category</h4>
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">Category</label>
            <select v-model="filters.category" class="filter-select">
              <option value="">All Categories</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- User Filter -->
      <div class="filter-section">
        <h4 class="section-title">User</h4>
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">User</label>
            <select v-model="filters.user" class="filter-select">
              <option value="">All Users</option>
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="filter-section">
        <h4 class="section-title">
          Advanced Filters
          <button @click="toggleAdvanced" class="toggle-btn">
            <ChevronDownIcon 
              class="h-4 w-4 transition-transform" 
              :class="{ 'rotate-180': showAdvanced }"
            />
          </button>
        </h4>
        
        <div v-if="showAdvanced" class="advanced-filters">
          <div class="filter-group">
            <div class="filter-item">
              <label class="filter-label">Minimum Value</label>
              <input
                v-model.number="filters.minValue"
                type="number"
                class="filter-input"
                placeholder="0"
              />
            </div>

            <div class="filter-item">
              <label class="filter-label">Maximum Value</label>
              <input
                v-model.number="filters.maxValue"
                type="number"
                class="filter-input"
                placeholder="1000000"
              />
            </div>

            <div class="filter-item">
              <label class="filter-label">Sort By</label>
              <select v-model="filters.sortBy" class="filter-select">
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="value">Value</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div class="filter-item">
              <label class="filter-label">Sort Order</label>
              <select v-model="filters.sortOrder" class="filter-select">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="filter-section">
        <h4 class="section-title">Quick Filters</h4>
        <div class="quick-filters">
          <button
            v-for="quickFilter in quickFilters"
            :key="quickFilter.key"
            @click="applyQuickFilter(quickFilter)"
            class="quick-filter-btn"
            :class="{ 'active': isQuickFilterActive(quickFilter) }"
          >
            {{ quickFilter.label }}
          </button>
        </div>
      </div>

      <!-- Filter Summary -->
      <div v-if="activeFiltersCount > 0" class="filter-summary">
        <div class="summary-header">
          <span class="summary-title">Active Filters ({{ activeFiltersCount }})</span>
          <button @click="clearAllFilters" class="clear-all-btn">
            Clear All
          </button>
        </div>
        <div class="active-filters">
          <div
            v-for="filter in activeFilters"
            :key="filter.key"
            class="active-filter"
          >
            <span class="filter-name">{{ filter.label }}:</span>
            <span class="filter-value">{{ filter.value }}</span>
            <button @click="removeFilter(filter.key)" class="remove-filter-btn">
              <XMarkIcon class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useReportFilter } from '@/composables/useReportFilter'
import { 
  ArrowPathIcon, 
  FunnelIcon, 
  ChevronDownIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'

export default {
  name: 'ReportFilter',
  components: {
    ArrowPathIcon,
    FunnelIcon,
    ChevronDownIcon,
    XMarkIcon
  },
  props: {
    departments: {
      type: Array,
      default: () => []
    },
    users: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      default: () => []
    },
    statusOptions: {
      type: Array,
      default: () => [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    quickFilters: {
      type: Array,
      default: () => [
        { key: 'today', label: 'Today' },
        { key: 'this_week', label: 'This Week' },
        { key: 'this_month', label: 'This Month' },
        { key: 'active_only', label: 'Active Only' },
        { key: 'high_value', label: 'High Value' }
      ]
    },
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['filter-change', 'filter-reset', 'filter-apply'],
  setup(props, { emit }) {
    return useReportFilter(props, { emit })
  }
}
</script>