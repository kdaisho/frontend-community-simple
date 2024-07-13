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
  id: Generated<string>;
  pristine: Generated<boolean>;
  token: string;
}

export interface Recaptcha {
  created_at: Generated<Timestamp | null>;
  email: string;
  id: Generated<number>;
}

export interface Session {
  created_at: Generated<Timestamp | null>;
  expires_at: Timestamp;
  id: Generated<string>;
  token: Generated<string | null>;
  user_id: string | null;
}

export interface Todo {
  completed: Generated<boolean>;
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  task: string;
  user_id: string | null;
}

export interface User {
  created_at: Generated<Timestamp | null>;
  current_challenge: string | null;
  devices: Json | null;
  email: string;
  id: Generated<string>;
  is_admin: Generated<boolean>;
  name: string;
  webauthn: Generated<boolean>;
}

export interface DB {
  footprint: Footprint;
  recaptcha: Recaptcha;
  session: Session;
  todo: Todo;
  user: User;
}
