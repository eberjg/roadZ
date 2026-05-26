import {
  defaultSafetyPreferences,
  type SafetyPreferences,
  type TrustedContact,
  type UpdateFrequency,
} from "./types";

const CONTACTS_KEY = "rc_safety_contacts";
const PREFERENCES_KEY = "rc_safety_preferences";
const STORAGE_EVENT = "rc-safety-storage";

let contactsCache: TrustedContact[] | null = null;
let contactsCacheRaw: string | null | undefined;
let preferencesCache: SafetyPreferences | null = null;
let preferencesCacheRaw: string | null | undefined;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function invalidateCache(): void {
  contactsCache = null;
  contactsCacheRaw = undefined;
  preferencesCache = null;
  preferencesCacheRaw = undefined;
}

function notifyChange(): void {
  if (typeof window === "undefined") {
    return;
  }
  invalidateCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function subscribeSafetyStorage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => window.removeEventListener(STORAGE_EVENT, onStoreChange);
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function parseContacts(raw: string | null): TrustedContact[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as TrustedContact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getTrustedContacts(): TrustedContact[] {
  if (!canUseStorage()) {
    return [];
  }
  const raw = window.localStorage.getItem(CONTACTS_KEY);
  if (contactsCache && contactsCacheRaw === raw) {
    return contactsCache;
  }
  const next = parseContacts(raw);
  contactsCache = next;
  contactsCacheRaw = raw;
  return next;
}

export function saveTrustedContacts(contacts: TrustedContact[]): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  notifyChange();
}

export function addTrustedContact(input: { name: string; phone: string }): TrustedContact {
  const contact: TrustedContact = {
    id: `contact-${Date.now()}`,
    name: input.name.trim(),
    phone: normalizePhone(input.phone),
    enabled: true,
  };
  saveTrustedContacts([...getTrustedContacts(), contact]);
  return contact;
}

export function removeTrustedContact(contactId: string): void {
  saveTrustedContacts(getTrustedContacts().filter((item) => item.id !== contactId));
}

export function toggleTrustedContact(contactId: string, enabled: boolean): void {
  saveTrustedContacts(
    getTrustedContacts().map((item) =>
      item.id === contactId ? { ...item, enabled } : item,
    ),
  );
}

export function getActiveContacts(): TrustedContact[] {
  return getTrustedContacts().filter((item) => item.enabled && item.phone.length >= 10);
}

export function getSafetyPreferences(): SafetyPreferences {
  if (!canUseStorage()) {
    return defaultSafetyPreferences;
  }
  const raw = window.localStorage.getItem(PREFERENCES_KEY);
  if (preferencesCache && preferencesCacheRaw === raw) {
    return preferencesCache;
  }
  if (!raw) {
    preferencesCache = defaultSafetyPreferences;
    preferencesCacheRaw = raw;
    return defaultSafetyPreferences;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SafetyPreferences>;
    const next = {
      relayEnabled: parsed.relayEnabled ?? defaultSafetyPreferences.relayEnabled,
      emergencyOnly: parsed.emergencyOnly ?? defaultSafetyPreferences.emergencyOnly,
      updateFrequency:
        parsed.updateFrequency ?? defaultSafetyPreferences.updateFrequency,
      driverDisplayName:
        parsed.driverDisplayName?.trim() || defaultSafetyPreferences.driverDisplayName,
    };
    preferencesCache = next;
    preferencesCacheRaw = raw;
    return next;
  } catch {
    preferencesCache = defaultSafetyPreferences;
    preferencesCacheRaw = raw;
    return defaultSafetyPreferences;
  }
}

export function updateSafetyPreferences(patch: Partial<SafetyPreferences>): SafetyPreferences {
  const next = { ...getSafetyPreferences(), ...patch };
  if (canUseStorage()) {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    notifyChange();
  }
  return next;
}

export function milestoneIntervalMiles(frequency: UpdateFrequency): number {
  if (frequency === "every_50_miles") {
    return 50;
  }
  if (frequency === "every_200_miles") {
    return 200;
  }
  return 100;
}
