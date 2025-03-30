import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { Tracks } from './Tracks';
import { Requests } from './Requests';
import { PlayItLiveApiClient } from './PlayItLiveApiClient';
import { RequestProcessor } from './RequestProcessor';
import { RequestAgent } from "./RequestAgent";
import { authenticateJWT, login } from './auth';
import { SettingsDto } from '../shared/SettingsDto';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || '150', 10);

const requiredEnvVars = ['PLAYIT_LIVE_BASE_URL', 'PLAYIT_LIVE_API_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Error: ${varName} is required but not set`);
    process.exit(1);
  }
});

const playItLiveBaseUrl = process.env.PLAYIT_LIVE_BASE_URL!;
const playItLiveApiKey = process.env.PLAYIT_LIVE_API_KEY!;
const requestableTrackGroupName = process.env.REQUESTABLE_TRACK_GROUP_NAME;

console.log('PLAYIT_LIVE_BASE_URL', playItLiveBaseUrl);
console.log('PLAYIT_LIVE_API_KEY', '*'.repeat(playItLiveApiKey.length));
console.log('REQUESTABLE_TRACK_GROUP_NAME', requestableTrackGroupName || '<not set>');
console.log('MAX_MESSAGE_LENGTH', MAX_MESSAGE_LENGTH);

// Set up middleware FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

const playItLiveApiClient = new PlayItLiveApiClient(playItLiveBaseUrl, playItLiveApiKey);

const tracks = new Tracks(playItLiveApiClient, requestableTrackGroupName);
tracks.init();

const requests = new Requests();
requests.init();

const requestAgent = new RequestAgent(playItLiveApiClient, tracks);
const requestProcessor = new RequestProcessor(requests, requestAgent);

// THEN define routes
app.get('/api/tracks', (req, res) => {
    res.json(tracks.getRequestableTracks());
});

app.get('/api/settings', (req, res) => {

    res.json({
        maxMessageLength: MAX_MESSAGE_LENGTH
    } satisfies SettingsDto);
});

app.post('/api/requestTrack', async (req, res) => {
    try {
        console.log('Requesting track:', req.body);
        const { trackGuid, requestedBy, message } = req.body;
        const ipAddress = req.ip;

        const messageString = message?.toString() || '';

        // Validate required fields
        if (!trackGuid || !requestedBy) {
            res.status(400).json({
                success: false,
                message: 'Track GUID and requester name are required'
            });
            return;
        }

        // Validate message length if provided
        if (messageString.length > MAX_MESSAGE_LENGTH) {
            res.status(400).json({
                success: false,
                message: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`
            });
            return;
        }

        // Check if this track is already requested but not processed
        const alreadyRequested = await requests.isTrackAlreadyRequested(trackGuid);
        if (alreadyRequested) {
            res.status(409).json({ 
                success: false, 
                message: 'This song has already been requested recently.' 
            });
            return;
        }

        const trimmedMessage = messageString.trim() || undefined;
        await requests.addRequest(trackGuid, requestedBy, trimmedMessage, ipAddress);
        res.json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/login', login);

app.get('/api/requests', authenticateJWT, async (req, res) => {
    res.json(await requests.getRequests());
});

app.delete('/api/requests/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const success = await requests.deleteRequest(id);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Request not found' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
