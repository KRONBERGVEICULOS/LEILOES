export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatList(items: string[]) {
  return new Intl.ListFormat("pt-BR", {
    style: "long",
    type: "conjunction",
  }).format(items);
}
