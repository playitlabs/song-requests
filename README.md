# PlayIt Live Song Request Application

## Overview

This application allows listeners to browse and request songs for a radio station or event using PlayIt Live's library. It provides a simple, user-friendly interface for song requests and an admin dashboard to manage those requests.

## Deploying with Digital Ocean

### Sign up for Digital Ocean
1. Go to [Digital Ocean](https://www.digitalocean.com/)
2. Create an account if you don't have one
3. Add a payment method to your account

### Create a new App
1. From the Digital Ocean dashboard, click "App Platform" in the sidebar and click "Create App"
2. Choose "Container image" as your source
3. Choose "GitHub Container Registry" as the Registry Provider
   - Repository: `playitlabs/song-requests`
   - Tag: `latest`
   - Credentials: <leave blank>
4. Click Next
5. Under App, click Edit
   - Resource Size: Change to 512 MB RAM, 1 Shared vCPU option
   - Ports: Change to 80
   - Click < Back
6. Click Next
7. Under Environment Variables, click Edit beside Global and add the following:
   - PLAYIT_LIVE_BASE_URL = https://yourserver.playitradio.com:25433
   - PLAYIT_LIVE_API_KEY = your_api_key_here
   - ADMIN_PASSWORD = your_secure_admin_password
8. Click Next
9. Click Next
10. Click Create Resources

Your app will be deployed and accessible at the URL provided by Digital Ocean. You can configure a custom domain in the app settings if desired.

Note: The app will automatically pull the latest version of the container image when deploying. If you want to update to a newer version later, you can trigger a manual deployment from the Digital Ocean dashboard.

## Features

- **Public-facing song request page**
  - Search through available tracks
  - Submit song requests with name
  - Mobile-friendly interface

- **Admin dashboard**
  - Secure JWT-based authentication system
  - View all song requests
  - See request details (requestor, timestamp, IP address)
  - Track which requests have been processed
  - Requests sorted by most recent first

## Architecture

The application is built with a modern web stack:

- **Backend**: Node.js with Express
- **Frontend**: React with Tailwind CSS
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker containerization with GitHub Actions

### Component Overview

1. **PlayIt Live Integration**
   - Connects to PlayIt Live API to fetch available tracks
   - Optionally filters tracks by a specific track group
   - Periodically refreshes track data

2. **Request Management**
   - Tracks all song requests in memory
   - Records request details (who, when, what song, IP address)
   - Maintains status of requests (processed/unprocessed)

3. **Request Processing**
   - Includes components for processing song requests
   - `RequestAgent` and `RequestProcessor` handle request fulfillment

4. **Security**
   - Protected admin page with password authentication
   - JWT-based session management
   - Token expiration and automatic logout
   - Environment-based configuration

5. **User Interface**
   - Clean, responsive design built with Tailwind CSS
   - Easy search functionality
   - Simple navigation between request and admin pages

## Setup

### Prerequisites

- Node.js 22+ and npm
- PlayIt Live installation with API access

### Environment Variables

Create a `.env` file in the server directory:

PLAYIT_LIVE_BASE_URL=http://your-playit-live-server:port
PLAYIT_LIVE_API_KEY=your_api_key_here
REQUESTABLE_TRACK_GROUP_NAME=Optional_Track_Group
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=random_secret_key_for_jwt
PORT=3000

Variables explained:
- `PLAYIT_LIVE_BASE_URL`: URL of your PlayIt Live server
- `PLAYIT_LIVE_API_KEY`: API key for PlayIt Live
- `REQUESTABLE_TRACK_GROUP_NAME`: (Optional) Filter tracks by group
- `ADMIN_PASSWORD`: Password for accessing the admin page
- `JWT_SECRET`: Secret key for signing JWT tokens (optional, uses API key as fallback)
- `PORT`: Port for the web server

## Installation

### Clone the repository
git clone https://github.com/yourusername/song-request-app.git
cd song-request-app

### Install server dependencies
cd server
npm install

### Install client dependencies
cd ../client
npm install

### Build client
npm run build

### Start server
cd ../server
npm start

The application will be available at `http://localhost:3000`

## Docker Deployment

A GitHub Actions workflow automatically builds and publishes Docker containers for each release.

### Pull the latest Docker image
docker pull ghcr.io/playitlabs/song-requests:latest

### Run the Docker container
docker run -p 3000:3000 \
-e PLAYIT_LIVE_BASE_URL=http://your-server \
-e PLAYIT_LIVE_API_KEY=your_key \
-e ADMIN_PASSWORD=your_secure_password \
ghcr.io/playitlabs/song-requests:latest

The application will be available at `http://localhost:3000`



