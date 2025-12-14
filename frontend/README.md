Sweet Shop Management System

A fullstack application that allows users(customers) to browse, search, and purchase sweets, while administrators can manage inventory, pricing, and stock levels.

The project demonstrates clean architecture, secure authentication, RESTful APIs, modern frontend development, automated testing, and responsible AI usage.

## 🚀 Features

### 👤 Authentication

* User registration & login
* JWT-based authentication
* Role-based access (User / Admin)

### 🍭 Sweets Management

* View all available sweets
* Search sweets by:
  * Name
  * Category
  * Price range
* Purchase sweets (stock auto-decreases)
* Prevent purchases when stock is zero

### 🛠 Admin Capabilities

* Add new sweets
* Update sweet details
* Delete sweets
* Restock inventory

### Real-Time & Communication Features

* WebSocket Integration (Socket.IO)

* Real-time stock updates across all connected users

Instantly reflects quantity changes when:

Another customer purchases a sweet

Admin restocks inventory

Prevents over-ordering with live quantity validation

Email Notifications (SendGrid)

OTP delivery for order confirmation

Purchase confirmation emails with bill summary

Admin alerts for low-stock items (optional enhancement)

OTP-Based Order Confirmation

Secure OTP generation and verification before placing orders

OTPs are:

Time-bound (expires after a short duration)

Single-use

Ensures order authenticity and prevents accidental purchases

Billing & Order Confirmation

Auto-generated order summary after successful payment/confirmation

Bill includes:

Sweet name(s)

Quantity purchased

Price breakdown

Total amount

Order ID & timestamp

Confirmation sent via email and reflected in user order history

## 🏗 Tech Stack

### Backend

* Node.js + Express
* MongoDB (Mongoose ODM)
* JWT Authentication

### Frontend

* React
* Axios (API communication)


## 📂 Project Structure

```
sweet-shop/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── app.js
│   ├── tests/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## 🔐 API Endpoints

### Auth

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |

### Sweets (Protected)

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/sweets`        | Add new sweet        |
| GET    | `/api/sweets`        | Get all sweets       |
| GET    | `/api/sweets/search` | Search sweets        |
| PUT    | `/api/sweets/:id`    | Update sweet         |
| DELETE | `/api/sweets/:id`    | Delete sweet (Admin) |

### Inventory

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/api/sweets/:id/purchase` | Purchase sweet        |
| POST   | `/api/sweets/:id/restock`  | Restock sweet (Admin) |

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js (v18+)
* MongoDB (local or cloud)
* Git

---

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/sweet-shop
JWT_SECRET=your_jwt_secret
```

Run backend:

```bash
npm run dev
```

Run backend tests:

```bash
npm test
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

Backend runs at:

```
http://localhost:4000
```

---

## 🧪 Testing Report

* **Framework**: Jest + Supertest
* **Coverage**:

  * Auth services
  * Sweet CRUD operations
  * Inventory logic
  * Authorization checks
* Tests follow **Red → Green → Refactor** workflow

Example:

```bash
 PASS  tests/sweets.test.js
 PASS  tests/auth.test.js

Test Suites: 5 passed
Tests:       42 passed
```

---

## 📸 Screenshots

> 📌 Add screenshots of:

* Login / Register page
* Sweet listing dashboard
* Admin sweet management
* Purchase flow

(Place images in `/screenshots` folder and link here)

---

## 🤖 My AI Usage

### AI Tools Used

* **ChatGPT**
* (Optional) GitHub Copilot

### How I Used AI

* Generated **initial boilerplate** for controllers and routes
* Helped design **REST API structure**
* Assisted in writing **unit and integration tests**
* Debugged async/await and JWT authentication issues
* Improved naming conventions and code readability

### What I Did Manually

* Business logic implementation
* Validation rules
* Database schema design
* UI behavior and state management
* Test case edge handling
* Refactoring and optimization

### Reflection

AI significantly improved my **development speed** and helped unblock issues faster, but I ensured:

* Full understanding of all generated code
* Manual refinement of logic
* No copy-pasting from external repositories

AI was used as a **co-pilot**, not a replacement.

---

## 📝 AI Co-Authorship (Git Commits)

For every commit where AI was used:

```bash
git commit -m "feat: add sweet purchase endpoint

Used AI to generate initial controller structure and tests.
Business logic and validations were manually implemented.

Co-authored-by: ChatGPT <AI@users.noreply.github.com>"
```

---

## 🌍 Deployment (Optional)

* Frontend: **Vercel / Netlify**
* Backend: **Render / Railway / Heroku**
* Database: **MongoDB Atlas**

🔗 Live Demo: *(Add link if deployed)*

---

## 👨‍💻 Author

**Your Name**
GitHub: [https://github.com/your-username](https://github.com/your-username)

---

## ✅ Final Notes

* Built with **TDD mindset**
* Clean, scalable architecture
* Transparent AI usage
* Interview-ready explanation

---

If you want, I can also:

* Tailor this README **exactly to your existing repo**
* Add **badges** (build, test, coverage)
* Create a **professional test report**
* Review your **commit history for TDD compliance**

Just tell me 👍
