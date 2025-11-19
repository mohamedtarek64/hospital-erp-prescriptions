# Cleopatra Hospital Prescription Management System

A comprehensive hospital management system designed to streamline hospital operations, with a primary focus on prescription and patient management. This project features a decoupled architecture with a Laravel-based backend API and a Vue.js single-page application for the frontend.

## Key Features

*   **Patient Management:** Manage patient records, admissions, and medical history.
*   **Prescription Handling:** Create, manage, and dispense prescriptions electronically.
*   **Appointment Scheduling:** Book and manage patient appointments with staff.
*   **Billing & Invoicing:** Generate invoices, track payments, and manage insurance claims.
*   **Laboratory Management:** Handle lab requests, samples, and results.
*   **Staff & Payroll:** Manage employee information, attendance, leave, and payroll.
*   **Inventory Control:** Track medicines, equipment, and other assets.
*   **Emergency Services:** Manage emergency cases, dispatch ambulances, and track equipment.
*   **Reporting:** Generate various reports for analytics and auditing purposes.

## Technologies Used

*   **Backend:**
    *   PHP
    *   Laravel Framework
    *   Composer for dependency management
*   **Frontend:**
    *   JavaScript
    *   Vue.js
    *   Node.js / npm for dependency management
*   **Database:**
    *   MySQL / MariaDB (or any other Laravel-supported relational database)

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

*   PHP (>= 8.0)
*   Composer
*   Node.js & npm
*   A local web server environment (e.g., XAMPP, WAMP, Laragon)
*   A database server (e.g., MySQL)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd cleopatra-hospital-prescription
    ```

2.  **Backend Setup (Laravel):**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Install PHP dependencies
    composer install

    # Create a copy of the .env.example file
    cp .env.example .env

    # Generate an application key
    php artisan key:generate

    # Open the .env file and configure your database credentials (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

    # Run database migrations and seeders
    php artisan migrate --seed
    ```

3.  **Frontend Setup (Vue.js):**
    ```bash
    # Navigate to the frontend directory from the project root
    cd ../frontend-new

    # Install JavaScript dependencies
    npm install
    ```

## Running the Application

You will need to run the backend and frontend servers simultaneously in two separate terminal windows.

1.  **Run the Backend Server:**
    ```bash
    # In the /backend directory
    php artisan serve
    ```
    The Laravel API will typically be running at `http://127.0.0.1:8000`.

2.  **Run the Frontend Development Server:**
    ```bash
    # In the /frontend-new directory
    npm run serve
    ```
    The Vue.js application will be available at `http://localhost:8080` (or another port if 8080 is in use). Open this URL in your browser.