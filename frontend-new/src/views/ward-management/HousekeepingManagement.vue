<template>
  <div class="housekeeping-management">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Housekeeping Management</h1>
        <p class="page-subtitle">Manage cleaning schedules and housekeeping tasks</p>
      </div>
      <div class="header-actions">
        <button @click="showTaskForm" class="btn-primary">
          <PlusIcon class="h-5 w-5 mr-2" />
          New Task
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <ClipboardDocumentListIcon class="h-6 w-6 text-blue-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ housekeepingStats.totalTasks }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <CheckCircleIcon class="h-6 w-6 text-green-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ housekeepingStats.completedTasks }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <ClockIcon class="h-6 w-6 text-yellow-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ housekeepingStats.pendingTasks }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-red-100">
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ housekeepingStats.overdueTasks }}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filter-group">
        <div class="search-box">
          <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks..."
            class="search-input"
            @input="onSearch"
          />
        </div>
        
        <select v-model="selectedWard" @change="onWardChange" class="filter-select">
          <option value="">All Wards</option>
          <option
            v-for="ward in wards"
            :key="ward.id"
            :value="ward.id"
          >
            {{ ward.name }}
          </option>
        </select>
        
        <select v-model="selectedStatus" @change="onStatusChange" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        
        <select v-model="selectedPriority" @change="onPriorityChange" class="filter-select">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        
        <button @click="refreshData" class="btn-secondary">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Tasks Table -->
    <div class="table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">Loading tasks...</p>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="error-text">{{ error }}</p>
        <button @click="refreshData" class="btn-secondary mt-4">
          Try Again
        </button>
      </div>

      <div v-else class="tasks-table">
        <table class="table">
          <thead>
            <tr>
              <th class="table-header">Task</th>
              <th class="table-header">Ward/Room</th>
              <th class="table-header">Assigned To</th>
              <th class="table-header">Priority</th>
              <th class="table-header">Due Date</th>
              <th class="table-header">Status</th>
              <th class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in filteredTasks"
              :key="task.id"
              class="table-row"
              @click="viewTask(task)"
            >
              <td class="table-cell">
                <div class="task-info">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-description">{{ task.description }}</div>
                </div>
              </td>
              <td class="table-cell">
                <div class="location-info">
                  <div class="ward-name">{{ task.ward.name }}</div>
                  <div class="room-number">Room {{ task.room.number }}</div>
                </div>
              </td>
              <td class="table-cell">
                <div class="assignee-info">
                  <div class="assignee-name">{{ task.assigned_to.name }}</div>
                  <div class="assignee-role">{{ task.assigned_to.role }}</div>
                </div>
              </td>
              <td class="table-cell">
                <span class="priority-badge" :class="getPriorityClass(task.priority)">
                  {{ task.priority }}
                </span>
              </td>
              <td class="table-cell">
                <div class="date-info">
                  <div class="due-date">{{ formatDate(task.due_date) }}</div>
                  <div class="due-time">{{ formatTime(task.due_date) }}</div>
                </div>
              </td>
              <td class="table-cell">
                <span class="status-badge" :class="getStatusClass(task.status)">
                  {{ task.status }}
                </span>
              </td>
              <td class="table-cell">
                <div class="action-buttons">
                  <button @click.stop="viewTask(task)" class="btn-icon">
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button @click.stop="editTask(task)" class="btn-icon">
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button @click.stop="completeTask(task)" class="btn-icon">
                    <CheckIcon class="h-4 w-4" />
                  </button>
                  <button @click.stop="deleteTask(task)" class="btn-icon">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <ClipboardDocumentListIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="empty-text">No tasks found</p>
          <p class="empty-subtext">Try adjusting your search criteria or add a new task</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalTasks }} tasks
        </span>
      </div>
      
      <div class="pagination-controls">
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
      </div>
    </div>

    <!-- Task Form Modal -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ editingTask ? 'Edit Task' : 'New Task' }}</h3>
          <button @click="closeTaskModal" class="btn-close">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-body">
          <TaskForm
            :task="editingTask"
            :wards="wards"
            :staff="housekeepingStaff"
            @submit="handleTaskSubmit"
            @cancel="closeTaskModal"
          />
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <div v-if="selectedTask" class="modal-overlay" @click="closeTaskDetails">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Task Details</h3>
          <button @click="closeTaskDetails" class="btn-close">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-body">
          <div class="task-details">
            <!-- Task Information -->
            <div class="detail-section">
              <h4 class="section-title">Task Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Title:</label>
                  <span>{{ selectedTask.title }}</span>
                </div>
                <div class="detail-item">
                  <label>Description:</label>
                  <span>{{ selectedTask.description }}</span>
                </div>
                <div class="detail-item">
                  <label>Priority:</label>
                  <span class="priority-badge" :class="getPriorityClass(selectedTask.priority)">
                    {{ selectedTask.priority }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" :class="getStatusClass(selectedTask.status)">
                    {{ selectedTask.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Location Information -->
            <div class="detail-section">
              <h4 class="section-title">Location</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Ward:</label>
                  <span>{{ selectedTask.ward.name }}</span>
                </div>
                <div class="detail-item">
                  <label>Room:</label>
                  <span>{{ selectedTask.room.number }}</span>
                </div>
                <div class="detail-item">
                  <label>Room Type:</label>
                  <span>{{ selectedTask.room.type }}</span>
                </div>
              </div>
            </div>

            <!-- Assignment Information -->
            <div class="detail-section">
              <h4 class="section-title">Assignment</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Assigned To:</label>
                  <span>{{ selectedTask.assigned_to.name }}</span>
                </div>
                <div class="detail-item">
                  <label>Role:</label>
                  <span>{{ selectedTask.assigned_to.role }}</span>
                </div>
                <div class="detail-item">
                  <label>Due Date:</label>
                  <span>{{ formatDate(selectedTask.due_date) }}</span>
                </div>
                <div class="detail-item">
                  <label>Created:</label>
                  <span>{{ formatDate(selectedTask.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useHousekeepingManagement } from '@/composables/useHousekeepingManagement'
import TaskForm from '@/components/ward-management/TaskForm.vue'
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'HousekeepingManagement',
  components: {
    TaskForm,
    PlusIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    EyeIcon,
    PencilIcon,
    CheckIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon
  },
  setup() {
    return useHousekeepingManagement()
  }
}
</script>
