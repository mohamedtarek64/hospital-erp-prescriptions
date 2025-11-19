# 🚀 مشروع جديد - اكتب البرمبت هنا

# Hospital Management System (HMS) - Remaining Project Phases

## PHASE 5: Medical Records & Patient History

### Prompt for Phase 5:
```
Create HMS Phase 5 - Medical Records & Patient History Management

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Medical records model with comprehensive tracking
   - Diagnosis and treatment models
   - Prescription and medication tracking
   - Medical test results management
   - File attachments for medical documents
   - Medical record versioning and audit trail

2. Vue.js Frontend:
   - Complete medical record interface
   - Medical history timeline
   - Prescription management
   - Test results display
   - Document upload and viewer
   - Medical record search and filters

3. Database Structure:
   - medical_records table (id, patient_id, doctor_id, appointment_id, chief_complaint, examination_notes, diagnosis, treatment_plan, follow_up_date, created_at, updated_at)
   - diagnoses table (id, medical_record_id, icd_code, diagnosis_name, severity, status, notes, created_at, updated_at)
   - prescriptions table (id, medical_record_id, medication_name, dosage, frequency, duration, instructions, status, created_at, updated_at)
   - medical_tests table (id, medical_record_id, test_name, test_type, results, normal_range, status, test_date, created_at, updated_at)
   - medical_attachments table (id, medical_record_id, file_name, file_path, file_type, file_size, uploaded_by, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_medical_records_table.php
   - database/migrations/create_diagnoses_table.php
   - database/migrations/create_prescriptions_table.php
   - database/migrations/create_medical_tests_table.php
   - database/migrations/create_medical_attachments_table.php
   - app/Models/MedicalRecord.php
   - app/Models/Diagnosis.php
   - app/Models/Prescription.php
   - app/Models/MedicalTest.php
   - app/Models/MedicalAttachment.php
   - app/Http/Controllers/MedicalRecordController.php
   - app/Http/Controllers/PrescriptionController.php
   - app/Http/Controllers/MedicalTestController.php
   - app/Services/MedicalRecordService.php

   Frontend:
   - src/views/medical-records/MedicalRecordsList.vue
   - src/views/medical-records/MedicalRecordCreate.vue
   - src/views/medical-records/MedicalRecordView.vue
   - src/views/medical-records/PatientMedicalHistory.vue
   - src/components/medical-records/MedicalRecordCard.vue
   - src/components/medical-records/DiagnosisList.vue
   - src/components/medical-records/PrescriptionList.vue
   - src/components/medical-records/TestResultsList.vue
   - src/components/medical-records/MedicalTimeline.vue
   - src/components/medical-records/FileUpload.vue
   - src/stores/medicalRecords.js
   - src/utils/medicalHelpers.js
   - src/assets/css/medical-records.css

5. Features:
   - Create comprehensive medical records
   - Track patient medical history timeline
   - Manage prescriptions and medications
   - Record and view test results
   - Upload and manage medical documents
   - Search medical records by various criteria
   - Generate medical reports
   - Medical record templates for common conditions
```

---

## PHASE 6: Pharmacy & Inventory Management

### Prompt for Phase 6:
```
Create HMS Phase 6 - Pharmacy & Inventory Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Medicine inventory management
   - Supplier management
   - Purchase order system
   - Stock tracking and alerts
   - Prescription fulfillment
   - Expiry date management

2. Vue.js Frontend:
   - Medicine inventory dashboard
   - Stock management interface
   - Purchase order creation
   - Prescription dispensing
   - Supplier management
   - Inventory reports and analytics

3. Database Structure:
   - medicines table (id, name, generic_name, brand_name, category, manufacturer, unit_type, unit_price, description, created_at, updated_at)
   - medicine_inventory table (id, medicine_id, batch_number, quantity, expiry_date, purchase_price, selling_price, supplier_id, status, created_at, updated_at)
   - suppliers table (id, name, contact_person, email, phone, address, status, created_at, updated_at)
   - purchase_orders table (id, supplier_id, order_date, expected_delivery, status, total_amount, notes, created_by, created_at, updated_at)
   - purchase_order_items table (id, purchase_order_id, medicine_id, quantity, unit_price, total_price, created_at, updated_at)
   - prescription_dispensing table (id, prescription_id, medicine_id, quantity_dispensed, dispensed_by, dispensed_at, notes, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_medicines_table.php
   - database/migrations/create_medicine_inventory_table.php
   - database/migrations/create_suppliers_table.php
   - database/migrations/create_purchase_orders_table.php
   - database/migrations/create_purchase_order_items_table.php
   - database/migrations/create_prescription_dispensing_table.php
   - app/Models/Medicine.php
   - app/Models/MedicineInventory.php
   - app/Models/Supplier.php
   - app/Models/PurchaseOrder.php
   - app/Models/PurchaseOrderItem.php
   - app/Models/PrescriptionDispensing.php
   - app/Http/Controllers/PharmacyController.php
   - app/Http/Controllers/InventoryController.php
   - app/Http/Controllers/SupplierController.php
   - app/Services/InventoryService.php

   Frontend:
   - src/views/pharmacy/PharmacyDashboard.vue
   - src/views/pharmacy/MedicineList.vue
   - src/views/pharmacy/InventoryManagement.vue
   - src/views/pharmacy/PurchaseOrders.vue
   - src/views/pharmacy/SupplierManagement.vue
   - src/views/pharmacy/PrescriptionDispensing.vue
   - src/components/pharmacy/MedicineCard.vue
   - src/components/pharmacy/StockAlert.vue
   - src/components/pharmacy/PurchaseOrderForm.vue
   - src/components/pharmacy/InventoryChart.vue
   - src/stores/pharmacy.js
   - src/stores/inventory.js
   - src/utils/inventoryHelpers.js
   - src/assets/css/pharmacy.css

5. Features:
   - Complete medicine inventory tracking
   - Automated low stock alerts
   - Purchase order management
   - Supplier relationship management
   - Prescription dispensing workflow
   - Expiry date tracking and alerts
   - Inventory valuation reports
   - Medicine search and categorization
```

