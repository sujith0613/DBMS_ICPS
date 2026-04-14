# Project Submission: ICPS Enterprise
## Insurance Claim Processing System

**Course Project | DBMS / Software Engineering**

---

### 🌐 Live Application Links
*   **Production Frontend:** [https://dbms-icps-18366885i-sujithms-projects.vercel.app/login](https://dbms-icps-18366885i-sujithms-projects.vercel.app/login)
*   **Source Code (GitHub):** [https://github.com/sujith0613/DBMS_ICPS](https://github.com/sujith0613/DBMS_ICPS)
*   **Video Demonstration:** [Google Drive Link](https://drive.google.com/file/d/1aHzeX4xIszKju74KBp_QAm-quI9VXK2S/view?usp=sharing)

---

### 📝 Project Overview
**ICPS (Insurance Claim Processing System)** is a comprehensive, full-stack enterprise solution designed to manage the end-to-end lifecycle of insurance claims. The system facilitates seamless interaction between policyholders, surveyors, branch managers, and service providers through a secure, role-based platform.

#### Key Features:
*   **Dynamic Claim Filing**: A multi-step wizard for policyholders with real-time status tracking.
*   **Advanced Analytics**: Visualized claim trends and status distribution using dashboard-integrated charts.
*   **Secure Document Management**: Industrial-grade file storage using MongoDB GridFS for sensitive claim evidence (PDFs, Images).
*   **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for 5 different user types.
*   **Enterprise Aesthetics**: Premium UI built with high-performance Vanilla CSS and modern design principles.

---

### 🛠️ Technical Stack
| Layer | Specification |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TanStack Query, Recharts, Lucide, Sonner |
| **Backend** | Node.js, Express, JWT (HttpOnly Cookies), Multer |
| **Database** | MongoDB (Mongoose), GridFS for Blob Storage |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

### 🔑 Demo Experience (Login Credentials)
*All accounts use the password:* **`password`**

| Role | Email | Use Case |
| :--- | :--- | :--- |
| **Admin** | `admin@icps.com` | System-wide analytics and oversight |
| **Manager** | `manager@icps.com` | Branch-specific claim approval workflow |
| **Policyholder** | `arjunkumar@gmail.com` | File and track insurance claims |
| **Surveyor** | `rajesh@icps.com` | Scientific review and recommendations |
| **Provider** | `apollo@hospital.com` | Verify services/treatment provided |

---

### 🏗️ Architecture & Deployment Details
The project follows a decoupled **Client-Server Architecture**:

1.  **Frontend (Vercel)**: Deployed as a Single Page Application (SPA). It uses environment variables to communicate with the remote backend.
2.  **Backend (Render)**: A RESTful API server. It handles authentication, data validation, and business logic.
3.  **Database (Atlas)**: A cloud-hosted NoSQL database. It utilizes GridFS to store claim documents larger than 16MB and handles relational-like data through Mongoose schemas.
4.  **CORS & Security**: Implemented dynamic CORS origin handling and cross-domain JWT cookie persistence for secure authentication.

---


**Repository:** [sujith0613/DBMS_ICPS](https://github.com/sujith0613/DBMS_ICPS)
