import { TrackDto } from "../shared/TrackDto";
import { PlayItLiveApiClient } from "./PlayItLiveApiClient";

export class Tracks {
    private tracks: TrackDto[];
    private requestableTracks: TrackDto[];

    constructor(private playItLiveApiClient: PlayItLiveApiClient, private requestableTrackGroup?: string) {
        this.tracks = [];
        this.requestableTracks = [];
    }

    async init() {
        // periodically fetch tracks from the API
        setInterval(() => this.fetchTracks(), 300 * 1000); // 5 minutes

        this.fetchTracks();
    }

    getTracks() {
        return this.tracks;
    }

    getRequestableTracks() {
        return this.requestableTracks;
    }

    getTrackByGuid(guid: string) {
        return this.tracks.find(track => track.guid === guid);
    }

    private async fetchTracks() {

        let requestableTrackGroupGuid = '';

        if (this.requestableTrackGroup) {
            // fetch the requestable track group
            const requestableTrackGroupData = await this.playItLiveApiClient.getTrackGroupListItems();

            const requestableTrackGroup = requestableTrackGroupData.trackGroups.find(group => group.name.toLowerCase() === this.requestableTrackGroup!.toLowerCase());

            requestableTrackGroupGuid = requestableTrackGroup?.guid ?? '00000000000000000000000000000000';
        }

        const requestableTrackData = await this.playItLiveApiClient.getTrackListItems('artist_title,type', requestableTrackGroupGuid);
        const trackData = await this.playItLiveApiClient.getTrackListItems('artist_title,type');

        this.requestableTracks = this.mapToTrackDto(requestableTrackData.tracks);
        this.tracks = this.mapToTrackDto(trackData.tracks);

        console.log('requestableTracks', this.requestableTracks.length);
        console.log('tracks', this.tracks.length);
    }

    private mapToTrackDto(tracks: any[]): TrackDto[] {
        return tracks.map(track => ({
            guid: track.guid,
            artistTitle: track.values[0].value,
            type: track.values[1].value
        }) satisfies TrackDto);
    }
}