---

## PHASE 7: Billing & Financial Management

### Prompt for Phase 7:
```
Create HMS Phase 7 - Billing & Financial Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Invoice generation and management
   - Payment processing and tracking
   - Service pricing management
   - Insurance claim processing
   - Financial reporting
   - Tax calculation and management

2. Vue.js Frontend:
   - Billing dashboard with analytics
   - Invoice creation and management
   - Payment tracking interface
   - Insurance claims management
   - Financial reports and charts
   - Price list management

3. Database Structure:
   - service_categories table (id, name, description, created_at, updated_at)
   - services table (id, category_id, name, code, price, tax_rate, description, status, created_at, updated_at)
   - invoices table (id, patient_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, discount_amount, total_amount, status, created_by, created_at, updated_at)
   - invoice_items table (id, invoice_id, service_id, quantity, unit_price, total_price, created_at, updated_at)
   - payments table (id, invoice_id, payment_date, amount, payment_method, reference_number, notes, received_by, created_at, updated_at)
   - insurance_claims table (id, patient_id, invoice_id, insurance_provider, claim_number, claim_amount, status, submitted_date, approved_date, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_service_categories_table.php
   - database/migrations/create_services_table.php
   - database/migrations/create_invoices_table.php
   - database/migrations/create_invoice_items_table.php
   - database/migrations/create_payments_table.php
   - database/migrations/create_insurance_claims_table.php
   - app/Models/ServiceCategory.php
   - app/Models/Service.php
   - app/Models/Invoice.php
   - app/Models/InvoiceItem.php
   - app/Models/Payment.php
   - app/Models/InsuranceClaim.php
   - app/Http/Controllers/BillingController.php
   - app/Http/Controllers/PaymentController.php
   - app/Http/Controllers/InsuranceController.php
   - app/Services/BillingService.php
   - app/Services/PaymentService.php

   Frontend:
   - src/views/billing/BillingDashboard.vue
   - src/views/billing/InvoiceList.vue
   - src/views/billing/InvoiceCreate.vue
   - src/views/billing/InvoiceView.vue
   - src/views/billing/PaymentTracking.vue
   - src/views/billing/ServiceManagement.vue
   - src/views/billing/InsuranceClaims.vue
   - src/components/billing/InvoiceCard.vue
   - src/components/billing/PaymentForm.vue
   - src/components/billing/BillingChart.vue
   - src/components/billing/ServicePriceList.vue
   - src/stores/billing.js
   - src/stores/payments.js
   - src/utils/billingHelpers.js
   - src/utils/currencyHelpers.js
   - src/assets/css/billing.css

5. Features:
   - Generate professional invoices
   - Track payments and outstanding balances
   - Manage service pricing and categories
   - Process insurance claims
   - Financial reporting and analytics
   - Payment reminder system
   - Multi-payment method support
   - Tax calculation and reporting
```

---

## PHASE 8: Laboratory Management

