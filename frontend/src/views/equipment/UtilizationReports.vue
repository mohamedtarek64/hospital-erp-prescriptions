<template>
  <div class="utilization-reports-container">
    <!-- Header Section -->
    <div class="reports-header">
      <div class="header-content">
        <h1 class="page-title">Equipment Utilization Reports</h1>
        <p class="page-subtitle">Analyze equipment usage patterns and efficiency</p>
      </div>
      <div class="header-actions">
        <button @click="exportReport" class="btn-primary">
          <i class="fas fa-download"></i>
          Export Report
        </button>
        <button @click="refreshData" class="btn-secondary">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="date-filter-section">
      <div class="filter-group">
        <label>Date Range:</label>
        <select v-model="dateRange" @change="updateDateRange">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      <div v-if="dateRange === 'custom'" class="custom-date-range">
        <input v-model="customStartDate" type="date" @change="updateCustomRange">
        <span>to</span>
        <input v-model="customEndDate" type="date" @change="updateCustomRange">
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="card-content">
          <h3>{{ utilizationStats.totalUsageHours }}</h3>
          <p>Total Usage Hours</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="card-content">
          <h3>{{ utilizationStats.averageUtilization }}%</h3>
          <p>Average Utilization</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="card-content">
          <h3>{{ utilizationStats.mostUsedEquipment }}</h3>
          <p>Most Used Equipment</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="card-content">
          <h3>{{ utilizationStats.underutilizedCount }}</h3>
          <p>Underutilized Equipment</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h3>Utilization by Equipment</h3>
        <div class="chart-wrapper">
          <canvas ref="utilizationChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <h3>Usage Trends</h3>
        <div class="chart-wrapper">
          <canvas ref="trendsChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Equipment Utilization Table -->
    <div class="utilization-table-section">
      <h3>Equipment Utilization Details</h3>
      <div class="table-container">
        <table class="utilization-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Category</th>
              <th>Total Hours</th>
              <th>Utilization %</th>
              <th>Active Sessions</th>
              <th>Last Used</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipment in equipmentUtilization" :key="equipment.id">
              <td>
                <div class="equipment-info">
                  <strong>{{ equipment.name }}</strong>
                  <small>{{ equipment.model }}</small>
                </div>
              </td>
              <td>{{ equipment.category?.name }}</td>
              <td>{{ equipment.total_hours }}</td>
              <td>
                <div class="utilization-bar">
                  <div class="bar-fill" :style="{ width: equipment.utilization_percentage + '%' }"></div>
                  <span class="bar-text">{{ equipment.utilization_percentage }}%</span>
                </div>
              </td>
              <td>{{ equipment.active_sessions }}</td>
              <td>{{ formatDate(equipment.last_used) }}</td>
              <td>
                <span :class="['status-badge', getStatusColor(equipment.utilization_percentage)]">
                  {{ getUtilizationStatus(equipment.utilization_percentage) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Usage Patterns Section -->
    <div class="usage-patterns-section">
      <h3>Usage Patterns</h3>
      <div class="patterns-grid">
        <div class="pattern-card">
          <h4>Peak Usage Hours</h4>
          <div class="pattern-content">
            <div v-for="hour in peakUsageHours" :key="hour.hour" class="hour-bar">
              <span class="hour-label">{{ hour.hour }}:00</span>
              <div class="hour-usage" :style="{ height: hour.usage + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="pattern-card">
          <h4>Usage by Purpose</h4>
          <div class="purpose-stats">
            <div v-for="purpose in usageByPurpose" :key="purpose.purpose" class="purpose-item">
              <span class="purpose-name">{{ purpose.purpose }}</span>
              <span class="purpose-count">{{ purpose.count }} sessions</span>
            </div>
          </div>
        </div>
        <div class="pattern-card">
          <h4>Department Usage</h4>
          <div class="department-stats">
            <div v-for="dept in usageByDepartment" :key="dept.department" class="dept-item">
              <span class="dept-name">{{ dept.department }}</span>
              <span class="dept-hours">{{ dept.hours }}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations Section -->
    <div class="recommendations-section">
      <h3>Recommendations</h3>
      <div class="recommendations-list">
        <div v-for="recommendation in recommendations" :key="recommendation.id" class="recommendation-item">
          <div class="recommendation-icon">
            <i :class="recommendation.icon"></i>
          </div>
          <div class="recommendation-content">
            <h4>{{ recommendation.title }}</h4>
            <p>{{ recommendation.description }}</p>
            <span class="recommendation-priority" :class="recommendation.priority">
              {{ recommendation.priority }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUtilizationReports } from '@/scripts/equipment/utilizationReports'

export default {
  name: 'UtilizationReports',
  setup() {
    return useUtilizationReports()
  }
}
</script>

<style scoped>
@import '@/assets/css/equipment/utilization-reports.css';
</style>
