<template>
  <div class="room-layout">
    <div class="room-header">
      <h3 class="room-title">{{ room.room_number }}</h3>
      <div class="room-info">
        <span class="room-type">{{ getRoomTypeText(room.room_type) }}</span>
        <span class="room-capacity">السعة: {{ room.capacity }}</span>
      </div>
    </div>

    <div class="room-content">
      <div class="beds-grid" :class="getGridClass(room.capacity)">
        <BedCard
          v-for="bed in room.beds"
          :key="bed.id"
          :bed="bed"
          @assignBed="handleAssignBed"
          @viewPatient="handleViewPatient"
          @dischargePatient="handleDischargePatient"
          @maintenanceBed="handleMaintenanceBed"
        />
      </div>

      <div class="room-amenities" v-if="room.amenities && room.amenities.length > 0">
        <h4 class="amenities-title">المرافق</h4>
        <div class="amenities-list">
          <span 
            v-for="amenity in room.amenities" 
            :key="amenity"
            class="amenity-tag"
          >
            {{ getAmenityText(amenity) }}
          </span>
        </div>
      </div>
    </div>

    <div class="room-actions">
      <button @click="addBed" class="btn btn-primary">
        <i class="icon">➕</i>
        إضافة سرير
      </button>
      <button @click="editRoom" class="btn btn-secondary">
        <i class="icon">✏️</i>
        تعديل الغرفة
      </button>
      <button @click="viewHousekeeping" class="btn btn-info">
        <i class="icon">🧹</i>
        أعمال النظافة
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoomLayout } from '@/scripts/ward-management/roomLayout'
import BedCard from './BedCard.vue'

/**
 * Component props
 */
const props = defineProps({
  room: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && value.room_number
    }
  }
})

/**
 * Component emits
 */
const emit = defineEmits([
  'assignBed', 
  'viewPatient', 
  'dischargePatient', 
  'maintenanceBed',
  'addBed',
  'editRoom',
  'viewHousekeeping'
])

// Get room layout functionality
const {
  getGridClass,
  getRoomTypeText,
  getAmenityText,
  handleAssignBed,
  handleViewPatient,
  handleDischargePatient,
  handleMaintenanceBed,
  addBed,
  editRoom,
  viewHousekeeping
} = useRoomLayout(props, emit)
</script>

<style scoped>
@import '@/assets/css/ward-management/roomLayout.css';
</style>