### Prompt for Phase 8:
```
Create HMS Phase 8 - Laboratory Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Lab test management and categories
   - Test sample tracking
   - Result entry and validation
   - Quality control management
   - Equipment and reagent tracking
   - Lab technician management

2. Vue.js Frontend:
   - Laboratory dashboard
   - Test request management
   - Sample tracking interface
   - Result entry system
   - Quality control monitoring
   - Laboratory reports

3. Database Structure:
   - lab_test_categories table (id, name, description, created_at, updated_at)
   - lab_tests table (id, category_id, name, code, normal_range_male, normal_range_female, unit, price, turnaround_time, preparation_instructions, created_at, updated_at)
   - lab_test_requests table (id, patient_id, doctor_id, requested_date, priority, status, notes, created_by, created_at, updated_at)
   - lab_test_request_items table (id, request_id, lab_test_id, sample_type, created_at, updated_at)
   - lab_samples table (id, request_item_id, sample_id, collection_date, collection_time, collected_by, status, notes, created_at, updated_at)
   - lab_results table (id, sample_id, result_value, result_status, reference_range, comments, tested_by, verified_by, tested_date, verified_date, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_lab_test_categories_table.php
   - database/migrations/create_lab_tests_table.php
   - database/migrations/create_lab_test_requests_table.php
   - database/migrations/create_lab_test_request_items_table.php
   - database/migrations/create_lab_samples_table.php
   - database/migrations/create_lab_results_table.php
   - app/Models/LabTestCategory.php
   - app/Models/LabTest.php
   - app/Models/LabTestRequest.php
   - app/Models/LabTestRequestItem.php
   - app/Models/LabSample.php
   - app/Models/LabResult.php
   - app/Http/Controllers/LabController.php
   - app/Http/Controllers/LabTestController.php
   - app/Http/Controllers/LabResultController.php
   - app/Services/LabService.php

   Frontend:
   - src/views/laboratory/LabDashboard.vue
   - src/views/laboratory/TestRequests.vue
   - src/views/laboratory/SampleTracking.vue
   - src/views/laboratory/ResultEntry.vue
   - src/views/laboratory/TestManagement.vue
   - src/views/laboratory/QualityControl.vue
   - src/components/laboratory/TestRequestCard.vue
   - src/components/laboratory/SampleCard.vue
   - src/components/laboratory/ResultForm.vue
   - src/components/laboratory/TestCatalog.vue
   - src/stores/laboratory.js
   - src/utils/labHelpers.js
   - src/assets/css/laboratory.css

5. Features:
   - Manage lab test catalog and categories
   - Process test requests from doctors
   - Track samples from collection to disposal
   - Enter and validate test results
   - Generate lab reports
   - Quality control monitoring
   - Turnaround time tracking
   - Critical value alerts
```

---

## PHASE 9: Staff Management & HR

### Prompt for Phase 9:
```
Create HMS Phase 9 - Staff Management & Human Resources System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Employee management and profiles
   - Attendance and shift management
   - Leave management system
   - Payroll processing
   - Performance evaluation
   - Training and certification tracking

2. Vue.js Frontend:
   - Staff directory and profiles
   - Attendance tracking interface
   - Leave request system
   - Payroll management
   - Performance review system
   - Training management

3. Database Structure:
   - employees table (id, user_id, employee_id, department_id, designation, hire_date, salary, employment_type, status, emergency_contact, created_at, updated_at)
   - attendance table (id, employee_id, date, check_in, check_out, break_time, total_hours, status, notes, created_at, updated_at)
   - leave_types table (id, name, days_allowed, carry_forward, description, created_at, updated_at)
   - leave_requests table (id, employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, approved_by, approved_date, created_at, updated_at)
   - payroll table (id, employee_id, pay_period, basic_salary, allowances, deductions, gross_salary, net_salary, status, processed_by, processed_date, created_at, updated_at)
   - performance_reviews table (id, employee_id, reviewer_id, review_period, overall_rating, goals, achievements, areas_for_improvement, comments, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_employees_table.php
   - database/migrations/create_attendance_table.php
   - database/migrations/create_leave_types_table.php
   - database/migrations/create_leave_requests_table.php
   - database/migrations/create_payroll_table.php
   - database/migrations/create_performance_reviews_table.php
   - app/Models/Employee.php
   - app/Models/Attendance.php
   - app/Models/LeaveType.php
   - app/Models/LeaveRequest.php
   - app/Models/Payroll.php
   - app/Models/PerformanceReview.php
   - app/Http/Controllers/EmployeeController.php
   - app/Http/Controllers/AttendanceController.php
   - app/Http/Controllers/LeaveController.php
   - app/Http/Controllers/PayrollController.php
   - app/Services/HRService.php

   Frontend:
   - src/views/hr/HRDashboard.vue
   - src/views/hr/EmployeeDirectory.vue
   - src/views/hr/AttendanceManagement.vue
   - src/views/hr/LeaveManagement.vue
   - src/views/hr/PayrollManagement.vue
   - src/views/hr/PerformanceReviews.vue
   - src/components/hr/EmployeeCard.vue
   - src/components/hr/AttendanceChart.vue
   - src/components/hr/LeaveRequestForm.vue
   - src/components/hr/PayslipGenerator.vue
   - src/stores/hr.js
   - src/stores/attendance.js
   - src/utils/hrHelpers.js
   - src/assets/css/hr.css

5. Features:
   - Complete employee profile management
   - Automated attendance tracking
   - Leave request and approval workflow
   - Payroll processing and payslip generation
   - Performance evaluation system
   - Employee onboarding process
   - Training and certification tracking
   - HR analytics and reporting
```

---

## PHASE 10: Reports & Analytics

