<template>
  <div class="hr-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold text-gray-800">HR Dashboard</h1>
      <p class="text-gray-600">Human Resources Management Overview</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <i class="fas fa-users text-blue-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.total_employees }}</h3>
          <p class="stat-label">Total Employees</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <i class="fas fa-user-check text-green-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.active_employees }}</h3>
          <p class="stat-label">Active Employees</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <i class="fas fa-calendar-times text-yellow-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.pending_leave_requests }}</h3>
          <p class="stat-label">Pending Leave Requests</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100">
          <i class="fas fa-clock text-purple-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.attendance_today }}</h3>
          <p class="stat-label">Present Today</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h3 class="chart-title">Department Distribution</h3>
        <div class="chart-placeholder">
          <canvas ref="departmentChart"></canvas>
        </div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">Attendance Trends</h3>
        <div class="chart-placeholder">
          <canvas ref="attendanceChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities">
      <h3 class="section-title">Recent Activities</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <i :class="activity.icon" :style="{ color: activity.color }"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.description }}</p>
            <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3 class="section-title">Quick Actions</h3>
      <div class="action-buttons">
        <button @click="navigateTo('/hr/employees')" class="action-btn">
          <i class="fas fa-user-plus"></i>
          Add Employee
        </button>
        <button @click="navigateTo('/hr/attendance')" class="action-btn">
          <i class="fas fa-clock"></i>
          Mark Attendance
        </button>
        <button @click="navigateTo('/hr/leave-requests')" class="action-btn">
          <i class="fas fa-calendar-check"></i>
          Review Leaves
        </button>
        <button @click="navigateTo('/hr/payroll')" class="action-btn">
          <i class="fas fa-money-bill-wave"></i>
          Process Payroll
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHRDashboard } from '@/scripts/hr/hrDashboard.js'

// Use composable
const {
  stats,
  recentActivities,
  departmentChart,
  attendanceChart,
  // loading,
  // error,
  formatTime,
  navigateTo
  // refreshData
} = useHRDashboard()
</script>

<style scoped>
@import '@/assets/css/hr-dashboard.css';
</style>
