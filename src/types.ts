export interface Env {
  MAILBOX: D1Database;
  AUTH_TOKEN: string;
  EMAIL_WORKER_URL: string;
  EMAIL_API_TOKEN: string;
  // Service binding to the eka-email-worker backend. Used instead of a plain
  // fetch() because same-zone worker→worker HTTP subrequests are blocked by
  // Cloudflare (error 1042).
  EMAIL_WORKER: Fetcher;
}

export interface Email {
  id: number;
  message_id: string;
  from_address: string;
  to_address: string;
  reply_to: string | null;
  subject: string;
  body: string | null;
  raw_email: string | null;
  received_at: string;
  read: number;
  direction: string;
  in_reply_to_id: number | null;
}

export interface EmailListItem {
  id: number;
  message_id: string;
  from_address: string;
  to_address: string;
  subject: string;
  received_at: string;
  read: number;
  direction: string;
  body_length: number;
}