### Prompt for Phase 10:
```
Create HMS Phase 10 - Reports & Analytics System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Comprehensive reporting engine
   - Data aggregation and analytics
   - Custom report builder
   - Scheduled report generation
   - Export functionality (PDF, Excel, CSV)
   - Dashboard KPI calculations

2. Vue.js Frontend:
   - Interactive dashboard with widgets
   - Report generation interface
   - Data visualization components
   - Custom report builder
   - Export and sharing options
   - Real-time analytics

3. Database Structure:
   - report_templates table (id, name, description, query_template, parameters, category, created_by, created_at, updated_at)
   - generated_reports table (id, template_id, name, file_path, parameters, status, generated_by, generated_at, created_at, updated_at)
   - dashboard_widgets table (id, name, type, data_source, configuration, position, size, visible, created_by, created_at, updated_at)
   - analytics_cache table (id, key, data, expires_at, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_report_templates_table.php
   - database/migrations/create_generated_reports_table.php
   - database/migrations/create_dashboard_widgets_table.php
   - database/migrations/create_analytics_cache_table.php
   - app/Models/ReportTemplate.php
   - app/Models/GeneratedReport.php
   - app/Models/DashboardWidget.php
   - app/Http/Controllers/ReportController.php
   - app/Http/Controllers/AnalyticsController.php
   - app/Http/Controllers/DashboardController.php
   - app/Services/ReportService.php
   - app/Services/AnalyticsService.php
   - app/Services/ExportService.php

   Frontend:
   - src/views/reports/ReportsDashboard.vue
   - src/views/reports/ReportGenerator.vue
   - src/views/reports/ReportViewer.vue
   - src/views/reports/AnalyticsDashboard.vue
   - src/views/reports/CustomReportBuilder.vue
   - src/components/reports/ChartWidget.vue
   - src/components/reports/KPICard.vue
   - src/components/reports/ReportFilter.vue
   - src/components/reports/DataTable.vue
   - src/components/reports/ExportOptions.vue
   - src/stores/reports.js
   - src/stores/analytics.js
   - src/utils/reportHelpers.js
   - src/utils/chartHelpers.js
   - src/assets/css/reports.css

5. Features:
   - Interactive executive dashboard
   - Pre-built report templates
   - Custom report builder
   - Data visualization with charts
   - Scheduled report generation
   - Export to multiple formats
   - Real-time analytics
   - KPI monitoring and alerts
```

---

## PHASE 11: Bed & Ward Management

### Prompt for Phase 11:
```
Create HMS Phase 11 - Bed & Ward Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Ward and room management
   - Bed allocation and tracking
   - Patient admission and discharge
   - Bed availability monitoring
   - Housekeeping and maintenance
   - Transfer management

2. Vue.js Frontend:
   - Ward layout visualization
   - Bed allocation interface
   - Patient admission system
   - Bed status monitoring
   - Housekeeping management
   - Transfer workflows

3. Database Structure:
   - wards table (id, name, type, floor, capacity, head_nurse_id, status, description, created_at, updated_at)
   - rooms table (id, ward_id, room_number, room_type, capacity, amenities, status, created_at, updated_at)
   - beds table (id, room_id, bed_number, bed_type, status, last_maintenance, created_at, updated_at)
   - admissions table (id, patient_id, bed_id, admission_date, admission_time, admission_type, referring_doctor_id, diagnosis, status, discharge_date, discharge_time, created_at, updated_at)
   - bed_assignments table (id, admission_id, bed_id, assigned_date, assigned_time, released_date, released_time, reason, created_at, updated_at)
   - housekeeping_tasks table (id, room_id, bed_id, task_type, priority, status, assigned_to, completed_by, due_date, completed_date, notes, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_wards_table.php
   - database/migrations/create_rooms_table.php
   - database/migrations/create_beds_table.php
   - database/migrations/create_admissions_table.php
   - database/migrations/create_bed_assignments_table.php
   - database/migrations/create_housekeeping_tasks_table.php
   - app/Models/Ward.php
   - app/Models/Room.php
   - app/Models/Bed.php
   - app/Models/Admission.php
   - app/Models/BedAssignment.php
   - app/Models/HousekeepingTask.php
   - app/Http/Controllers/WardController.php
   - app/Http/Controllers/BedController.php
   - app/Http/Controllers/AdmissionController.php
   - app/Services/BedManagementService.php

   Frontend:
   - src/views/ward-management/WardDashboard.vue
   - src/views/ward-management/WardLayout.vue
   - src/views/ward-management/BedAllocation.vue
   - src/views/ward-management/PatientAdmission.vue
   - src/views/ward-management/HousekeepingManagement.vue
   - src/components/ward-management/WardMap.vue
   - src/components/ward-management/BedCard.vue
   - src/components/ward-management/AdmissionForm.vue
   - src/components/ward-management/TransferForm.vue
   - src/stores/wardManagement.js
   - src/utils/wardHelpers.js
   - src/assets/css/ward-management.css

5. Features:
   - Visual ward and bed layout
   - Real-time bed availability
   - Patient admission workflow
   - Bed transfer management
   - Housekeeping task scheduling
   - Occupancy analytics
   - Maintenance tracking
   - Ward capacity planning
```

---

## PHASE 12: System Administration & Settings

