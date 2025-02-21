#  User Management System
This is a simple User Management System built with Node.js (backend), React (frontend), and MySQL (database). It supports user registration, login using JWT authentication, CRUD operations for users, and basic role-based authorization.
Features
•	User Registration: Allows new users to register.
•	User Login: Provides JWT-based authentication.
•	User Management: Admin users can manage (create, read, update, delete) regular users.
•	Role-based Authorization: Only admins can access certain routes (e.g., create, read, update, delete users).
•	Validation: Both frontend and backend validate inputs.

## Prerequisites
Before you start, ensure you have the following installed:
•	Node.js (Backend)
•	npm (Backend and Frontend)
•	MySQL (Database)
•	React (Frontend)
## MySQL Setup
1.	Create a MySQL database named user_management and set up the users table:
sql
CopyEdit
CREATE DATABASE user_management;

USE user_management;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50)
);

## Backend Setup (Node.js + MySQL)
1. Clone the repository
bash
CopyEdit
git clone <repository_url>
cd <repository_directory>/backend
2. Install dependencies
Install the required dependencies for the backend:
bash
CopyEdit
npm install
3. Configure MySQL connection
In index.js (located in the backend folder), update the MySQL connection settings:
javascript
CopyEdit
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Update with your DB username
  password: '',  // Update with your DB password
  database: 'user_management'
});
4. Start the backend server
bash
CopyEdit
node index.js
The backend server should now be running at http://localhost:5000.

Frontend Setup (React)
1. Clone the repository
bash
CopyEdit
git clone <repository_url>
cd <repository_directory>/frontend
2. Install dependencies
Install the required dependencies for the frontend:
bash
CopyEdit
npm install
3. Start the frontend application
bash
CopyEdit
npm start
The React frontend should now be running at http://localhost:3000.

## How to Use
1.	Register a New User:
o	Navigate to the registration form on the homepage.
o	Fill in the name, email, password, and role (e.g., admin or user).
o	Click Register.
2.	Login:
o	Use the login form to enter your registered email and password.
o	After successful login, a JWT token is stored locally, and you can access restricted routes.
3.	Access Admin Features:
o	Admin users can view and manage other users via the Users List.
o	Non-admin users will not have access to the Users List or management features.
4.	Logout:
o	Click the Logout button to end the session, which will remove the JWT token.

## API Endpoints
Authentication
•	POST /api/register: Register a new user (requires name, email, password, role).
•	POST /api/login: Log in with email and password to receive a JWT token.
User Management (Requires JWT token for admin)
•	GET /api/users: Get a list of all users (restricted to admins).
•	POST /api/users: Create a new user (restricted to admins, requires name, email, password, role).
•	PUT /api/users/:id: Update a user (restricted to admins).
•	DELETE /api/users/:id: Delete a user (restricted to admins).

## Validation
•	Frontend: Input fields like name, email, password, and role are validated before submission.
•	Backend: We use Joi for input validation, ensuring that all fields conform to the required format.

## JWT Authentication
•	Login generates a JWT token that should be included in the Authorization header as a Bearer token for accessing protected routes.

## Known Issues
•	Ensure that your MySQL server is running before starting the backend.
•	The JWT secret key is hardcoded in the backend for simplicity. In a production environment, use environment variables to store sensitive information securely.
