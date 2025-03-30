# PlayIt Live Song Request Application Specification

## 1. Product Overview

The PlayIt Live Song Request Application is a web-based platform that integrates with PlayIt Live radio automation software to allow listeners to browse and request songs from the station's music library. The application provides both a public-facing interface for listeners and a secure admin dashboard for station staff to manage incoming requests.

## 2. Target Users

1. **Radio Station Listeners**
   - Individuals who want to request songs from the station's library
   - Users across various devices (desktop, tablet, mobile)

2. **Radio Station Staff**
   - DJs and program directors who manage song requests
   - Station administrators who configure the system

## 3. Core Features

### 3.1 Public Song Request Interface

#### 3.1.1 Track Search
- Search through available tracks in the PlayIt Live library
- Display of track metadata (artist, title)

#### 3.1.2 Request Submission
- Simple form for submitting song requests
- Required fields: name of requestor
- Optional fields: message (limited to 150 characters by default, configurable via environment variable)
- Confirmation message after successful submission

#### 3.1.3 User Interface
- Mobile-responsive design
- Clean, user-friendly interface

### 3.2 Admin Dashboard

#### 3.2.1 Authentication System
- Secure JWT-based authentication
- Password-protected access
- Session timeout and automatic logout
- No user registration (single admin account configured via environment variables)

#### 3.2.2 Request Management
- View all incoming song requests
- Sort requests by timestamp (newest first by default)
- Mark requests as processed
- Delete requests before they are processed
- View request details:
  - Requestor name
  - Requested song
  - Listener message (if provided)
  - Timestamp
  - IP address

#### 3.2.3 Admin Interface
- Clean, intuitive dashboard layout
- Visual indicators for unprocessed requests

## 4. Technical Implementation

### 4.1 PlayIt Live Integration

- Connects to PlayIt Live API to fetch available tracks
- Optional filtering of tracks by a specific track group
- Periodic refresh of track data

### 4.2 Data Management

- In-memory storage of song requests
- Tracks all song requests with details (who, when, what song, IP address)
- Maintains status of requests (processed/unprocessed)

### 4.3 Security

- JWT-based authentication for admin access
- Protected admin page with password authentication
- Token expiration and automatic logout
- Environment-based configuration

### 4.4 Performance

- Efficient memory usage
- Responsive user interface

## 5. Current Architecture

### 5.1 Frontend
- React-based single-page application
- Tailwind CSS for styling
- TanStack Router for routing
- TanStack Query for data fetching
- Responsive design for all device sizes

### 5.2 Backend
- Node.js with Express
- RESTful API design
- JWT authentication
- PlayIt Live API client

### 5.3 Deployment
- Docker containerization
- GitHub Actions for CI/CD
- Environment-based configuration

## 6. Deployment Options

### 6.1 Docker Deployment
- Pre-built container images available on GitHub Container Registry
- Environment variable configuration
- Simple docker run command for deployment

### 6.2 Digital Ocean Deployment
- Step-by-step guide for deploying on Digital Ocean App Platform
- Resource configuration (512 MB RAM, 1 Shared vCPU)
- Environment variable setup

### 6.3 Local Deployment
- Installation guide for local development and testing
- Node.js 18+ requirement
- npm-based build and run process

## 7. Configuration

### 7.1 Environment Variables
- `PLAYIT_LIVE_BASE_URL`: URL of your PlayIt Live server
- `PLAYIT_LIVE_API_KEY`: API key for PlayIt Live
- `REQUESTABLE_TRACK_GROUP_NAME`: (Optional) Filter tracks by group
- `ADMIN_PASSWORD`: Password for accessing the admin page
- `JWT_SECRET`: Secret key for signing JWT tokens (optional, uses API key as fallback)
- `PORT`: Port for the web server (default: 3000)
- `MAX_MESSAGE_LENGTH`: Maximum character limit for listener messages (default: 150)