### Prompt for Phase 12:
```
Create HMS Phase 12 - System Administration & Settings

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - System configuration management
   - User role and permission management
   - Hospital settings and preferences
   - Backup and restore functionality
   - System monitoring and logs
   - Multi-tenant support preparation

2. Vue.js Frontend:
   - Admin dashboard with system overview
   - User management interface
   - System settings configuration
   - Backup and maintenance tools
   - System monitoring dashboard
   - Role and permission editor

3. Database Structure:
   - system_settings table (id, key, value, type, description, category, is_public, created_at, updated_at)
   - roles table (id, name, display_name, description, created_at, updated_at)
   - permissions table (id, name, display_name, description, module, created_at, updated_at)
   - role_permissions table (id, role_id, permission_id, created_at, updated_at)
   - user_roles table (id, user_id, role_id, created_at, updated_at)
   - system_logs table (id, user_id, action, module, description, ip_address, user_agent, created_at, updated_at)
   - backups table (id, filename, file_path, file_size, type, status, created_by, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_system_settings_table.php
   - database/migrations/create_roles_table.php
   - database/migrations/create_permissions_table.php
   - database/migrations/create_role_permissions_table.php
   - database/migrations/create_user_roles_table.php
   - database/migrations/create_system_logs_table.php
   - database/migrations/create_backups_table.php
   - app/Models/SystemSetting.php
   - app/Models/Role.php
   - app/Models/Permission.php
   - app/Models/SystemLog.php
   - app/Models/Backup.php
   - app/Http/Controllers/AdminController.php
   - app/Http/Controllers/SystemSettingController.php
   - app/Http/Controllers/RoleController.php
   - app/Services/BackupService.php
   - app/Services/SystemLogService.php
   - app/Middleware/LogUserActivity.php

   Frontend:
   - src/views/admin/AdminDashboard.vue
   - src/views/admin/UserManagement.vue
   - src/views/admin/SystemSettings.vue
   - src/views/admin/RolePermissions.vue
   - src/views/admin/SystemLogs.vue
   - src/views/admin/BackupRestore.vue
   - src/components/admin/SystemOverview.vue
   - src/components/admin/UserTable.vue
   - src/components/admin/RoleEditor.vue
   - src/components/admin/SettingsForm.vue
   - src/stores/admin.js
   - src/stores/systemSettings.js
   - src/utils/adminHelpers.js
   - src/assets/css/admin.css

5. Features:
   - Comprehensive system configuration
   - Advanced user role management
   - Permission-based access control
   - System activity logging
   - Automated backup management
   - System health monitoring
   - Multi-language support setup
   - Hospital branding customization
```

---

## PHASE 13: Emergency & Ambulance Management

### Prompt for Phase 13:
```
Create HMS Phase 13 - Emergency & Ambulance Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Emergency case management
   - Ambulance fleet tracking
   - Emergency staff scheduling
   - Triage system implementation
   - Emergency room bed management
   - Critical alert system

2. Vue.js Frontend:
   - Emergency dashboard with real-time updates
   - Ambulance dispatch interface
   - Triage assessment form
   - Emergency case tracking
   - Staff notification system
   - Emergency analytics

3. Database Structure:
   - ambulances table (id, vehicle_number, type, capacity, equipment, status, driver_id, paramedic_id, location, created_at, updated_at)
   - emergency_cases table (id, case_number, patient_id, caller_name, caller_phone, location, emergency_type, priority, status, dispatch_time, arrival_time, hospital_arrival_time, assigned_ambulance_id, notes, created_at, updated_at)
   - triage_assessments table (id, patient_id, emergency_case_id, triage_level, vital_signs, symptoms, assessment_notes, assessed_by, assessed_at, created_at, updated_at)
   - emergency_staff_schedules table (id, staff_id, shift_date, shift_type, start_time, end_time, status, created_at, updated_at)
   - emergency_equipment table (id, name, type, quantity, location, status, last_checked, checked_by, created_at, updated_at)
   - critical_alerts table (id, alert_type, patient_id, message, priority, status, created_by, acknowledged_by, acknowledged_at, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_ambulances_table.php
   - database/migrations/create_emergency_cases_table.php
   - database/migrations/create_triage_assessments_table.php
   - database/migrations/create_emergency_staff_schedules_table.php
   - database/migrations/create_emergency_equipment_table.php
   - database/migrations/create_critical_alerts_table.php
   - app/Models/Ambulance.php
   - app/Models/EmergencyCase.php
   - app/Models/TriageAssessment.php
   - app/Models/EmergencyStaffSchedule.php
   - app/Models/EmergencyEquipment.php
   - app/Models/CriticalAlert.php
   - app/Http/Controllers/EmergencyController.php
   - app/Http/Controllers/AmbulanceController.php
   - app/Http/Controllers/TriageController.php
   - app/Services/EmergencyService.php
   - app/Services/AlertService.php

   Frontend:
   - src/views/emergency/EmergencyDashboard.vue
   - src/views/emergency/AmbulanceDispatch.vue
   - src/views/emergency/TriageAssessment.vue
   - src/views/emergency/EmergencyRoom.vue
   - src/views/emergency/CriticalAlerts.vue
   - src/components/emergency/EmergencyMap.vue
   - src/components/emergency/AmbulanceCard.vue
   - src/components/emergency/TriageForm.vue
   - src/components/emergency/AlertNotification.vue
   - src/components/emergency/EmergencyTimer.vue
   - src/stores/emergency.js
   - src/stores/ambulance.js
   - src/utils/emergencyHelpers.js
   - src/assets/css/emergency.css

5. Features:
   - Real-time emergency case tracking
   - Ambulance fleet management and dispatch
   - Automated triage assessment
   - Emergency room bed allocation
   - Critical alert system
   - Emergency staff scheduling
   - Response time analytics
   - Equipment readiness monitoring
```

