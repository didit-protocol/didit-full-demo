// Verification Status Types
export const VerificationStatus = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  APPROVED: "Approved",
  DECLINED: "Declined",
  IN_REVIEW: "In Review",
  EXPIRED: "Expired",
  ABANDONED: "Abandoned",
  KYC_EXPIRED: "KYC Expired",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

// V3 Session Creation Request
export interface CreateSessionRequest {
  workflow_id: string;
  vendor_data?: string;
  callback?: string;
  features?: Record<string, unknown>;
}

// V3 Session Creation Response
export interface CreateSessionResponse {
  session_id: string;
  url: string;
  vendor_data?: string;
  status: VerificationStatus;
  created_at: string;
}

// Webhook Payload
export interface WebhookPayload {
  session_id: string;
  status: VerificationStatus;
  vendor_data?: string;
  created_at: number;
  // Additional fields may be present depending on workflow configuration
  kyc?: {
    status: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    document_number?: string;
    document_type?: string;
    nationality?: string;
    expiration_date?: string;
    // ... more fields
  };
  liveness?: {
    status: string;
    // ... more fields
  };
  face_match?: {
    status: string;
    similarity_score?: number;
    // ... more fields
  };
  aml?: {
    status: string;
    hits_count?: number;
    // ... more fields
  };
}
