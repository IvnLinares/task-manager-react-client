# Task Manager - React Client 🚀

A modern React frontend application built with Vite and React-Bootstrap to consume the FastAPI Task Manager API. This project serves as an example client showcasing authentication, task management (CRUD), category organization, and advanced features like search and file uploads.

## Features ✨

* **JWT Authentication**: Secure login and registration flows.
* **Task Dashboard**: A clean interface to view, create, edit, and delete tasks.
* **Category Management**: Organize tasks into personalized categories using a sleek sidebar drawer.
* **Advanced Search**: Filter tasks instantly by text queries or priority tags.
* **File Uploads**: Attach files to tasks with real-time feedback.
* **Responsive Design**: Built with React-Bootstrap to ensure functionality across all device sizes.
* **Protected Routing**: Secure areas of the app using React Router Context.

## Tech Stack 🛠️

* **Frontend**: React.js
* **Bundler**: Vite
* **Styling**: React-Bootstrap (Vanilla Bootstrap Integration)
* **Routing**: React Router v6
* **HTTP Client**: Axios (with custom interceptors)

## Getting Started 🏁

### Prerequisites

Ensure you have the following installed:
* [Node.js](https://nodejs.org/en/) (v16 or higher)
* `npm` or `yarn` (comes with Node.js)

The backend FastAPI server needs to be running. By default, this app expects the API at `http://localhost:8000/api/v1`. 

### Installation

1. Clone this repository (or copy the project folder).
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

### Connecting to the Backend

If your backend is running on a different port or host, update the `baseURL` inside `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Change me!
  // ...
});
```

## Folder Structure 📂

```text
src/
├── components/   # Reusable UI elements (Modals, Overlays, Sidebars)
├── contexts/     # React Context for global state (e.g., AuthContext)
├── layouts/      # High-level layouts like the Navigation Bar
├── pages/        # Route-level components (Login, Register, Dashboard)
├── services/     # API request mappers (Axios calls)
└── App.jsx       # App entry point with Router logic
```

## Contributing 🤝

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request. Make sure to adhere to existing code styles.

## License 📜

This code is intended as an educational portfolio example and is open for public reference.