---

## PHASE 14: Equipment & Asset Management

### Prompt for Phase 14:
```
Create HMS Phase 14 - Equipment & Asset Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Medical equipment inventory
   - Asset tracking and location
   - Maintenance scheduling and records
   - Equipment calibration management
   - Warranty and service contracts
   - Equipment utilization tracking

2. Vue.js Frontend:
   - Equipment inventory dashboard
   - Asset tracking interface
   - Maintenance scheduling system
   - Equipment status monitoring
   - Service history tracking
   - Utilization reports

3. Database Structure:
   - equipment_categories table (id, name, description, created_at, updated_at)
   - equipment table (id, category_id, name, model, serial_number, manufacturer, purchase_date, purchase_price, warranty_expiry, location_id, status, condition_rating, created_at, updated_at)
   - equipment_locations table (id, name, type, department_id, floor, room, responsible_person_id, created_at, updated_at)
   - maintenance_schedules table (id, equipment_id, maintenance_type, frequency, last_maintenance, next_maintenance, assigned_technician_id, status, created_at, updated_at)
   - maintenance_records table (id, equipment_id, maintenance_date, maintenance_type, description, technician_id, cost, parts_replaced, next_due_date, created_at, updated_at)
   - equipment_usage_logs table (id, equipment_id, used_by, usage_start, usage_end, purpose, patient_id, notes, created_at, updated_at)
   - service_contracts table (id, equipment_id, vendor_id, contract_type, start_date, end_date, cost, terms, contact_person, status, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_equipment_categories_table.php
   - database/migrations/create_equipment_table.php
   - database/migrations/create_equipment_locations_table.php
   - database/migrations/create_maintenance_schedules_table.php
   - database/migrations/create_maintenance_records_table.php
   - database/migrations/create_equipment_usage_logs_table.php
   - database/migrations/create_service_contracts_table.php
   - app/Models/EquipmentCategory.php
   - app/Models/Equipment.php
   - app/Models/EquipmentLocation.php
   - app/Models/MaintenanceSchedule.php
   - app/Models/MaintenanceRecord.php
   - app/Models/EquipmentUsageLog.php
   - app/Models/ServiceContract.php
   - app/Http/Controllers/EquipmentController.php
   - app/Http/Controllers/MaintenanceController.php
   - app/Services/EquipmentService.php
   - app/Services/MaintenanceService.php

   Frontend:
   - src/views/equipment/EquipmentDashboard.vue
   - src/views/equipment/EquipmentInventory.vue
   - src/views/equipment/MaintenanceSchedule.vue
   - src/views/equipment/AssetTracking.vue
   - src/views/equipment/ServiceContracts.vue
   - src/views/equipment/UtilizationReports.vue
   - src/components/equipment/EquipmentCard.vue
   - src/components/equipment/MaintenanceForm.vue
   - src/components/equipment/LocationTracker.vue
   - src/components/equipment/UsageChart.vue
   - src/stores/equipment.js
   - src/stores/maintenance.js
   - src/utils/equipmentHelpers.js
   - src/assets/css/equipment.css

5. Features:
   - Comprehensive equipment inventory
   - Real-time asset location tracking
   - Automated maintenance scheduling
   - Equipment calibration tracking
   - Service contract management
   - Equipment utilization analytics
   - Warranty and expiry alerts
   - Cost analysis and budgeting
```

---

## PHASE 15: Blood Bank Management

