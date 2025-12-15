🍬 Sweet Shop Management System

🚀 Live Application
👉 https://sweet-shop-management-i94x.onrender.com/


🛠 Admin Credentials

Email: masoombaba657@gmail.com

Password: 123456

👤 Customer (User) Credentials

Email: masoombaba61@gmail.com

Password: 123

ℹ️ Important Notes

You may register a new customer account if desired.

To access admin features, you must log in using admin credentials.

The application automatically redirects users based on their role:

Admin → Admin Dashboard

Customer → Customer Home Page

A full-stack Sweet Shop Management System that allows customers to browse, search, and purchase sweets, while administrators manage inventory, pricing, and orders.
The application supports real-time inventory updates, OTP-based order confirmation, and secure role-based access.

## 📸 Application Preview

### 🔐 Login & Profile

![Login](output-screenshots/login.png)

![Profile Update](output-screenshots/profile-update.png)

---

### 👤 Customer Screens

![Customer Home](output-screenshots/User(Customer)/home.png)

![Search](output-screenshots/User(Customer)/search.png)

![Cart](output-screenshots/User(Customer)/cart.png)

![Order OTP](output-screenshots/User(Customer)/order-otp.png)

![Bill Details](output-screenshots/User(Customer)/bill-details.png)

![My Orders](output-screenshots/User(Customer)/my-orders.png)

---

### 🛠 Admin Screens

![Admin Home](output-screenshots/Admin/home.png)

![Add Sweet](output-screenshots/Admin/add-sweet.png)

![Edit Sweet](output-screenshots/Admin/edit-sweet.png)

![Inventory Update](output-screenshots/Admin/inventory-update.png)

![Customers](output-screenshots/Admin/customers.png)

![Orders](output-screenshots/Admin/orders.png)

🚀 Features

User Authentication – Secure registration and login using JWT.

Role-Based Access – Separate access control for customers and admins.

Sweet Browsing – View all available sweets with price and stock details.

Search & Filters – Search sweets by name, category, or price range.

Cart Management – Add items to cart with automatic price calculation.

OTP Order Confirmation – Verify orders using email-based OTP.

Email Notifications – Order and bill confirmations sent via SendGrid.

Billing System – Auto-generated bill with order summary and total amount.

Order History – Customers can view past orders and purchase details.

Real-Time Inventory – Live stock updates using WebSockets (Socket.IO).

Admin Sweet Management – Admins can add, edit, and delete sweets.

Inventory Restocking – Admin-only stock replenishment with live updates.

Customer Management – Admins can view and search registered users.

Order Management – Admins can monitor and manage all customer orders.

Secure APIs – Protected endpoints with validation and authorization.

🏗 Tech Stack
Backend

Node.js

Express.js

MongoDB (Mongoose ODM)

JWT Authentication

Socket.IO

SendGrid

Frontend

React (Vite)

Axios

Socket.IO Client

🛠 Local Setup & Run Instructions

Follow the steps below to run the project locally.

✅ Prerequisites

Ensure the following are installed:

Node.js (v18 or higher)

npm

MongoDB (Local or Atlas)

SendGrid account (for OTP & emails)

📂 Project Structure
sweet-shop-management-system/
├── backend/
├── frontend/
└── README.md

⚙️ Backend Setup (Express + MongoDB)
1️⃣ Navigate to backend directory
cd backend

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create a .env file inside backend:

PORT=4000
MONGO_URI=mongodb://localhost:27017/sweet-shop
JWT_SECRET=your_jwt_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email


⚠️ Do not commit .env to GitHub

4️⃣ Start MongoDB

Local MongoDB

mongod


OR MongoDB Atlas

Create a cluster

Copy the connection string

Replace MONGO_URI in .env

5️⃣ Start backend server
node server.js


Backend runs at:

http://localhost:4000

🎨 Frontend Setup (React + Vite)
1️⃣ Navigate to frontend directory
cd frontend

2️⃣ Install dependencies
npm install

3️⃣ Start development server
npm run dev


Frontend runs at:

http://localhost:5173

🔄 Real-Time Communication

WebSockets (Socket.IO) enabled automatically

Real-time stock updates across all users

Ensure backend is running before frontend

📧 Email & OTP Testing (SendGrid)

Verify sender email in SendGrid dashboard

Use the verified email in EMAIL_FROM

OTP emails are sent during order confirmation

Check inbox or spam folder

🚨 Common Issues & Fixes
Issue	Solution
MongoDB connection error	Check MONGO_URI
OTP email not received	Verify SendGrid API key & sender
Socket.IO not updating	Ensure backend is running
CORS error	Check backend CORS settings

🤖 My AI Usage

AI tools were actively used throughout the development of this project as productivity enhancers and co-pilots, while all core logic, architecture decisions, and final implementations were reviewed, validated, and refined manually.

🔧 AI Tools Used

Google Gemini AI

ChatGPT

🧠 How Gemini AI Was Used

Gemini AI was primarily used for visual assets, ideation, and development support:

Generated different kinds of sweet images used in the UI for product display and visual enhancement

Assisted in generating initial boilerplate code for backend routes, controllers, and frontend components

Helped debug runtime and logical issues, especially related to:

API integration

State management

UI rendering issues

Provided suggestions to enhance UI/UX, including layout ideas and component structuring

Assisted in optimizing user flows for better usability

🤖 How ChatGPT Was Used

ChatGPT was used extensively as a development assistant:

Generated boilerplate code for:

Backend APIs

Authentication flows

Frontend UI components

Helped design RESTful API structures and endpoint organization

Assisted in writing and refining:

Feature logic

Validation rules

Error handling patterns

Helped debug:

JWT authentication issues

OTP verification flows

WebSocket (Socket.IO) real-time update logic

Assisted in improving:

Code readability

Naming conventions

Documentation (including this README)

🛠 What Was Implemented Manually

Despite AI assistance, the following were designed and implemented manually:

Application architecture and folder structure

Database schema design (MongoDB models)

Business logic for:

Inventory handling

OTP validation

Order placement and billing

Role-based authorization rules

WebSocket event handling and synchronization

UI behavior and state management

Integration and coordination between backend and frontend

Final refactoring, optimization, and testing

🔍 Review & Responsibility

All AI-generated outputs were:

Carefully reviewed for correctness

Modified or rewritten where necessary

Integrated only after full understanding

Never copied from external repositories or third-party codebases

AI was used as a supporting tool, not as a replacement for engineering judgment.

🧠 Reflection on AI Usage

Using AI tools significantly improved development speed, helped unblock complex issues, and enhanced creativity—especially for UI design and debugging.
However, maintaining code ownership, understanding, and accountability remained a priority throughout the project.

AI was leveraged responsibly to augment development, while ensuring originality, correctness, and maintainability of the codebase.



Finally Deployed Backend and Frontend in Render and here is the Deployed Website Link : https://sweet-shop-management-i94x.onrender.com/





