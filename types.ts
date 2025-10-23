// FIX: Removed a self-referential import of 'Specialist' which was causing a name conflict.
export interface Specialist {
  name: string;
  address: string;
  phone?: string;
}

export interface DiagnosticCenter {
  name: string;
  address: string;
  contactDetails: {
    phone: string;
    website: string;
  };
  googleRating: number;
  userReviewSummary: string;
  hasCTMachine: boolean;
  nearbySpecialists: {
    [specialty: string]: Specialist[];
  };
}

export interface GroundingSource {
  uri: string;
  title: string;
  type: 'web' | 'maps';
}

export interface ApiResponse {
  diagnosticCenters: DiagnosticCenter[];
  groundingSources: GroundingSource[];
}