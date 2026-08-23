# CrowdSense AI

**A scalable civic issue reporting platform for India, piloted on SATI Vidisha.**

CrowdSense AI helps citizens, students, campuses, municipalities, and local authorities report and resolve civic issues faster. A user can upload a photo, add a short description, allow GPS location, and submit a complaint in under a minute. The system then detects the zone, classifies the issue using AI, checks for duplicates, collects public support, and gives admins a powerful resolution dashboard.

This project uses **SATI Vidisha** as the first pilot region, but the architecture is designed to support any city, campus, ward, district, or institution through configurable region and zone data.

## Problem Statement

People regularly face local issues such as potholes, garbage, broken streetlights, waterlogging, blocked drains, electrical faults, sanitation problems, and campus maintenance issues. In most cases, they do not know the correct department to contact, complaints are repeated, and authorities receive scattered information without location, priority, or proper tracking.

CrowdSense AI solves this by turning simple public complaints into structured, mapped, deduplicated, and prioritized civic intelligence.

## Key Features

- **Fast issue reporting** with photo, description, and automatic GPS capture
- **AI-based classification** for category, priority, summary, tags, and suggested department
- **Zone detection** using configurable region and zone coordinates
- **Duplicate detection** to prevent repeated complaint clutter
- **Support/voting system** so users can mark “I also face this issue”
- **Public complaint feed** with category, status, zone, priority, and support count
- **Complaint detail page** with image, GPS, timeline, status, admin notes, and resolution proof support
- **Live map** using Leaflet and OpenStreetMap
- **Admin dashboard** for complaint tracking, filtering, assignment, notes, and status updates
- **Analytics summary** showing hotspots, top categories, unresolved issues, and priority breakdown
- **Region-agnostic architecture** ready for campuses, cities, districts, wards, and institutions

## Demo Pilot Region

The default pilot region is:

**SATI Vidisha, Madhya Pradesh, India**

The pilot includes configurable zones such as:

- Main Gate
- Administrative Block
- Central Library
- Hostel Zone
- Workshop Area
- Sports Ground

SATI data is only seed/demo data. More regions and zones can be added later through configuration or Firestore records.

## Tech Stack

### Frontend

- **React.js**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Lucide React Icons**

### Backend / Database

- **Firebase Authentication**
- **Cloud Firestore**
- **Firestore Security Rules**
- Prototype support for local/demo mode

### AI

- **Google Gemini API**
- Used for complaint category, priority, summary, tags, suggested department, and admin insights
- Includes fallback logic if AI is unavailable

### Maps and Location

- **Leaflet.js**
- **OpenStreetMap**
- **Browser Geolocation API**
- Haversine distance logic for nearest-zone detection

### Deployment and Version Control

- **Netlify** for deployment
- **GitHub** for version control and submission
- Environment variables for Firebase and Gemini credentials

## Main User Flow

1. User signs in.
2. User clicks **Report Issue**.
3. User uploads a photo.
4. User writes a short description.
5. App captures GPS location.
6. App detects the nearest configured zone.
7. AI classifies the complaint.
8. App checks for duplicate complaints.
9. If duplicate exists, user can support the existing issue.
10. If new, complaint is created and publicly trackable.

## Admin Flow

1. Admin signs in.
2. Admin opens the dashboard.
3. Admin views complaints by status, zone, category, and priority.
4. Admin assigns departments or teams.
5. Admin updates complaint status.
6. Admin adds internal notes.
7. Admin reviews analytics and unresolved hotspots.

## Data Model

The platform is built around scalable civic records:

- **Users**: profile, email, role, preferred region
- **Regions**: city, campus, district, ward, or institution
- **Zones**: mapped areas with latitude, longitude, radius, landmark, and type
- **Complaints**: image, description, GPS, zone, AI category, priority, status, support count, notes, and resolution data
- **Votes/Supports**: one support per user per complaint
- **Admin Notes**: moderator updates and internal comments
- **Audit Logs**: important admin actions for accountability

## AI Usage

AI is used only where it adds real value:

- Classifying issue type
- Estimating priority
- Creating short summaries
- Suggesting responsible department
- Generating analytics narration

Normal deterministic logic is used for:

- GPS capture
- Zone matching
- Database storage
- Permissions
- Status updates
- Duplicate scoring rules

## Duplicate Detection

CrowdSense AI checks whether a new complaint is similar to an existing one by comparing:

- Same region
- Same or nearby zone
- Matching category
- Description similarity
- Recent timestamp

If a likely duplicate is found, the user can support the existing complaint instead of creating a repeated report.

## Image Storage Note

For this prototype, complaint images are compressed in the browser and stored as **Base64 strings** with the complaint record in Firestore.

This is suitable for demo and hackathon prototype mode. For production scale, images should be moved to object storage such as Firebase Storage, Cloud Storage, or S3, while Firestore stores only metadata and image URLs.

## Environment Variables

Create a `.env` file using `.env.example`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_BACKEND_API_BASE_URL=
VITE_ADMIN_EMAILS=admin@example.com

VITE_DEFAULT_REGION_ID=sati-vidisha
VITE_PROTOTYPE_MODE=true
```

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build for Production

```bash
npm run build
```

The production build is generated in the `dist` folder.

## Deployment

The app can be deployed on **Netlify**:

1. Push the project to GitHub.
2. Connect the GitHub repository to Netlify.
3. Set build command:

```bash
npm run build
```

4. Set publish directory:

```bash
dist
```

5. Add all required environment variables in Netlify project settings.

## Why This Project Stands Out

CrowdSense AI is not just a complaint form. It is a complaint intelligence system.

It combines location, AI, duplicate control, public support, live maps, admin workflows, and analytics into one platform. It helps citizens report problems easily and helps authorities act with better data.

## Future Scope

- Multi-city and multi-campus deployment
- Stronger admin role hierarchy
- Push notifications for complaint updates
- Resolution before/after images
- CSV/PDF analytics export
- PWA mobile install support
- Advanced duplicate clustering
- Production object storage for images
- Department-wise staff accounts
- Public authority performance reports

## One-Line Pitch

**CrowdSense AI lets people report civic issues in under one minute and helps authorities resolve them through AI-powered classification, duplicate detection, live maps, and admin analytics.**
