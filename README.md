# 🔐 LifeVault — Secure Digital Life Document Vault

A production-ready SaaS application for securely storing every important personal document from birth to death.

## ✨ Features

- **🔒 Multi-Auth System** — Google OAuth, Email/Password, Phone OTP
- **📁 Document Management** — Upload, view, download, edit, delete documents
- **🤖 AI Categorization** — Smart auto-classify into Identity, Education, Property, Financial, Medical, Personal
- **🔎 Face Unlock** — Webcam-based biometric verification before document access  
- **👨‍👩‍👧 Family Vault** — Separate document profiles for each family member
- **🔗 Secure Sharing** — Expiring links with password protection and view tracking
- **📊 Dashboard Analytics** — Storage stats, category breakdown, recent uploads
- **🎨 Modern UI** — Dark theme glassmorphism with neon accents, fully responsive

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Animations | Framer Motion |
| Backend | Firebase (Auth, Firestore, Storage) |
| Deployment | Vercel |

## 📁 Project Structure

```
/lifevault
├── app/
│   ├── layout.js              # Root layout with AuthProvider
│   ├── page.js                # Landing page redirect
│   ├── globals.css            # Global styles, animations
│   ├── auth/
│   │   └── page.js            # Login/Signup/OTP page
│   ├── dashboard/
│   │   ├── layout.js          # Dashboard layout (auth guard)
│   │   ├── page.js            # Overview with stats
│   │   ├── documents/page.js  # Document list + Face Unlock
│   │   ├── upload/page.js     # Document upload flow
│   │   ├── family/page.js     # Family vault management
│   │   ├── share/page.js      # Secure share link creation
│   │   └── settings/page.js   # User settings
│   └── share/[linkId]/page.js # Public share view page
├── components/
│   ├── LandingPage.js         # Marketing landing page
│   ├── layout/
│   │   └── Sidebar.js         # Navigation sidebar
│   └── documents/
│       └── FaceUnlockModal.js # Webcam face verification
├── firebase/
│   ├── config.js              # Firebase initialization
│   ├── auth.js                # Auth helper functions
│   ├── firestore.js           # Firestore CRUD operations
│   ├── storage.js             # File upload/download
│   ├── firestore.rules        # Security rules
│   └── storage.rules          # Storage security rules
├── hooks/
│   ├── useAuth.js             # Auth context & provider
│   └── useDocuments.js        # Documents fetching hook
├── lib/
│   ├── constants.js           # Document types, categories
│   └── categorize.js          # AI keyword classification
├── .env.example               # Environment variables template
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🚀 Setup Instructions

### Step 1: Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd lifevault
npm install
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** → name it `lifevault`
3. Enable **Google Analytics** (optional)

#### Enable Authentication:
1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable: **Google**, **Email/Password**, **Phone**

#### Enable Firestore:
1. Firebase Console → **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose a region close to you

#### Enable Storage:
1. Firebase Console → **Storage** → **Get started**
2. Start in **production mode**

#### Get Config:
1. Project Settings → **General** → **Your apps** → **Add app** → **Web**
2. Register app name, copy `firebaseConfig`

### Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lifevault-xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lifevault-xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lifevault-xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Deploy Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, paste the contents of `firebase/firestore.rules`.

In Firebase Console → Storage → **Rules** tab, paste the contents of `firebase/storage.rules`.

### Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📤 Deploying to Vercel

### Option A: GitHub + Vercel (Recommended)

#### Push to GitHub:

```bash
git init
git add .
git commit -m "feat: initial LifeVault production app"
git branch -M main
git remote add origin https://github.com/<your-username>/lifevault.git
git push -u origin main
```

#### Deploy on Vercel:

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local`
5. Click **Deploy**

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔐 Firestore Data Schema

### `documents` collection
```js
{
  userId: string,
  documentName: string,
  documentType: string,       // "Aadhaar Card", "Passport", etc.
  category: string,           // "identity" | "education" | "property" | "financial" | "medical" | "personal"
  fileUrl: string,
  filePath: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  expiryDate: string,
  notes: string,
  familyMemberId: string | null,
  isShared: boolean,
  uploadDate: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `familyMembers` collection
```js
{
  userId: string,
  name: string,
  relation: string,
  avatar: string,
  createdAt: timestamp
}
```

### `shareLinks` collection
```js
{
  linkId: string,
  userId: string,
  documentId: string,
  documentName: string,
  fileUrl: string,
  expiresAt: ISO string,
  password: string | null,
  allowDownload: boolean,
  viewCount: number,
  createdAt: timestamp
}
```

---

## 🎯 Document Categories

| Category | Examples | Color |
|----------|----------|-------|
| Identity | Aadhaar, PAN, Passport, Voter ID | Neon Cyan |
| Education | SSC, Degree, Diploma, Transcripts | Purple |
| Property | Land Records, Sale Deed, Registry | Gold |
| Financial | Insurance, Tax Returns, Bank Statements | Green |
| Medical | Prescriptions, Test Reports, Vaccination | Red |
| Personal | Marriage Certificate, Will, Power of Attorney | Orange |

---

## 🔒 Security Notes

- All files stored in Firebase Storage with user-scoped paths
- Firestore rules enforce user ownership on all reads/writes
- Share links support optional password protection and automatic expiry
- Face Unlock uses webcam simulation — integrate a real face recognition API (e.g., AWS Rekognition, Azure Face API) for production

---

Built with ❤️ for India and beyond.
