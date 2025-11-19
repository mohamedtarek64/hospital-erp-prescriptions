<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:wards,name'],
            'type' => ['required', 'string', Rule::in(['general', 'ICU', 'pediatric', 'maternity', 'surgical'])],
            'floor' => ['required', 'integer', 'min:1', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1', 'max:1000'],
            'head_nurse_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive', 'maintenance'])],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The ward name is required.',
            'name.unique' => 'A ward with this name already exists.',
            'type.required' => 'The ward type is required.',
            'type.in' => 'The selected ward type is invalid.',
            'floor.required' => 'The floor number is required.',
            'floor.integer' => 'The floor must be a number.',
            'floor.min' => 'The floor must be at least 1.',
            'floor.max' => 'The floor cannot exceed 50.',
            'capacity.required' => 'The capacity is required.',
            'capacity.integer' => 'The capacity must be a number.',
            'capacity.min' => 'The capacity must be at least 1.',
            'capacity.max' => 'The capacity cannot exceed 1000.',
            'head_nurse_id.exists' => 'The selected head nurse does not exist.',
            'status.required' => 'The status is required.',
            'status.in' => 'The selected status is invalid.',
            'description.max' => 'The description cannot exceed 1000 characters.',
        ];
    }
}
