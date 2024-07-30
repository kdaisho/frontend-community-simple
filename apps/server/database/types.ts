import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Footprint {
  created_at: Generated<Timestamp>;
  email: string;
  is_pristine: Generated<boolean>;
  token: string;
  uuid: Generated<string>;
}

export interface Passkey {
  backed_up: boolean;
  counter: number;
  created_at: Generated<Timestamp>;
  current_challenge_id: string;
  device_type: string;
  last_used: Timestamp | null;
  public_key: Buffer;
  transports: string | null;
  user_uuid: string;
  webauthn_user_id: string;
}

export interface Recaptcha {
  created_at: Generated<Timestamp>;
  email: string;
  id: Generated<number>;
}

export interface Session {
  created_at: Generated<Timestamp>;
  expires_at: Timestamp;
  token: Generated<string>;
  user_uuid: string | null;
  uuid: Generated<string>;
}

export interface Todo {
  created_at: Generated<Timestamp>;
  is_completed: Generated<boolean>;
  task: string;
  user_uuid: string | null;
  uuid: Generated<string>;
}

export interface User {
  created_at: Generated<Timestamp>;
  email: string;
  is_admin: Generated<boolean>;
  is_passkeys_enabled: Generated<boolean>;
  name: string;
  uuid: Generated<string>;
}

export interface DB {
  footprint: Footprint;
  passkey: Passkey;
  recaptcha: Recaptcha;
  session: Session;
  todo: Todo;
  user: User;
}
