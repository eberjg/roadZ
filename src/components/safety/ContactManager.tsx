"use client";

import { useState, useSyncExternalStore } from "react";
import { ui } from "@/components/ui/theme";
import {
  addTrustedContact,
  getTrustedContacts,
  removeTrustedContact,
  subscribeSafetyStorage,
  toggleTrustedContact,
} from "@/services/safety/contactManager";

export function ContactManager() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const contacts = useSyncExternalStore(subscribeSafetyStorage, getTrustedContacts, () => []);

  const handleAdd = () => {
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
      return;
    }
    addTrustedContact({ name, phone });
    setName("");
    setPhone("");
  };

  return (
    <section data-testid="contact-manager" className={ui.panelNested}>
      <h3 className={ui.h3}>Trusted contacts</h3>
      <p className={`mt-1 ${ui.bodyMuted}`}>
        Opt-in only. Contacts stay on this device. No location history is stored.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          data-testid="contact-name-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={ui.input}
        />
        <input
          data-testid="contact-phone-input"
          type="tel"
          placeholder="Phone (+1...)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={ui.input}
        />
        <button
          type="button"
          data-testid="contact-add-btn"
          onClick={handleAdd}
          className={ui.btnPrimary}
        >
          Add
        </button>
      </div>

      <ul className="mt-4 space-y-2" data-testid="contact-list">
        {contacts.length === 0 ? (
          <li className={ui.bodyMuted}>No contacts yet</li>
        ) : (
          contacts.map((contact) => (
            <li
              key={contact.id}
              data-testid={`contact-item-${contact.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-zinc-900/50 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-white">{contact.name}</p>
                <p className="text-sm text-zinc-400">{contact.phone}</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    data-testid={`contact-enabled-${contact.id}`}
                    checked={contact.enabled}
                    onChange={(event) =>
                      toggleTrustedContact(contact.id, event.target.checked)
                    }
                  />
                  On
                </label>
                <button
                  type="button"
                  data-testid={`contact-remove-${contact.id}`}
                  onClick={() => removeTrustedContact(contact.id)}
                  className={ui.btnGhost}
                >
                  Remove
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
