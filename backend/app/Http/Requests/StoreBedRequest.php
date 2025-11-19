<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
    }

    public function rules(): array
    {
        return [
            'room_id' => ['required', 'exists:rooms,id'],
            'bed_number' => ['required', 'string', 'max:50'],
            'bed_type' => ['required', 'string', Rule::in(['standard', 'electric', 'bariatric', 'pediatric'])],
            'status' => ['required', 'string', Rule::in(['available', 'occupied', 'maintenance', 'cleaning'])],
            'last_maintenance' => ['nullable', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'room_id.required' => 'The room is required.',
            'room_id.exists' => 'The selected room does not exist.',
            'bed_number.required' => 'The bed number is required.',
            'bed_number.max' => 'The bed number cannot exceed 50 characters.',
            'bed_type.required' => 'The bed type is required.',
            'bed_type.in' => 'The selected bed type is invalid.',
            'status.required' => 'The status is required.',
            'status.in' => 'The selected status is invalid.',
            'last_maintenance.date' => 'The last maintenance date must be a valid date.',
            'last_maintenance.before_or_equal' => 'The last maintenance date cannot be in the future.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Check if bed number already exists in the room
            if ($this->room_id && $this->bed_number) {
                $existingBed = \App\Models\Bed::where('room_id', $this->room_id)
                    ->where('bed_number', $this->bed_number)
                    ->exists();

                if ($existingBed) {
                    $validator->errors()->add('bed_number', 'A bed with this number already exists in the selected room.');
                }
            }
        });
    }
}
