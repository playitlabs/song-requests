import { useQuery } from "@tanstack/react-query";
import { TrackDto } from "../../../shared/TrackDto";

export function useTracksQuery() {
    return useQuery<TrackDto[]>({
        queryKey: ['tracks'],
        queryFn: () => fetch('/api/tracks').then(res => res.json()),
    })
}