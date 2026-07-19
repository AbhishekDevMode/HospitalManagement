# Hospital Management System 🏥

A full-stack web application designed to streamline hospital operations, manage patient records, schedule appointments, and handle doctor schedules. Built using a robust backend with Spring Boot and a dynamic, responsive user interface with React.

---

## 🚀 Features
*   **User Authentication & Authorization:** Secure login/signup for Patients, Doctors, and Admins (using JWT).
*   **Patient Management:** Electronic health records, admission histories, and profile management.
*   **Appointment Scheduling:** Real-time booking, cancellation, and status tracking for appointments.
*   **Doctor Dashboard:** View daily schedules, manage patient queues, and update prescriptions.
*   **Admin Panel:** Comprehensive control over hospital staff, departments, and billing modules.
*   **RESTful API:** Clean, decoupled architecture with structured JSON responses.

---

## 🛠️ Tech Stack

### Frontend
*   **React.js** (Functional components, Hooks)
*   **State Management:** Context API / Redux Toolkit
*   **Styling:** Tailwind CSS / Bootstrap
*   **Routing:** React Router DOM
*   **HTTP Client:** Axios

### Backend
*   **Java** & **Spring Boot**
*   **Security:** Spring Security (JWT Tokens)
*   **Data Access:** Spring Data JPA (Hibernate)
*   **Database:** MySQL / PostgreSQL
*   **Build Tool:** Maven / Gradle

---

## 📦 Project Structure

```text
HospitalManagement/
│
├── backend/          # Spring Boot Application
│   ├── src/
│   └── pom.xml       # (or build.gradle)
│
└── frontend/         # React Application
    ├── public/
    ├── src/
    └── package.json

```


⚙️ Getting Started
Follow these steps to set up and run the project locally.

Prerequisites
Java Development Kit (JDK 26)

Node.js (v22.13.1) & npm

MySQL/PostgreSQL database server

1. Database Configuration
Create a database named hospital_db in your SQL client.

Open backend/src/main/resources/application.properties and update your database credentials:
```text
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```
Run the Backend (Spring Boot)
```cd backend
# If using Maven
./mvnw spring-boot:run
# If using Gradle
./gradlew bootRun
```
Run the Frontend (React)
```
cd frontend
npm install
npm start
```
The application will open automatically in your browser at http://localhost:3000

