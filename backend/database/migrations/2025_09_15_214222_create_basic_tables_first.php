<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create users table first
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->default('user');
            $table->rememberToken();
            $table->timestamps();
        });

        // Create departments table
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('head_of_department')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Create wards table
        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('ward_type');
            $table->string('floor')->nullable();
            $table->string('building')->nullable();
            $table->integer('total_beds')->default(0);
            $table->integer('available_beds')->default(0);
            $table->integer('occupied_beds')->default(0);
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->foreignId('nurse_in_charge_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->json('amenities')->nullable();
            $table->json('visiting_hours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('ward_type');
            $table->index('is_active');
            $table->index('department_id');
        });

        // Create beds table
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ward_id')->constrained('wards')->onDelete('cascade');
            $table->string('bed_number');
            $table->string('bed_type');
            $table->string('status')->default('available');
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->json('amenities')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('ward_id');
            $table->index('status');
            $table->index('bed_type');
            $table->unique(['ward_id', 'bed_number']);
        });

        // Create patients table
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('patient_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->json('medical_history')->nullable();
            $table->json('allergies')->nullable();
            $table->string('blood_type')->nullable();
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_number')->nullable();
            $table->enum('status', ['active', 'inactive', 'deceased'])->default('active');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index(['first_name', 'last_name']);
            $table->index('patient_id');
            $table->index('status');
        });

        // Create admissions table
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('bed_id')->constrained('beds')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->string('admission_number')->unique();
            $table->date('admission_date');
            $table->time('admission_time');
            $table->date('discharge_date')->nullable();
            $table->time('discharge_time')->nullable();
            $table->string('admission_type');
            $table->string('status')->default('admitted');
            $table->text('admission_reason')->nullable();
            $table->text('discharge_notes')->nullable();
            $table->text('medical_notes')->nullable();
            $table->json('vital_signs')->nullable();
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->unsignedBigInteger('admitted_by')->nullable();
            $table->unsignedBigInteger('discharged_by')->nullable();
            $table->timestamps();

            $table->index('patient_id');
            $table->index('bed_id');
            $table->index('doctor_id');
            $table->index('status');
            $table->index('admission_date');
            $table->index('admission_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('admissions');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('users');
    }
};
