export class PlayItLiveApiClient {
    constructor(private baseUrl: string, private apiKey: string) {

    }

    async getTrackGroupListItems() {
        const response = await fetch(`${this.baseUrl}/api/control/trackGroups/listItems`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        }); 

        return await response.json() as TrackGroupsResponse;
    }

    async getTrackListItems(columnIds: string, trackGroupGuid?: string) {
        const url = new URL(`${this.baseUrl}/api/control/tracks/listItems`);
        
        url.searchParams.append('columnIds', columnIds);
        if (trackGroupGuid) {
            url.searchParams.append('trackGroupGuid', trackGroupGuid);
        }

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        return await response.json() as TrackListResponse;
    }

    async getCurrentPlayoutLogItem() {
        const response = await fetch(`${this.baseUrl}/api/control/liveAssist/playoutLog/currentItem`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        return await response.json() as PlayoutLogItem;
    }

    async getPlayoutLogItems(hourStartTime: Date) {
        const url = new URL(`${this.baseUrl}/api/control/liveAssist/playoutLog/items`);
        url.searchParams.append('hour', hourStartTime.toISOString());
        url.searchParams.append('includeEmpty', 'true');

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
    
        return (await response.json() as PlayoutLogItemsResponse).items;
    }

    async updateBreakNoteInPlayoutLog(guid: string, duration: string, notes: string) {
        const response = await fetch(`${this.baseUrl}/api/control/liveAssist/playoutLog/updateBreakNote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guid, duration, notes })
        });

        return await response.json();
    }

    async updateTrackInPlayoutLog(guid: string, trackGuid: string) {
        const response = await fetch(`${this.baseUrl}/api/control/liveAssist/playoutLog/updateTrack`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guid, trackGuid })
        });

        return await response.json();
    }
    
}

interface TrackListResponse {
    tracks: TrackListItem[];
}

interface TrackListItem {
    guid: string;
    values: TrackValue[]
}

interface TrackValue {
    value: any;
    formatted: string;
}

interface TrackGroupsResponse {
    trackGroups: TrackGroup[];
}

interface TrackGroup {
    guid: string;
    name: string;
}

interface PlayoutLogItem {
    guid: string;
    hourStartTime: string;
    startTime: string;
    isCurrent: boolean;
    displayStartTime: string;
    title: string;
    type: string;
    trackGuid: string;
    duration: number;
    fullDuration: number;
    shouldSegue: boolean;
    isSoftDeleted: boolean;
    isProtected: boolean;
    isInvalid: boolean;
    willSkip: boolean;
    isInPast: boolean;
    hasPlayed: boolean;
    cueIn: number;
    cueOut: number;
    intro: number;
    year: string;
    additionalFields: AdditionalField[];
    genre: string;
    album: string;
    tags: string;
    trackGroups: string;
    sourceClockGuid: string;
    path: string;
}

interface AdditionalField {
    name: string;
    value: string;
    isFullText: boolean;
}

interface PlayoutLogItemsResponse {
    items: PlayoutLogItem[];
}

