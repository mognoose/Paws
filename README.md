# 🐕 Paws - Dog Care Connection Platform

A web application that connects dog owners with dog caretakers. Built with Vue 3, TypeScript, Firebase, and Tailwind CSS.

## Features

### For Dog Owners
- **Browse Caretakers**: Search and filter caretakers by location and services
- **View Availability**: See caretakers' calendars with available time slots
- **Book Appointments**: Request specific dates and times for dog care
- **Manage Dogs**: Add and manage your dogs' profiles
- **Track Bookings**: View all pending, approved, and completed bookings

### For Caretakers
- **Profile Management**: Set your bio, experience, hourly rate, and services offered
- **Availability Calendar**: Add and manage your available time slots
- **Booking Requests**: Receive notifications and approve/reject booking requests
- **Booking History**: Track all your past and upcoming appointments

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Paw
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

### Firestore Security Rules

Add these rules to your Firestore for basic security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         resource.data.caretakerId == request.auth.uid);
    }
    
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firestore Indexes

Create the following composite indexes in Firestore:

1. **bookings** collection:
   - Fields: `ownerId` (Ascending), `createdAt` (Descending)
   - Fields: `caretakerId` (Ascending), `createdAt` (Descending)

2. **notifications** collection:
   - Fields: `userId` (Ascending), `createdAt` (Descending)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/      # Reusable Vue components
├── config/          # Firebase configuration
├── router/          # Vue Router setup
├── services/        # Firebase service initialization
├── stores/          # Pinia stores (auth, booking, caretaker, notification)
├── types/           # TypeScript type definitions
├── views/           # Page components
└── main.ts          # App entry point
```

## License

MIT
