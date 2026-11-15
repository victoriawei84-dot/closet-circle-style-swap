import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

// Session-memory only: uploaded photos never enter persistent browser storage.
const drafts = new Map<string, Map<string, unknown>>();
export function useStylistDraft<T>(scope: string, field: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const saved = drafts.get(scope);
    if (saved?.has(field)) setValue(() => saved.get(field) as T);
    else setValue(typeof initial === "function" ? (initial as () => T)() : initial);
  }, [scope, field]);
  const update: Dispatch<SetStateAction<T>> = (next) => {
    setValue((previous) => {
      const result = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
      let saved = drafts.get(scope);
      if (!saved) { saved = new Map(); drafts.set(scope, saved); }
      saved.set(field, result);
      return result;
    });
  };
  return [value, update];
}