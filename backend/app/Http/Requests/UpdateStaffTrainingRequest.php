<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffTrainingRequest extends FormRequest
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
            'staff_id' => 'sometimes|required|exists:staff,id',
            'training_program_id' => 'sometimes|required|exists:training_programs,id',
            'scheduled_date' => 'sometimes|required|date',
            'completion_date' => 'nullable|date|after_or_equal:scheduled_date',
            'trainer_id' => 'nullable|exists:staff,id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
            'cost' => 'nullable|numeric|min:0',
            'duration_hours' => 'nullable|numeric|min:0.5',
            'actual_duration_hours' => 'nullable|numeric|min:0',
            'certification_required' => 'nullable|boolean',
            'certification_issued' => 'nullable|boolean',
            'prerequisites' => 'nullable|string',
            'feedback' => 'nullable|string',
            'score' => 'nullable|numeric|min:0|max:100',
            'attendance_count' => 'nullable|integer|min:0',
            'passed' => 'nullable|boolean'
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
            'completion_date.date' => 'Completion date must be a valid date.',
            'completion_date.after_or_equal' => 'Completion date cannot be before scheduled date.',
            'trainer_id.exists' => 'Selected trainer does not exist.',
            'location.max' => 'Location cannot exceed 255 characters.',
            'max_participants.integer' => 'Maximum participants must be a number.',
            'max_participants.min' => 'Maximum participants must be at least 1.',
            'status.in' => 'Status must be one of: scheduled, in_progress, completed, cancelled.',
            'cost.numeric' => 'Cost must be a valid number.',
            'cost.min' => 'Cost cannot be negative.',
            'duration_hours.numeric' => 'Duration must be a valid number.',
            'duration_hours.min' => 'Duration must be at least 0.5 hours.',
            'actual_duration_hours.numeric' => 'Actual duration must be a valid number.',
            'actual_duration_hours.min' => 'Actual duration cannot be negative.',
            'certification_required.boolean' => 'Certification required must be true or false.',
            'certification_issued.boolean' => 'Certification issued must be true or false.',
            'score.numeric' => 'Score must be a valid number.',
            'score.min' => 'Score cannot be negative.',
            'score.max' => 'Score cannot exceed 100.',
            'attendance_count.integer' => 'Attendance count must be a number.',
            'attendance_count.min' => 'Attendance count cannot be negative.',
            'passed.boolean' => 'Passed status must be true or false.'
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
            'completion_date' => 'completion date',
            'trainer_id' => 'trainer',
            'max_participants' => 'maximum participants',
            'duration_hours' => 'duration hours',
            'actual_duration_hours' => 'actual duration hours',
            'certification_required' => 'certification required',
            'certification_issued' => 'certification issued',
            'attendance_count' => 'attendance count'
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // If status is completed, require completion_date
            if ($this->status === 'completed' && !$this->completion_date) {
                $validator->errors()->add('completion_date', 'Completion date is required when status is completed.');
            }

            // If certification is issued, certification must be required
            if ($this->certification_issued && !$this->certification_required) {
                $validator->errors()->add('certification_issued', 'Certification cannot be issued if not required.');
            }

            // If score is provided, training must be completed
            if ($this->score !== null && $this->status !== 'completed') {
                $validator->errors()->add('score', 'Score can only be assigned to completed training.');
            }

            // If passed status is provided, training must be completed
            if ($this->passed !== null && $this->status !== 'completed') {
                $validator->errors()->add('passed', 'Pass/fail status can only be assigned to completed training.');
            }
        });
    }
}