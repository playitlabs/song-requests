import { RequestAgent } from "./RequestAgent";
import { Requests } from "./Requests";

export class RequestProcessor {
    constructor(private requests: Requests, private requestAgent: RequestAgent) {
        this.requests = requests;

        // process requests every 10 seconds
        setInterval(() => {
            this.processRequests();
        }, 10000);

        this.processRequests();
    }

    async processRequests() {

        const availableItems = await this.requestAgent.getAvailableItems();

        const requests = await this.requests.getUnprocessedRequests();

        console.log('Available request slots:', availableItems.length);
        console.log('Unprocessed requests:', requests.length);

        for (const request of requests) {
            console.log('Processing request:', request);

            let processed = false;
            for (const item of availableItems) {
                if (processed) {
                    break;
                }

                if (await this.requestAgent.canRequestTrack(request.trackGuid, item.requestItemGuid)) {
                    await this.requestAgent.requestTrack(request.trackGuid, item.breakNoteItemGuid, item.requestItemGuid, request.requestedBy);
                    await this.requests.markAsProcessed(request.id);
                    availableItems.splice(availableItems.indexOf(item), 1);
                    processed = true;

                    console.log('Processed request:', request);
                }
            }

            if (!processed) {
                console.log('No available items found for request:', request);
            }
        }
    }
}