### Prompt for Phase 15:
```
Create HMS Phase 15 - Blood Bank Management System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Donor management and registration
   - Blood collection and processing
   - Blood inventory and storage
   - Cross-matching and compatibility
   - Blood distribution and transfusion
   - Quality control and testing

2. Vue.js Frontend:
   - Blood bank dashboard
   - Donor registration and management
   - Blood collection interface
   - Inventory management system
   - Transfusion tracking
   - Quality control monitoring

3. Database Structure:
   - blood_donors table (id, donor_id, first_name, last_name, email, phone, address, date_of_birth, gender, blood_group, rh_factor, weight, last_donation_date, donation_count, status, medical_history, created_at, updated_at)
   - blood_donations table (id, donor_id, donation_date, collection_time, volume_collected, staff_id, collection_center, hemoglobin_level, blood_pressure, temperature, pulse_rate, notes, status, created_at, updated_at)
   - blood_units table (id, donation_id, unit_number, blood_group, rh_factor, component_type, volume, collection_date, expiry_date, storage_location, temperature, status, tested_for, test_results, created_at, updated_at)
   - blood_requests table (id, patient_id, requesting_doctor_id, blood_group, rh_factor, component_type, units_requested, urgency_level, purpose, request_date, required_date, status, approved_by, notes, created_at, updated_at)
   - blood_transfusions table (id, request_id, patient_id, blood_unit_id, transfusion_date, start_time, end_time, administered_by, reactions, notes, status, created_at, updated_at)
   - blood_tests table (id, blood_unit_id, test_type, test_date, result, tested_by, equipment_used, notes, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_blood_donors_table.php
   - database/migrations/create_blood_donations_table.php
   - database/migrations/create_blood_units_table.php
   - database/migrations/create_blood_requests_table.php
   - database/migrations/create_blood_transfusions_table.php
   - database/migrations/create_blood_tests_table.php
   - app/Models/BloodDonor.php
   - app/Models/BloodDonation.php
   - app/Models/BloodUnit.php
   - app/Models/BloodRequest.php
   - app/Models/BloodTransfusion.php
   - app/Models/BloodTest.php
   - app/Http/Controllers/BloodBankController.php
   - app/Http/Controllers/BloodDonorController.php
   - app/Http/Controllers/BloodTransfusionController.php
   - app/Services/BloodBankService.php
   - app/Services/BloodCompatibilityService.php

   Frontend:
   - src/views/blood-bank/BloodBankDashboard.vue
   - src/views/blood-bank/DonorManagement.vue
   - src/views/blood-bank/BloodCollection.vue
   - src/views/blood-bank/BloodInventory.vue
   - src/views/blood-bank/BloodRequests.vue
   - src/views/blood-bank/TransfusionTracking.vue
   - src/components/blood-bank/DonorCard.vue
   - src/components/blood-bank/BloodUnitCard.vue
   - src/components/blood-bank/CompatibilityChecker.vue
   - src/components/blood-bank/InventoryChart.vue
   - src/stores/bloodBank.js
   - src/stores/bloodDonors.js
   - src/utils/bloodBankHelpers.js
   - src/assets/css/blood-bank.css

5. Features:
   - Complete donor registration and screening
   - Blood collection workflow
   - Inventory management with expiry tracking
   - Blood compatibility checking
   - Transfusion management and tracking
   - Quality control and testing protocols
   - Automated alerts for low inventory
   - Donor appointment scheduling
```

---

## PHASE 16: Communication & Notification System

### Prompt for Phase 16:
```
Create HMS Phase 16 - Communication & Notification System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Internal messaging system
   - Push notification service
   - Email and SMS integration
   - Announcement management
   - Communication templates
   - Real-time chat functionality

2. Vue.js Frontend:
   - Unified inbox interface
   - Real-time messaging
   - Notification center
   - Announcement board
   - Chat interface
   - Communication preferences

3. Database Structure:
   - messages table (id, sender_id, recipient_id, subject, body, priority, type, status, read_at, parent_message_id, created_at, updated_at)
   - message_attachments table (id, message_id, filename, file_path, file_size, file_type, created_at, updated_at)
   - notifications table (id, user_id, title, message, type, data, read_at, action_url, created_at, updated_at)
   - announcements table (id, title, content, priority, start_date, end_date, target_roles, created_by, status, created_at, updated_at)
   - communication_templates table (id, name, type, subject, body, variables, created_by, created_at, updated_at)
   - notification_preferences table (id, user_id, notification_type, email_enabled, sms_enabled, push_enabled, created_at, updated_at)
   - chat_rooms table (id, name, type, participants, created_by, last_activity, created_at, updated_at)
   - chat_messages table (id, room_id, sender_id, message, message_type, attachments, read_by, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_messages_table.php
   - database/migrations/create_message_attachments_table.php
   - database/migrations/create_notifications_table.php
   - database/migrations/create_announcements_table.php
   - database/migrations/create_communication_templates_table.php
   - database/migrations/create_notification_preferences_table.php
   - database/migrations/create_chat_rooms_table.php
   - database/migrations/create_chat_messages_table.php
   - app/Models/Message.php
   - app/Models/MessageAttachment.php
   - app/Models/Notification.php
   - app/Models/Announcement.php
   - app/Models/CommunicationTemplate.php
   - app/Models/NotificationPreference.php
   - app/Models/ChatRoom.php
   - app/Models/ChatMessage.php
   - app/Http/Controllers/MessageController.php
   - app/Http/Controllers/NotificationController.php
   - app/Http/Controllers/ChatController.php
   - app/Services/NotificationService.php
   - app/Services/EmailService.php
   - app/Services/SMSService.php

   Frontend:
   - src/views/communication/Inbox.vue
   - src/views/communication/ComposeMessage.vue
   - src/views/communication/NotificationCenter.vue
   - src/views/communication/Announcements.vue
   - src/views/communication/ChatRooms.vue
   - src/components/communication/MessageList.vue
   - src/components/communication/MessageCard.vue
   - src/components/communication/NotificationItem.vue
   - src/components/communication/ChatInterface.vue
   - src/components/communication/AnnouncementCard.vue
   - src/stores/communication.js
   - src/stores/notifications.js
   - src/utils/communicationHelpers.js
   - src/assets/css/communication.css

5. Features:
   - Internal messaging system
   - Real-time notifications
   - Department-wide announcements
   - Group chat functionality
   - Email and SMS integration
   - Message templates and automation
   - Communication preferences
   - File attachments support
```

---

## PHASE 17: Quality Management & Compliance

