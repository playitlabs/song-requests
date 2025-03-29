import { PlayItLiveApiClient } from "./PlayItLiveApiClient";
import { Tracks } from "./Tracks";

export class RequestAgent {

    constructor(private playItLiveApiClient: PlayItLiveApiClient, private tracks: Tracks) {
    }

    async getAvailableItems(): Promise<RequestPair[]> {
        /* 
         * Get the current playout log item and use it to find the current hour's start time
         * Then get all playout log items for current hour and next hour
         * Find the current item's position and get all items after it plus next hour's items
         */
        
        const currentPlayoutLogItem = await this.playItLiveApiClient.getCurrentPlayoutLogItem();
        const currentHourStartTime = new Date(currentPlayoutLogItem.hourStartTime);
        const playoutLogItems = await this.playItLiveApiClient.getPlayoutLogItems(currentHourStartTime);
        const nextHourStartTime = new Date(currentHourStartTime.getTime() + 60 * 60 * 1000);
        const nextHourPlayoutLogItems = await this.playItLiveApiClient.getPlayoutLogItems(nextHourStartTime);
        const currentItemIndex = playoutLogItems.findIndex(item => item.guid === currentPlayoutLogItem.guid);
        const itemsAfterCurrentItem = playoutLogItems.slice(currentItemIndex + 1);
        const allItems = [...itemsAfterCurrentItem, ...nextHourPlayoutLogItems];

        const requestPairs: RequestPair[] = [];

        let breakNoteItemGuid = null;
        /*
         * Loop through all items looking for pairs of break notes and tracks that can be used for requests
         * When we find a break note with "REQUEST" in it, store its guid
         * Then look for the next track that is a Song type
         * When found, create a request pair and clear the stored break note guid
         */
        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];

            if (item) {
                if(item.type === 'track') {
                    if(breakNoteItemGuid) {
                        const track = this.tracks.getTrackByGuid(item.trackGuid);
                        if(track?.type == 'Song') {
                            requestPairs.push({ breakNoteItemGuid, requestItemGuid: item.guid });
                            breakNoteItemGuid = null;
                        }
                    }
                }

                if (item.type === 'breakNote') {
                    if (item.additionalFields.some(field => field.name === 'Break Note' && field.value.toLocaleUpperCase() == 'REQUEST')) {
                        breakNoteItemGuid = item.guid;
                    }
                }
            }
        }

        return requestPairs;
    }

    async canRequestTrack(trackGuid: string, itemGuid: string) {
        return true;
    }

    async requestTrack(trackGuid: string, breakNoteItemGuid: string, requestItemGuid: string, requestText: string) {
        await this.playItLiveApiClient.updateTrackInPlayoutLog(requestItemGuid, trackGuid);
        await this.playItLiveApiClient.updateBreakNoteInPlayoutLog(breakNoteItemGuid, '00:00', `REQUESTED BY: ${requestText}`);

        return true;
    }

}

export interface RequestPair {
    breakNoteItemGuid: string;
    requestItemGuid: string;
}