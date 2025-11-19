<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffTrainingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'staff_id' => 'required|exists:staff,id',
            'training_program_id' => 'required|exists:training_programs,id',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'trainer_id' => 'nullable|exists:staff,id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
            'cost' => 'nullable|numeric|min:0',
            'duration_hours' => 'nullable|numeric|min:0.5',
            'certification_required' => 'nullable|boolean',
            'prerequisites' => 'nullable|string'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'staff_id.required' => 'Staff member is required.',
            'staff_id.exists' => 'Selected staff member does not exist.',
            'training_program_id.required' => 'Training program is required.',
            'training_program_id.exists' => 'Selected training program does not exist.',
            'scheduled_date.required' => 'Scheduled date is required.',
            'scheduled_date.date' => 'Scheduled date must be a valid date.',
            'scheduled_date.after_or_equal' => 'Scheduled date cannot be in the past.',
            'trainer_id.exists' => 'Selected trainer does not exist.',
            'location.max' => 'Location cannot exceed 255 characters.',
            'max_participants.integer' => 'Maximum participants must be a number.',
            'max_participants.min' => 'Maximum participants must be at least 1.',
            'status.in' => 'Status must be one of: scheduled, in_progress, completed, cancelled.',
            'cost.numeric' => 'Cost must be a valid number.',
            'cost.min' => 'Cost cannot be negative.',
            'duration_hours.numeric' => 'Duration must be a valid number.',
            'duration_hours.min' => 'Duration must be at least 0.5 hours.',
            'certification_required.boolean' => 'Certification required must be true or false.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'staff_id' => 'staff member',
            'training_program_id' => 'training program',
            'scheduled_date' => 'scheduled date',
            'trainer_id' => 'trainer',
            'max_participants' => 'maximum participants',
            'duration_hours' => 'duration hours',
            'certification_required' => 'certification required'
        ];
    }
}