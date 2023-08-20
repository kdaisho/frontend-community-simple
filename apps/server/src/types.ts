type Primitive = string | number | boolean | null
type JsonObject = { [k: string]: JsonValue }
type JsonArray = JsonValue[]

export type JsonValue = Primitive | JsonArray | JsonObject
