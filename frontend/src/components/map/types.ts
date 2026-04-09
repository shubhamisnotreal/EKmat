export interface VotingBooth {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    state: string;
    city: string;
    district: string;
    pincode: string;
    status: 'active' | 'inactive' | 'upcoming';
    totalVotes: number;
    capacity: number;
    queueLength?: number;
    facilities: string[];
    accessibility: boolean;
    timings: {
        open: string;
        close: string;
    };
}

export interface UserLocation {
    userId: string;
    assignedBoothId: string;
    booth: VotingBooth;
    distance: number;
    distanceUnit: string;
    verified: boolean;
}
