# Authron – Secure Password Manager

**Authron** is a modern and secure password management application built with a React frontend and a Python/FastAPI backend. It provides a safe and intuitive way to store, organize, and generate strong passwords – with end-to-end encryption ensuring your sensitive data remains protected, even in the event of a database compromise.

---

## 🚀 Features

- 🔐 **Secure Password Storage** – All passwords are encrypted using AES-256
- 🔧 **Password Generator** – Create strong, unique passwords with customizable settings
- 🗂️ **Categories & Favorites** – Organize passwords into categories and mark favorites for quick access
- 📊 **Password Strength Analysis** – Visual feedback and suggestions to improve password strength
- 🛠️ **Admin Panel** – User management and system statistics for administrators
- 🔒 **Two-Factor Authentication (2FA)** – Extra layer of protection with TOTP-based verification
- 🌐 **Multilingual Support** – Available in English and German
- 💡 **Modern UI** – Responsive, user-friendly interface using React and Tailwind CSS
- ⏱️ **Auto-Logout** – Automatic logout after configurable inactivity period
- 🧩 **TOTP Generator** – Generate 2FA codes for other services directly in the app
- 📥 **Import/Export** – Securely import and export stored passwords
- 🤝 **Password Sharing** – Safely share credentials with trusted contacts
- 🖥️ **Desktop App** – Optional native desktop application with Electron

---

## 🛠️ Tech Stack

### Frontend

- React (TypeScript)
- Tailwind CSS
- Vite
- Axios
- Electron (optional)

### Backend

- Python with FastAPI
- SQLite (PostgreSQL supported)
- JWT-based authentication
- Fernet symmetric encryption
- Argon2 for password hashing

---

## ⚙️ Getting Started

### Requirements

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

---

### 📦 Installation

1. **Clone the Repository**

```bash
git clone https://github.com/niklastech/authron.git
cd authron
```

2. **Set up the Backend**

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

pip install -r requirements.txt

# Initialize the database
cd ..
python -m backend.create_tables
```

3. **Set up the Frontend**

```bash
cd frontend
npm install
```

4. **Optional: Prepare Electron Desktop App**

```bash
cd frontend
npm install  # If not already done
```

---

### ▶️ Run the App

You have three options to run Authron:

#### Option 1: Web Application (Development)

**Start the Backend Server**

```bash
# Make sure the virtual environment is activated
uvicorn backend.main:app --reload
```

The API will be available at: [http://localhost:8000](http://localhost:8000)
Swagger documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

**Start the Frontend Dev Server**

Open a new terminal window:

```bash
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

#### Option 2: LAN Access (Multiple Devices)

Use the provided start scripts to run Authron on your local network:

**Linux/Mac:**

```bash
./start.sh
```

**Windows:**

```bash
start.bat
```

These scripts will:

- Automatically detect your local IP address
- Start the backend on your network IP
- Start the frontend configured for network access
- Allow access from other devices on your network

#### Option 3: Desktop App (Electron)

For a native desktop experience, you can run Authron as an Electron app:

**Prerequisites:**

- All above requirements fulfilled
- Backend and Frontend dependencies installed

**Start the Desktop App:**

**Linux/Mac:**

```bash
./start-electron.sh
```

**Windows:**

```bash
start-electron.bat
```

**Or manually:**

```bash
cd frontend
npm run electron-dev
```

**Desktop App Features:**

- Native desktop integration
- Automatic backend startup
- Optimized performance
- Platform-specific menus
- Offline capability

**Build for Distribution:**

```bash
cd frontend
npm run build-electron
```

The built app will be in the `frontend/dist-electron/` folder.

---

### 👤 Default Admin Account

Use the following credentials to log in as admin:

- **Email:** `admin@example.com`
- **Password:** `Admin@1234`

---

## 🔐 Security Highlights

Authron applies modern best practices to ensure data safety:

- End-to-end encryption for all sensitive data
- Strong password hashing with Argon2id
- Short-lived JWT tokens for secure authentication
- TOTP-based 2FA for enhanced login protection
- CSRF protection mechanisms
- Session timeout and auto-logout after inactivity

---

## 📁 Project Structure

```
authron/
├── backend/                 # Python FastAPI backend
│   ├── api/v1/             # API routes
│   ├── database/           # Database models and config
│   ├── security/           # Authentication and encryption
│   └── translations/       # Multi-language support
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service layer
│   │   └── context/        # React context providers
│   ├── electron.cjs        # Electron main process
│   └── package.json        # Frontend dependencies
├── start.sh               # Linux/Mac start script
├── start.bat              # Windows start script
├── start-electron.sh      # Linux/Mac Electron start script
└── start-electron.bat     # Windows Electron start script
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- [GitHub Repository](https://github.com/niklastech/authron)
- [Issues](https://github.com/niklastech/authron/issues)
- [Releases](https://github.com/niklastech/authron/releases)

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/niklastech/authron/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

**Made with ❤️ by [NiklasTech](https://github.com/niklastech)**
