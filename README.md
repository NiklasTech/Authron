# Authron – Secure Password Manager

**Authron** is a modern, secure password management application built with React frontend and Python/FastAPI backend. It provides a safe and intuitive way to store, organize, and generate strong passwords with end-to-end encryption, ensuring your sensitive data remains protected even in the event of a database compromise.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey)
![Version](https://img.shields.io/github/v/release/niklastech/authron)

---

## 🚀 Features

- 🔐 **Secure Password Storage** – All passwords encrypted with AES-256
- 🔧 **Password Generator** – Create strong, unique passwords with customizable settings
- 🗂️ **Categories & Favorites** – Organize passwords into categories and mark favorites
- 📊 **Password Strength Analysis** – Visual feedback and suggestions to improve security
- 🛠️ **Admin Panel** – User management and system statistics for administrators
- 🔒 **Two-Factor Authentication (2FA)** – Extra protection with TOTP-based verification
- 🌐 **Multilingual Support** – Available in English and German
- 💡 **Modern UI** – Responsive, user-friendly interface
- ⏱️ **Auto-Logout** – Automatic logout after configurable inactivity period
- 🧩 **TOTP Generator** – Generate 2FA codes for other services directly in the app
- 📥 **Import/Export** – Securely import and export stored passwords (JSON/CSV)
- 🤝 **Password Sharing** – Safely share credentials with trusted contacts
- 🖥️ **Desktop App** – Native desktop application with Electron
- 📱 **Responsive Design** – Works on desktop, tablet, and mobile devices

---

## 📦 Installation

### Quick Install (Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/niklastech/authron/main/install.sh | bash
```

### Manual Download

Download the latest release for your platform:

| Platform    | Download                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **Linux**   | [Authron.AppImage](https://github.com/niklastech/authron/releases/latest/download/Authron.AppImage)     |
| **Windows** | [Authron Setup.exe](https://github.com/niklastech/authron/releases/latest/download/Authron%20Setup.exe) |
| **macOS**   | [Authron.dmg](https://github.com/niklastech/authron/releases/latest/download/Authron.dmg)               |

#### Linux Installation

```bash
# Download and install
wget https://github.com/niklastech/authron/releases/latest/download/Authron.AppImage
chmod +x Authron.AppImage
./Authron.AppImage

# Optional: Install system-wide
sudo mv Authron.AppImage /usr/local/bin/authron
```

#### Windows Installation

1. Download `Authron Setup.exe`
2. Run the installer as Administrator
3. Follow the installation wizard
4. Launch from Start Menu or Desktop

#### macOS Installation

1. Download `Authron.dmg`
2. Mount the disk image
3. Drag Authron to Applications folder
4. Launch from Applications or Launchpad

---

## 🛠️ Development Setup

### Requirements

- **Node.js** v18 or higher
- **Python** v3.11 or higher
- **Git**

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/niklastech/authron.git
cd authron
```

2. **Backend Setup**

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt
cd ..
```

3. **Frontend Setup**

```bash
cd frontend
npm install
cd ..
```

4. **Initialize Database**

```bash
python -m backend.create_tables
```

### Running the Application

#### Option 1: Web Development Mode

**Terminal 1 (Backend):**

```bash
# Activate venv first
source backend/venv/bin/activate  # Linux/macOS
# backend\venv\Scripts\activate   # Windows

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

#### Option 2: LAN Access (Multiple Devices)

**Linux/macOS:**

```bash
./start.sh
```

**Windows:**

```bash
start.bat
```

Access from any device on your network using the displayed IP address.

#### Option 3: Desktop App (Electron)

**Linux/macOS:**

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

### Building for Production

#### Web Application

```bash
cd frontend
npm run build
```

#### Desktop Application

```bash
cd frontend
npm run build-electron
```

Built applications will be in `frontend/dist-electron/`

---

## 🔐 Security Features

Authron implements modern security best practices:

- **End-to-End Encryption**: All sensitive data encrypted with AES-256
- **Secure Password Hashing**: Argon2id algorithm for user passwords
- **JWT Authentication**: Short-lived tokens with automatic refresh
- **TOTP 2FA**: Time-based one-time passwords for enhanced security
- **CSRF Protection**: Cross-site request forgery prevention
- **Session Management**: Automatic logout and inactivity detection
- **Secure Communication**: HTTPS/TLS for all data transmission

### Default Admin Account

For initial setup, use these credentials:

- **Email:** `admin@example.com`
- **Password:** `Admin@1234`

**⚠️ Important:** Change the admin password immediately after first login!

---

## 📁 Project Structure

```
authron/
├── .github/
│   └── workflows/
│       └── build.yml           # GitHub Actions CI/CD
├── backend/                    # Python FastAPI backend
│   ├── api/v1/                # API routes and endpoints
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── passwords.py       # Password management
│   │   ├── admin.py           # Admin panel functionality
│   │   ├── user_settings.py   # User preferences
│   │   ├── two_factor.py      # 2FA implementation
│   │   ├── totp.py            # TOTP code generation
│   │   ├── backup.py          # Backup management
│   │   ├── export_import.py   # Data import/export
│   │   └── ...                # Additional endpoints
│   ├── database/              # Database models and config
│   │   ├── database.py        # Database connection
│   │   └── models.py          # SQLAlchemy models
│   ├── security/              # Authentication and encryption
│   │   ├── dependencies.py    # Auth dependencies
│   │   ├── utils.py           # Encryption utilities
│   │   └── otp.py             # OTP generation
│   ├── translations/          # Multi-language support
│   │   ├── service.py         # Translation service
│   │   ├── xml_parser.py      # XML parser
│   │   └── translations.xml   # Translation strings
│   ├── main.py                # FastAPI application
│   ├── create_tables.py       # Database initialization
│   ├── requirements.txt       # Python dependencies
│   └── standalone_server.py   # Standalone server for builds
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Buttons.tsx    # Button components
│   │   │   ├── TextField.tsx  # Input fields
│   │   │   ├── Modal.tsx      # Modal dialogs
│   │   │   ├── Card.tsx       # Card containers
│   │   │   └── ...            # Additional components
│   │   ├── pages/             # Application pages
│   │   │   ├── login/         # Authentication pages
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── legal/         # Terms & Privacy pages
│   │   │   ├── DashboardPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/          # API service layer
│   │   │   ├── PasswordServices.ts
│   │   │   ├── UserService.ts
│   │   │   ├── TOTPService.ts
│   │   │   └── ...            # Additional services
│   │   ├── context/           # React context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── NLSContext.tsx # Internationalization
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── App.tsx            # Main application component
│   ├── electron.cjs           # Electron main process
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── tsconfig.json          # TypeScript configuration
├── install.sh                 # Linux installation script
├── start.sh                   # Linux/macOS development script
├── start.bat                  # Windows development script
├── start-electron.sh          # Linux/macOS Electron script
├── start-electron.bat         # Windows Electron script
├── LICENSE                    # MIT License
└── README.md                  # This file
```

---

## 🌐 API Documentation

The API documentation is automatically generated and available at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key API Endpoints

| Endpoint                                | Method         | Description                     |
| --------------------------------------- | -------------- | ------------------------------- |
| `/api/v1/auth/login`                    | POST           | User authentication             |
| `/api/v1/auth/register`                 | POST           | User registration               |
| `/api/v1/passwords`                     | GET/POST       | Password management             |
| `/api/v1/passwords/{id}`                | GET/PUT/DELETE | Individual password operations  |
| `/api/v1/admin/users`                   | GET            | Admin user management           |
| `/api/v1/users/settings`                | GET/PUT        | User preferences                |
| `/api/v1/auth/2fa/setup`                | POST           | Two-factor authentication setup |
| `/api/v1/totp/{id}/code`                | GET            | Generate TOTP codes             |
| `/api/v1/export-import/export/{format}` | GET            | Export passwords                |
| `/api/v1/export-import/import`          | POST           | Import passwords                |

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in the `backend/` directory:

```env
# Security
SECRET_KEY=your-super-secret-key-here
ENCRYPTION_KEY=your-32-byte-base64-encryption-key

# Database (optional - defaults to SQLite)
DATABASE_URL=sqlite:///./password_manager.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/authron

# Email (for password sharing - optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# CORS Origins (add your domains)
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### User Settings

Users can configure:

- **Language**: English or German
- **Auto-logout**: 5 minutes to never
- **Password Timeout**: Auto-hide passwords after X seconds
- **Two-Factor Authentication**: TOTP-based 2FA

### Admin Settings

Administrators can:

- Manage user accounts (create, edit, disable)
- View system statistics and usage
- Configure password policies
- Manage automatic backups
- Export activity logs
- Monitor system health

---

## 🔄 Import/Export

### Supported Formats

- **JSON**: Full data with metadata
- **CSV**: Standard format with fields: Title, Username, Email, Password, Website, Category, Notes

### Export Data

1. Go to Settings → Data Management
2. Choose export format (JSON/CSV)
3. Click "Export Passwords"
4. Save the file securely

### Import Data

1. Go to Settings → Data Management
2. Click "Import Passwords"
3. Select your CSV/JSON file (must match Authron format)
4. Review import summary
5. Confirm import

**Note**: CSV must have correct column headers. Other password managers may need manual formatting.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the Repository**

```bash
git clone https://github.com/yourusername/authron.git
cd authron
```

2. **Create Feature Branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make Changes**

- Follow existing code style
- Add tests for new features
- Update documentation

4. **Test Your Changes**

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

5. **Commit and Push**

```bash
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

6. **Create Pull Request**

- Describe your changes
- Reference any related issues
- Ensure CI passes

### Code Style

- **Backend**: Follow PEP 8 (use `black` formatter)
- **Frontend**: Use Prettier and ESLint
- **Commits**: Use conventional commit messages

### Reporting Bugs

1. Check [existing issues](https://github.com/niklastech/authron/issues)
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Feature Requests

1. Search for existing feature requests
2. Create new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

```bash
# Check Python version
python --version  # Should be 3.11+

# Recreate virtual environment
rm -rf backend/venv
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend build fails

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Database issues

```bash
# Reset database (⚠️ loses all data)
rm -f backend/password_manager.db
python -m backend.create_tables
```

#### Electron app won't start

```bash
# Rebuild native dependencies
cd frontend
npm rebuild
```

### Platform-Specific Issues

#### Linux

- **AppImage won't run**: `chmod +x Authron.AppImage`
- **Missing dependencies**: Install `libfuse2` or `fuse3`

#### Windows

- **Antivirus blocks app**: Add exception for Authron
- **Admin rights required**: Run installer as Administrator

#### macOS

- **App can't be opened**: System Preferences → Security → Allow apps from anywhere
- **Gatekeeper warning**: `xattr -rd com.apple.quarantine Authron.app`

### Getting Help

1. **Documentation**: Check this README first
2. **Issues**: [GitHub Issues](https://github.com/niklastech/authron/issues)
3. **Discussions**: [GitHub Discussions](https://github.com/niklastech/authron/discussions)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

### MIT License Summary

- ✅ **Commercial use**
- ✅ **Modification**
- ✅ **Distribution**
- ✅ **Private use**
- ❌ **Liability**
- ❌ **Warranty**

---

## 🔗 Links & Resources

- **GitHub Repository**: [https://github.com/niklastech/authron](https://github.com/niklastech/authron)
- **Releases**: [https://github.com/niklastech/authron/releases](https://github.com/niklastech/authron/releases)
- **Issues**: [https://github.com/niklastech/authron/issues](https://github.com/niklastech/authron/issues)
- **Discussions**: [https://github.com/niklastech/authron/discussions](https://github.com/niklastech/authron/discussions)
- **Documentation**: [Wiki](https://github.com/niklastech/authron/wiki)

### Related Projects

- **FastAPI**: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- **React**: [https://reactjs.org/](https://reactjs.org/)
- **Electron**: [https://electronjs.org/](https://electronjs.org/)
- **Tailwind CSS**: [https://tailwindcss.com/](https://tailwindcss.com/)

---

## 🙏 Acknowledgments

Special thanks to:

- **FastAPI** team for the excellent Python web framework
- **React** team for the powerful frontend library
- **Electron** team for enabling cross-platform desktop apps
- **Tailwind CSS** for the utility-first CSS framework
- **All contributors** who help improve Authron

---

## 📞 Support

### Community Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/niklastech/authron/issues)

### Professional Support

For enterprise deployments and professional support, contact: [haeussler.business@gmail.com](mailto:haeussler.business@gmail.com)

---

**Made with ❤️ by [NiklasTech](https://github.com/niklastech)**

_Secure your digital life with Authron - where security meets simplicity._
