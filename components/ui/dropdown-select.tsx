"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type DropdownOption = { value: string; label: string };

type DropdownSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  /** Mostra uma caixa de busca no topo da lista (útil para listas longas). */
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Texto exibido quando não há opções (ou a busca não encontra nada). */
  emptyMessage?: string;
};

/** Remove acentos e deixa em minúsculas, para a busca ignorar "ã", "ç" etc. */
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Lista suspensa customizada, no visual da aplicação (substitui o <select> nativo). */
export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className = "",
  searchable = false,
  searchPlaceholder = "Buscar...",
  disabled = false,
  loading = false,
  emptyMessage = "Nenhuma opção encontrada",
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = normalizar(query.trim());
    return options.filter((o) => normalizar(o.label).includes(q));
  }, [options, query, searchable]);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Foca a busca ao abrir.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // Mantém a opção ativa visível ao navegar pelo teclado.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openList = () => {
    if (disabled) return;
    setQuery("");
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = (devolverFoco = false) => {
    setOpen(false);
    if (devolverFoco) buttonRef.current?.focus();
  };

  const choose = (option: DropdownOption) => {
    onChange(option.value);
    close(true);
  };

  const handleListKeys = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || (!searchable && e.key === " ")) {
      e.preventDefault();
      if (filtered[activeIndex]) choose(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      close();
    }
  };

  const handleButtonKeys = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    handleListKeys(e);
  };

  const buttonText = selected ? selected.label : loading ? "Carregando..." : placeholder;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleButtonKeys}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`w-full flex items-center justify-between gap-1 pl-4 pr-2 py-3.5 bg-[#f5f3f3] rounded-xl text-sm font-medium text-left outline-none transition-all focus:ring-2 focus:ring-[#9e4300]/25 disabled:cursor-not-allowed disabled:opacity-60 ${
          disabled ? "" : "cursor-pointer"
        } ${open ? "ring-2 ring-[#9e4300]/25" : ""} ${
          selected ? "text-[#1b1c1c]" : "text-[#584237]/40"
        }`}
      >
        <span className="truncate">{buttonText}</span>
        <span
          className={`material-symbols-outlined text-[#584237]/60 text-lg transition-transform duration-200 ${
            loading ? "animate-spin" : open ? "rotate-180" : ""
          }`}
        >
          {loading ? "progress_activity" : "keyboard_arrow_down"}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 left-0 mt-2 min-w-full w-max max-w-[min(20rem,calc(100vw-2rem))] p-1.5 bg-white border border-[#f0eded] rounded-2xl shadow-xl shadow-[#584237]/10 animate-fade-in">
          {searchable && (
            <div className="relative mb-1.5">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#584237]/50 text-base pointer-events-none">
                search
              </span>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleListKeys}
                placeholder={searchPlaceholder}
                aria-controls={listId}
                className="w-full pl-9 pr-3 py-2.5 bg-[#f5f3f3] rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 outline-none focus:ring-2 focus:ring-[#9e4300]/25"
              />
            </div>
          )}

          <ul ref={listRef} id={listId} role="listbox" className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[#584237]/60 font-medium">{emptyMessage}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(option)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#ffdbcb] text-[#783100] font-bold"
                        : isActive
                          ? "bg-[#fff1ea] text-[#9e4300] font-semibold"
                          : "text-[#1b1c1c] font-medium"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span className="material-symbols-outlined text-base">check</span>}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
