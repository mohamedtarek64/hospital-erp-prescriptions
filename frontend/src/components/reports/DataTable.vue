<template>
  <div class="data-table">
    <!-- Table Header -->
    <div class="table-header">
      <div class="header-left">
        <h3 class="table-title">{{ title }}</h3>
        <p v-if="subtitle" class="table-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-right">
        <div class="table-actions">
          <button @click="refreshData" class="btn-icon" :disabled="isLoading">
            <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          </button>
          <button @click="exportData" class="btn-icon">
            <ArrowDownTrayIcon class="h-4 w-4" />
          </button>
          <button @click="toggleFullscreen" class="btn-icon">
            <ArrowsPointingOutIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table Controls -->
    <div class="table-controls">
      <div class="controls-left">
        <div class="search-box">
          <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="search-input"
            @input="onSearch"
          />
        </div>
        
        <div class="view-options">
          <select v-model="itemsPerPage" @change="onItemsPerPageChange" class="view-select">
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      <div class="controls-right">
        <div class="table-info">
          <span class="info-text">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
          </span>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <div v-if="isLoading" class="table-loading">
        <div class="loading-spinner">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">Loading data...</p>
        </div>
      </div>

      <div v-else-if="error" class="table-error">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="error-text">{{ error }}</p>
        <button @click="refreshData" class="btn-secondary mt-4">
          Try Again
        </button>
      </div>

      <div v-else class="table-wrapper">
        <table class="data-table-table">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="table-header-cell"
                :class="getColumnClasses(column)"
                @click="sortBy(column.key)"
              >
                <div class="header-content">
                  <span class="header-text">{{ column.title }}</span>
                  <div v-if="column.sortable" class="sort-indicators">
                    <ChevronUpIcon 
                      class="h-4 w-4 sort-icon"
                      :class="{ 'active': sortField === column.key && sortOrder === 'asc' }"
                    />
                    <ChevronDownIcon 
                      class="h-4 w-4 sort-icon"
                      :class="{ 'active': sortField === column.key && sortOrder === 'desc' }"
                    />
                  </div>
                </div>
              </th>
              <th v-if="showActions" class="table-header-cell actions-header">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in paginatedData"
              :key="getRowKey(row, index)"
              class="table-row"
              :class="getRowClasses(row, index)"
              @click="onRowClick(row, index)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="table-cell"
                :class="getCellClasses(column, row)"
              >
                <div class="cell-content">
                  <component
                    v-if="column.component"
                    :is="column.component"
                    :data="row"
                    :value="getCellValue(row, column.key)"
                    :column="column"
                  />
                  <span v-else class="cell-text">
                    {{ formatCellValue(getCellValue(row, column.key), column) }}
                  </span>
                </div>
              </td>
              <td v-if="showActions" class="table-cell actions-cell">
                <div class="action-buttons">
                  <button
                    v-for="action in getRowActions(row)"
                    :key="action.key"
                    @click.stop="executeAction(action, row)"
                    class="action-btn"
                    :class="action.class"
                    :disabled="action.disabled"
                  >
                    <component :is="action.icon" class="h-4 w-4" />
                    <span v-if="action.showLabel">{{ action.label }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredData.length === 0" class="empty-state">
          <DocumentIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="empty-text">No data available</p>
          <p class="empty-subtext">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
      </div>
      
      <div class="pagination-controls">
        <button
          @click="goToPage(1)"
          class="pagination-btn"
          :disabled="currentPage === 1"
        >
          <ChevronDoubleLeftIcon class="h-4 w-4" />
        </button>
        
        <button
          @click="goToPage(currentPage - 1)"
          class="pagination-btn"
          :disabled="currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="page-number"
            :class="{ 'active': page === currentPage }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          class="pagination-btn"
          :disabled="currentPage === totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
        
        <button
          @click="goToPage(totalPages)"
          class="pagination-btn"
          :disabled="currentPage === totalPages"
        >
          <ChevronDoubleRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <div v-if="isFullscreen" class="fullscreen-modal" @click="closeFullscreen">
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <h2 class="fullscreen-title">{{ title }}</h2>
          <button @click="closeFullscreen" class="btn-close">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="fullscreen-table">
          <!-- Fullscreen table content would go here -->
          <p class="text-center text-gray-500">Fullscreen table view</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDataTable } from '@/composables/useDataTable'
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'DataTable',
  components: {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    ArrowsPointingOutIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    DocumentIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    XMarkIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true
    },
    actions: {
      type: Array,
      default: () => []
    },
    showActions: {
      type: Boolean,
      default: true
    },
    searchable: {
      type: Boolean,
      default: true
    },
    sortable: {
      type: Boolean,
      default: true
    },
    paginated: {
      type: Boolean,
      default: true
    },
    itemsPerPageOptions: {
      type: Array,
      default: () => [10, 25, 50, 100]
    },
    defaultItemsPerPage: {
      type: Number,
      default: 25
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['row-click', 'action-click', 'sort-change', 'page-change', 'refresh', 'export'],
  setup(props, { emit }) {
    return useDataTable(props, { emit })
  }
}
</script>