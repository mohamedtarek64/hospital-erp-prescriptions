<template>
    <div class="performance-reviews">
      <!-- Header -->
      <div class="page-header">
        <h1 class="text-3xl font-bold text-gray-800">Performance Reviews</h1>
        <button @click="showReviewForm = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          Add Review
        </button>
      </div>
  
      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100">
            <i class="fas fa-star text-blue-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.average_rating?.toFixed(1) || '0.0' }}</h3>
            <p class="stat-label">Average Rating</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon bg-green-100">
            <i class="fas fa-trophy text-green-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.high_performers || 0 }}</h3>
            <p class="stat-label">High Performers</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon bg-yellow-100">
            <i class="fas fa-exclamation-triangle text-yellow-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.low_performers || 0 }}</h3>
            <p class="stat-label">Needs Improvement</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon bg-purple-100">
            <i class="fas fa-chart-line text-purple-600"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stats.total_reviews || 0 }}</h3>
            <p class="stat-label">Total Reviews</p>
          </div>
        </div>
      </div>
  
      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <select v-model="filters.employee" class="filter-select">
            <option value="">All Employees</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
          <select v-model="filters.rating" class="filter-select">
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select v-model="filters.period" class="filter-select">
            <option value="">All Periods</option>
            <option v-for="period in getPeriodOptions()" :key="period" :value="period">
              {{ period }}
            </option>
          </select>
          <select v-model="filters.reviewer" class="filter-select">
            <option value="">All Reviewers</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
          <button @click="applyFilters" class="btn-secondary">
            <i class="fas fa-search"></i>
            Filter
          </button>
        </div>
      </div>
  
      <!-- Reviews Table -->
      <div class="reviews-table-container">
        <table class="reviews-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reviewer</th>
              <th>Period</th>
              <th>Rating</th>
              <th>Review Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in paginatedReviews" :key="review.id">
              <td>
                <div class="employee-info">
                  <div class="employee-avatar">
                    <img :src="review.employee?.avatar || '/default-avatar.png'" :alt="review.employee?.name" />
                  </div>
                  <div class="employee-details">
                    <div class="employee-name">{{ review.employee?.name }}</div>
                    <div class="employee-designation">{{ review.employee?.designation }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="employee-info">
                  <div class="employee-avatar">
                    <img :src="review.reviewer?.avatar || '/default-avatar.png'" :alt="review.reviewer?.name" />
                  </div>
                  <div class="employee-details">
                    <div class="employee-name">{{ review.reviewer?.name }}</div>
                    <div class="employee-designation">{{ review.reviewer?.designation }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="period-display">
                  {{ review.period }}
                </div>
              </td>
              <td>
                <div class="rating-display">
                  <div class="rating-stars">
                    <i v-for="(star, index) in getRatingStars(review.rating)" :key="index" :class="star" class="rating-star"></i>
                  </div>
                  <span :class="`rating-value ${getRatingClass(review.rating)}`">
                    {{ review.rating.toFixed(1) }}
                  </span>
                </div>
              </td>
              <td>{{ formatDate(review.review_date) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editReview(review)" class="btn-icon" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteReview(review)" class="btn-icon btn-danger" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination -->
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
  
      <!-- Add Review Modal -->
      <div v-if="showReviewForm" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Add Performance Review</h3>
            <button @click="closeModal" class="btn-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form @submit.prevent="submitReview" class="modal-body">
            <div class="form-group">
              <label>Employee</label>
              <select v-model="reviewForm.employee_id" required>
                <option value="">Select Employee</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Reviewer</label>
              <select v-model="reviewForm.reviewer_id" required>
                <option value="">Select Reviewer</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Period</label>
              <select v-model="reviewForm.period" required>
                <option value="">Select Period</option>
                <option v-for="period in getPeriodOptions()" :key="period" :value="period">
                  {{ period }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Rating</label>
              <div class="rating-input">
                <div v-for="rating in [1, 2, 3, 4, 5]" :key="rating" class="rating-option">
                  <input
                    v-model="reviewForm.rating"
                    :value="rating"
                    type="radio"
                    :id="`rating-${rating}`"
                    name="rating"
                    required
                  />
                  <label :for="`rating-${rating}`">
                    <div class="rating-stars">
                      <i v-for="star in rating" :key="star" class="fas fa-star rating-star"></i>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Goals Achieved</label>
              <textarea v-model="reviewForm.goals_achieved" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Strengths</label>
              <textarea v-model="reviewForm.strengths" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Areas for Improvement</label>
              <textarea v-model="reviewForm.areas_for_improvement" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Development Plan</label>
              <textarea v-model="reviewForm.development_plan" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Comments</label>
              <textarea v-model="reviewForm.comments" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Edit Review Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Edit Performance Review</h3>
            <button @click="closeModal" class="btn-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form @submit.prevent="updateReview" class="modal-body">
            <div class="form-group">
              <label>Rating</label>
              <div class="rating-input">
                <div v-for="rating in [1, 2, 3, 4, 5]" :key="rating" class="rating-option">
                  <input
                    v-model="reviewForm.rating"
                    :value="rating"
                    type="radio"
                    :id="`edit-rating-${rating}`"
                    name="edit-rating"
                    required
                  />
                  <label :for="`edit-rating-${rating}`">
                    <div class="rating-stars">
                      <i v-for="star in rating" :key="star" class="fas fa-star rating-star"></i>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Goals Achieved</label>
              <textarea v-model="reviewForm.goals_achieved" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Strengths</label>
              <textarea v-model="reviewForm.strengths" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Areas for Improvement</label>
              <textarea v-model="reviewForm.areas_for_improvement" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Development Plan</label>
              <textarea v-model="reviewForm.development_plan" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Comments</label>
              <textarea v-model="reviewForm.comments" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Update Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { usePerformanceReviews } from '@/scripts/hr/performanceReviews.js'
  
  // Use composable
const {
  // reviews,
  employees,
  stats,
  filters,
  currentPage,
  totalPages,
  // itemsPerPage,
  showReviewForm,
  showEditModal,
  // selectedReview,
  reviewForm,
  // loading,
  // error,
  // filteredReviews,
  paginatedReviews,
  // loadReviews,
  // loadEmployees,
  // loadStats,
  submitReview,
  editReview,
  updateReview,
  deleteReview,
  applyFilters,
  // clearFilters,
  closeModal,
  previousPage,
    nextPage,
    // goToPage,
    formatDate,
    getRatingClass,
    // getRatingText,
    getRatingStars,
    getPeriodOptions
  } = usePerformanceReviews()
  </script>
  
  <style scoped>
  @import '@/assets/css/performance-reviews.css';
  </style>