### Prompt for Phase 17:
```
Create HMS Phase 17 - Quality Management & Compliance System

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Quality indicators tracking
   - Incident reporting system
   - Audit management
   - Policy and procedure management
   - Compliance monitoring
   - Accreditation tracking

2. Vue.js Frontend:
   - Quality dashboard with KPIs
   - Incident reporting interface
   - Audit planning and execution
   - Policy management system
   - Compliance tracking
   - Quality reports generation

3. Database Structure:
   - quality_indicators table (id, name, description, category, target_value, measurement_unit, frequency, responsible_department, created_at, updated_at)
   - quality_measurements table (id, indicator_id, measurement_date, value, notes, measured_by, created_at, updated_at)
   - incidents table (id, incident_number, type, severity, location, description, reporter_id, occurred_at, status, investigation_notes, corrective_actions, responsible_person_id, created_at, updated_at)
   - audits table (id, audit_type, title, scope, planned_date, actual_date, auditor_id, status, findings, recommendations, follow_up_date, created_at, updated_at)
   - policies table (id, policy_number, title, category, version, effective_date, review_date, approved_by, status, file_path, created_at, updated_at)
   - compliance_requirements table (id, requirement_name, regulatory_body, description, due_date, responsible_person_id, status, evidence_path, created_at, updated_at)
   - corrective_actions table (id, incident_id, audit_id, action_description, responsible_person_id, due_date, completion_date, status, verification_notes, created_at, updated_at)

4. Specific Files to Create:
   Backend:
   - database/migrations/create_quality_indicators_table.php
   - database/migrations/create_quality_measurements_table.php
   - database/migrations/create_incidents_table.php
   - database/migrations/create_audits_table.php
   - database/migrations/create_policies_table.php
   - database/migrations/create_compliance_requirements_table.php
   - database/migrations/create_corrective_actions_table.php
   - app/Models/QualityIndicator.php
   - app/Models/QualityMeasurement.php
   - app/Models/Incident.php
   - app/Models/Audit.php
   - app/Models/Policy.php
   - app/Models/ComplianceRequirement.php
   - app/Models/CorrectiveAction.php
   - app/Http/Controllers/QualityController.php
   - app/Http/Controllers/ComplianceController.php
   - app/Services/QualityService.php
   - app/Services/ComplianceService.php

   Frontend:
   - src/views/quality/QualityDashboard.vue
   - src/views/quality/IncidentReporting.vue
   - src/views/quality/AuditManagement.vue
   - src/views/quality/PolicyManagement.vue
   - src/views/quality/ComplianceTracking.vue
   - src/views/quality/QualityReports.vue
   - src/components/quality/QualityKPI.vue
   - src/components/quality/IncidentForm.vue
   - src/components/quality/AuditPlanner.vue
   - src/components/quality/PolicyViewer.vue
   - src/stores/quality.js
   - src/stores/compliance.js
   - src/utils/qualityHelpers.js
   - src/assets/css/quality.css

5. Features:
   - Quality performance indicators
   - Incident reporting and investigation
   - Internal audit management
   - Policy and procedure control
   - Regulatory compliance tracking
   - Corrective action management
   - Quality reporting and analytics
   - Accreditation preparation support
```

---

## PHASE 18: System Integration & Security

### Prompt for Phase 18:
```
Create HMS Phase 18 - System Integration & Security

IMPORTANT: Follow these Code Structure Guidelines throughout development:

File Organization Rules:
1. Vue Components: One component per file, no inline styles or scripts
2. CSS Files: Separate Tailwind-based CSS files for each module
3. JavaScript Utils: Separate utility files for common functions
4. API Calls: Centralized in dedicated service files
5. State Management: Separate Pinia stores for each module
6. Laravel Controllers: Single responsibility, thin controllers
7. Models: Include relationships and business logic
8. Migrations: Detailed with proper indexing and constraints

Naming Conventions:
- Vue Files: PascalCase (PatientList.vue)
- CSS Files: kebab-case (patient-list.css)
- JS Utils: camelCase (dateHelpers.js)
- Laravel Files: Follow PSR standards
- Database Tables: snake_case with proper pluralization

Code Quality Standards:
- Clean, readable code with proper comments
- Error handling in all API calls
- Form validation on both frontend and backend
- Responsive design with Tailwind
- Proper loading states and user feedback
- Security best practices (CSRF, validation, sanitization)

Requirements:
1. Laravel Backend:
   - Advanced authentication and authorization
   - API security and rate limiting
   - Data encryption and privacy
   - Audit logging and monitoring
   - External system integrations
   - Backup and disaster recovery

2. Vue.js Frontend:
   - Security dashboard
   - Integration monitoring
   - Backup management interface
   - Security alerts and logs
   - API documentation viewer
   - System health monitoring

3. Database Structure:
   - api_keys table (id, name, key_hash, permissions, rate_limit, last_used_at, expires_at, created_by, status, created_at, updated_at)
   - audit_logs table (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at, updated_at)
   - security_events table (id, event_type, severity, description, source_ip, user_id, metadata, status, created_at, updated_at)
   - integrations table (id, name, type, endpoint, authentication, configuration, status, last_sync_at, created_at, updated_at)
   - encryption_keys table (id, name, key_hash, algorithm, purpose, created_at
**اكتب برمبتك وسأبدأ العمل فوراً!** 🎯✨
