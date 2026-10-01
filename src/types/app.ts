import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Kategorien {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    kategoriename?: string;
    beschreibung?: string;
  };
}

export interface Inventar {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    artikelname?: string;
    artikelnummer?: string;
    seriennummer?: string;
    kategorie?: RecordUrl; // applookup -> URL zu 'Kategorien' Record
    menge?: number;
    einheit?: LookupValue;
    mindestbestand?: number;
    lagerort?: string;
    zustand?: LookupValue;
    anschaffungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    anschaffungspreis?: number;
    lieferant?: string;
    foto?: string;
    bemerkungen?: string;
  };
}

export const APP_IDS = {
  KATEGORIEN: '6abe503714cad0a546438b27',
  INVENTAR: '6abe503ce593ca22a5b4d344',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'inventar': {
    einheit: [{ key: "stueck", get label() { return lookupLabel('inventar', 'einheit', "stueck") ?? "Stück"; } }, { key: "liter", get label() { return lookupLabel('inventar', 'einheit', "liter") ?? "Liter"; } }, { key: "meter", get label() { return lookupLabel('inventar', 'einheit', "meter") ?? "Meter"; } }, { key: "kilogramm", get label() { return lookupLabel('inventar', 'einheit', "kilogramm") ?? "Kilogramm"; } }, { key: "paar", get label() { return lookupLabel('inventar', 'einheit', "paar") ?? "Paar"; } }, { key: "rolle", get label() { return lookupLabel('inventar', 'einheit', "rolle") ?? "Rolle"; } }, { key: "packung", get label() { return lookupLabel('inventar', 'einheit', "packung") ?? "Packung"; } }],
    zustand: [{ key: "neu", get label() { return lookupLabel('inventar', 'zustand', "neu") ?? "Neu"; } }, { key: "gut", get label() { return lookupLabel('inventar', 'zustand', "gut") ?? "Gut"; } }, { key: "gebraucht", get label() { return lookupLabel('inventar', 'zustand', "gebraucht") ?? "Gebraucht"; } }, { key: "defekt", get label() { return lookupLabel('inventar', 'zustand', "defekt") ?? "Defekt"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'kategorien': {
    'kategoriename': 'string/text',
    'beschreibung': 'string/textarea',
  },
  'inventar': {
    'artikelname': 'string/text',
    'artikelnummer': 'string/text',
    'seriennummer': 'string/text',
    'kategorie': 'applookup/select',
    'menge': 'number',
    'einheit': 'lookup/select',
    'mindestbestand': 'number',
    'lagerort': 'string/text',
    'zustand': 'lookup/radio',
    'anschaffungsdatum': 'date/date',
    'anschaffungspreis': 'number',
    'lieferant': 'string/text',
    'foto': 'file',
    'bemerkungen': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateKategorien = StripLookup<Kategorien['fields']>;
export type CreateInventar = StripLookup<Inventar['fields']>;