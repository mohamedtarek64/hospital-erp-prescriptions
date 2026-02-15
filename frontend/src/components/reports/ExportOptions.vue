<template>
  <div class="export-options">
    <div class="export-header">
      <h3 class="export-title">Export Options</h3>
      <p class="export-subtitle">Choose format and options for data export</p>
    </div>

    <div class="export-content">
      <!-- Format Selection -->
      <div class="format-section">
        <h4 class="section-title">Export Format</h4>
        <div class="format-grid">
          <div
            v-for="format in exportFormats"
            :key="format.value"
            class="format-option"
            :class="{ 'selected': selectedFormat === format.value }"
            @click="selectFormat(format.value)"
          >
            <div class="format-icon">
              <component :is="format.icon" class="h-8 w-8" />
            </div>
            <div class="format-info">
              <h5 class="format-name">{{ format.name }}</h5>
              <p class="format-description">{{ format.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="options-section">
        <h4 class="section-title">Export Options</h4>
        <div class="options-grid">
          <div class="option-group">
            <label class="option-label">Include Headers</label>
            <input
              v-model="exportOptions.includeHeaders"
              type="checkbox"
              class="option-checkbox"
            />
          </div>

          <div class="option-group">
            <label class="option-label">Include Timestamps</label>
            <input
              v-model="exportOptions.includeTimestamps"
              type="checkbox"
              class="option-checkbox"
            />
          </div>

          <div class="option-group">
            <label class="option-label">Compress File</label>
            <input
              v-model="exportOptions.compress"
              type="checkbox"
              class="option-checkbox"
            />
          </div>

          <div class="option-group">
            <label class="option-label">Password Protect</label>
            <input
              v-model="exportOptions.passwordProtect"
              type="checkbox"
              class="option-checkbox"
            />
          </div>
        </div>

        <div v-if="exportOptions.passwordProtect" class="password-section">
          <label class="option-label">Password</label>
          <input
            v-model="exportOptions.password"
            type="password"
            class="password-input"
            placeholder="Enter password"
          />
        </div>
      </div>

      <!-- Data Selection -->
      <div class="data-section">
        <h4 class="section-title">Data Selection</h4>
        <div class="data-options">
          <div class="option-group">
            <label class="option-label">Export All Data</label>
            <input
              v-model="exportOptions.exportAll"
              type="radio"
              name="dataSelection"
              class="option-radio"
            />
          </div>

          <div class="option-group">
            <label class="option-label">Export Current Page</label>
            <input
              v-model="exportOptions.exportCurrentPage"
              type="radio"
              name="dataSelection"
              class="option-radio"
            />
          </div>

          <div class="option-group">
            <label class="option-label">Export Selected Rows</label>
            <input
              v-model="exportOptions.exportSelected"
              type="radio"
              name="dataSelection"
              class="option-radio"
            />
          </div>
        </div>
      </div>

      <!-- Column Selection -->
      <div class="columns-section">
        <h4 class="section-title">Column Selection</h4>
        <div class="columns-controls">
          <button @click="selectAllColumns" class="btn-secondary btn-sm">
            Select All
          </button>
          <button @click="deselectAllColumns" class="btn-secondary btn-sm">
            Deselect All
          </button>
        </div>
        <div class="columns-list">
          <div
            v-for="column in availableColumns"
            :key="column.key"
            class="column-item"
          >
            <input
              v-model="selectedColumns"
              :value="column.key"
              type="checkbox"
              class="column-checkbox"
            />
            <label class="column-label">{{ column.title }}</label>
          </div>
        </div>
      </div>

      <!-- Export Actions -->
      <div class="export-actions">
        <button @click="cancelExport" class="btn-secondary">
          Cancel
        </button>
        <button @click="previewExport" class="btn-primary">
          Preview
        </button>
        <button @click="startExport" class="btn-success" :disabled="isExporting">
          <span v-if="isExporting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </span>
          <span v-else>Export Data</span>
        </button>
      </div>
    </div>

    <!-- Export Progress -->
    <div v-if="showProgress" class="export-progress">
      <div class="progress-header">
        <h4 class="progress-title">Export Progress</h4>
        <span class="progress-percentage">{{ exportProgress }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: exportProgress + '%' }"
        ></div>
      </div>
      <p class="progress-text">{{ progressText }}</p>
    </div>
  </div>
</template>

<script>
import { useExportOptions } from '@/composables/useExportOptions'
import { 
  DocumentTextIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  ArchiveBoxIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ExportOptions',
  components: {
    DocumentTextIcon,
    TableCellsIcon,
    DocumentArrowDownIcon,
    ArchiveBoxIcon
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    currentPage: {
      type: Number,
      default: 1
    }
  },
  emits: ['export', 'cancel', 'preview'],
  setup(props, { emit }) {
    return useExportOptions(props, { emit })
  }
}
</script>