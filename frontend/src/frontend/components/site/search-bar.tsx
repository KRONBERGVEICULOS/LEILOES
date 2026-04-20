type SearchBarProps = {
  defaultValue?: string;
  id: string;
  label: string;
  name: string;
  placeholder: string;
  submitLabel?: string;
};

export function SearchBar({
  defaultValue,
  id,
  label,
  name,
  placeholder,
  submitLabel = "Buscar",
}: SearchBarProps) {
  return (
    <div className="grid gap-3">
      <label className="text-sm font-semibold text-brand-ink" htmlFor={id}>
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-lg border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
          defaultValue={defaultValue}
          enterKeyHint="search"
          id={id}
          name={name}
          placeholder={placeholder}
          type="search"
        />
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-brass px-5 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
