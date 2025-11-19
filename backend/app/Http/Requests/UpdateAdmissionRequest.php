<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['sometimes', 'required', 'exists:patients,id'],
            'bed_id' => ['sometimes', 'required', 'exists:beds,id'],
            'admission_date' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'admission_time' => ['sometimes', 'required', 'date'],
            'admission_type' => ['sometimes', 'required', 'string', Rule::in(['emergency', 'scheduled', 'transfer'])],
            'referring_doctor_id' => ['nullable', 'exists:users,id'],
            'diagnosis' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', 'string', Rule::in(['active', 'discharged', 'transferred'])],
            'discharge_date' => ['nullable', 'date', 'after_or_equal:admission_date'],
            'discharge_time' => ['nullable', 'date'],
            'discharge_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required' => 'The patient is required.',
            'patient_id.exists' => 'The selected patient does not exist.',
            'bed_id.required' => 'The bed is required.',
            'bed_id.exists' => 'The selected bed does not exist.',
            'admission_date.required' => 'The admission date is required.',
            'admission_date.date' => 'The admission date must be a valid date.',
            'admission_date.before_or_equal' => 'The admission date cannot be in the future.',
            'admission_time.required' => 'The admission time is required.',
            'admission_time.date' => 'The admission time must be a valid date and time.',
            'admission_type.required' => 'The admission type is required.',
            'admission_type.in' => 'The selected admission type is invalid.',
            'referring_doctor_id.exists' => 'The selected referring doctor does not exist.',
            'diagnosis.max' => 'The diagnosis cannot exceed 1000 characters.',
            'status.required' => 'The status is required.',
            'status.in' => 'The selected status is invalid.',
            'discharge_date.date' => 'The discharge date must be a valid date.',
            'discharge_date.after_or_equal' => 'The discharge date cannot be before the admission date.',
            'discharge_time.date' => 'The discharge time must be a valid date and time.',
            'discharge_notes.max' => 'The discharge notes cannot exceed 1000 characters.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $admission = $this->route('admission');
            
            // Check if patient already has an active admission (excluding current admission)
            if ($this->has('patient_id') && $this->patient_id !== $admission->patient_id) {
                $existingAdmission = \App\Models\Admission::where('patient_id', $this->patient_id)
                    ->where('status', 'active')
                    ->where('id', '!=', $admission->id)
                    ->exists();

                if ($existingAdmission) {
                    $validator->errors()->add('patient_id', 'This patient already has an active admission.');
                }
            }

            // Check if bed is available (excluding current bed)
            if ($this->has('bed_id') && $this->bed_id !== $admission->bed_id) {
                $bed = \App\Models\Bed::find($this->bed_id);
                if ($bed && $bed->status !== 'available') {
                    $validator->errors()->add('bed_id', 'The selected bed is not available.');
                }
            }

            // If status is being changed to discharged, require discharge information
            if ($this->has('status') && $this->status === 'discharged') {
                if (!$this->discharge_date) {
                    $validator->errors()->add('discharge_date', 'Discharge date is required when status is discharged.');
                }
                if (!$this->discharge_time) {
                    $validator->errors()->add('discharge_time', 'Discharge time is required when status is discharged.');
                }
            }
        });
    }
}
