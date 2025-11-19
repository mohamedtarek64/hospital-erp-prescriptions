<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'bed_id' => ['required', 'exists:beds,id'],
            'admission_date' => ['required', 'date', 'before_or_equal:today'],
            'admission_time' => ['required', 'date'],
            'admission_type' => ['required', 'string', Rule::in(['emergency', 'scheduled', 'transfer'])],
            'referring_doctor_id' => ['nullable', 'exists:users,id'],
            'diagnosis' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', Rule::in(['active', 'discharged', 'transferred'])],
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
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Check if patient already has an active admission
            if ($this->patient_id) {
                $existingAdmission = \App\Models\Admission::where('patient_id', $this->patient_id)
                    ->where('status', 'active')
                    ->exists();

                if ($existingAdmission) {
                    $validator->errors()->add('patient_id', 'This patient already has an active admission.');
                }
            }

            // Check if bed is available
            if ($this->bed_id) {
                $bed = \App\Models\Bed::find($this->bed_id);
                if ($bed && $bed->status !== 'available') {
                    $validator->errors()->add('bed_id', 'The selected bed is not available.');
                }
            }
        });
    }
}
