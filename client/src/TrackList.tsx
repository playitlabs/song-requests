import React, { useState } from 'react';
import { useTracksQuery } from './queries/Tracks';
import { SearchBox } from './SearchBox';
import { TrackCard } from './TrackCard';

export function TrackList() {
    const { data: tracks } = useTracksQuery();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTracks = tracks?.filter(track => track.artistTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-full max-w-4xl p-6 space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">Request a Song</h1>

            <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search tracks..."
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredTracks?.map(track => (
                    <TrackCard key={track.guid} track={track} />
                ))}
            </div>
        </div>
    );
}


