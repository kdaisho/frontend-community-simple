import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Footprint {
  created_at: Generated<Timestamp | null>;
  email: string;
  is_pristine: Generated<boolean>;
  token: string;
  uuid: Generated<string>;
}

export interface Passkey {
  current_challenge: string | null;
  devices: Json | null;
  id: Generated<number>;
  user_uuid: string | null;
}

export interface Recaptcha {
  created_at: Generated<Timestamp | null>;
  email: string;
  id: Generated<number>;
}

export interface Session {
  created_at: Generated<Timestamp | null>;
  expires_at: Timestamp;
  token: Generated<string | null>;
  user_uuid: string | null;
  uuid: Generated<string>;
}

export interface Todo {
  created_at: Generated<Timestamp | null>;
  is_completed: Generated<boolean>;
  task: string;
  user_uuid: string | null;
  uuid: Generated<string>;
}

export interface User {
  created_at: Generated<Timestamp | null>;
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
