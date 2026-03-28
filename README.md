# 🏥 MediRelay

**MediRelay** is a mobile application built with React Native (Expo) that streamlines the secure transfer of patient medical records between healthcare providers — using QR codes, Firebase, and role-based access control.

---

## 📱 Features

- 🔐 **Firebase Authentication** — Secure login and signup for users
- 👥 **Role-Based Access** — Distinct workflows for **Senders** (doctors/nurses initiating transfer) and **Receivers** (accepting providers)
- 📋 **Patient Transfer Form** — Fill in structured patient data before handoff
- 📦 **QR Code Generation** — Each transfer generates a unique, scannable QR code
- 📷 **QR Code Scanner** — Receivers scan QR codes to instantly pull up patient records
- 📄 **Record View Screen** — Full patient record display with export/share options (PDF, SMS)
- 🧭 **Persistent Navigation Bar** — Floating nav bar accessible from all screens

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo ~54) |
| Navigation | React Navigation (Stack) |
| Backend / Auth | Firebase (Firestore + Auth) |
| QR Code | `react-native-qrcode-svg` |
| Camera / Scanner | `expo-camera` |
| Export | `expo-print`, `expo-sharing`, `expo-sms` |
| Storage | `@react-native-async-storage/async-storage` |

---

## 📁 Project Structure

```
MediRelay/
├── App.js                  # Root navigator and auth state listener
├── firebase.js             # Firebase config and initialization
├── index.js                # Entry point
├── app.json                # Expo app config
│
├── screens/
│   ├── LoginScreen.js      # User login
│   ├── SignupScreen.js     # User registration
│   ├── RoleSelectScreen.js # Choose Sender or Receiver role
│   ├── HomeScreen.js       # Dashboard / home
│   ├── TransferFormScreen.js # Patient data entry form
│   ├── QRScreen.js         # QR code display after form submit
│   ├── ScannerScreen.js    # QR code scanner for receivers
│   └── RecordViewScreen.js # Full patient record viewer
│
├── components/
│   └── NavBar.js           # Persistent floating navigation bar
│
├── utils/                  # Shared utility functions
└── assets/                 # Icons, splash screen, images
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your phone (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/MediRelay.git
cd MediRelay

# Install dependencies
npm install
```

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password) and **Firestore Database**
3. Copy your Firebase config into `firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Running the App

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

Scan the QR code in the terminal with the **Expo Go** app on your phone.

---

## 🔄 App Flow

```
Login / Signup
     ↓
Role Selection (Sender / Receiver)
     ↓
┌────────────┬──────────────────┐
│  SENDER    │    RECEIVER      │
│            │                  │
│ Fill Form  │  Scan QR Code    │
│     ↓      │       ↓          │
│ QR Screen  │  Record View     │
└────────────┴──────────────────┘
```

---

## 📄 License

This project was built as a hackathon MVP. Feel free to fork and extend it.
