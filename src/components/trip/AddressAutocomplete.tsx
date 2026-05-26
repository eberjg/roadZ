"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ui } from "@/components/ui/theme";
import type { PlaceSuggestion } from "@/services/maps/types";

type AddressAutocompleteProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  testId: string;
};

export function AddressAutocomplete({
  label,
  value,
  onValueChange,
  placeholder,
  testId,
}: AddressAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
      const payload = (await response.json()) as { suggestions?: PlaceSuggestion[] };
      const next = payload.suggestions ?? [];
      setSuggestions(next);
      setIsOpen(next.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSuggestions(value);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectSuggestion(suggestion: PlaceSuggestion) {
    onValueChange(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={rootRef} className="relative block">
      <label className="block">
        <span className={ui.label}>{label}</span>
        <input
          data-testid={testId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (!isOpen || suggestions.length === 0) {
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % suggestions.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              selectSuggestion(suggestions[activeIndex]);
            } else if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className={ui.input}
        />
      </label>

      {isLoading ? (
        <p className={`mt-1 ${ui.bodyMuted}`} data-testid={`${testId}-loading`}>
          Finding addresses…
        </p>
      ) : null}

      {isOpen && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          data-testid={`${testId}-suggestions`}
          className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-white/15 bg-slate-900 py-1 shadow-2xl shadow-black/60"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                data-testid={`${testId}-suggestion-${index}`}
                className={`w-full px-4 py-3 text-left text-base text-white hover:bg-sky-500/20 ${
                  index === activeIndex ? "bg-sky-500/15" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
