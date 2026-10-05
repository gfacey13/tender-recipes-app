// Only rewrite recognized cooking verbs; preserve unfamiliar wording and notes.
const verbs: Record<string, string> = {
  used: "Use", combined: "Combine", topped: "Top", added: "Add",
  mixed: "Mix", stirred: "Stir", chopped: "Chop", sliced: "Slice",
  peeled: "Peel", shredded: "Shred", cooked: "Cook", baked: "Bake",
  fried: "Fry", boiled: "Boil", heated: "Heat", poured: "Pour",
  placed: "Place", transferred: "Transfer", served: "Serve",
  sprinkled: "Sprinkle", seasoned: "Season", whisked: "Whisk",
  beat: "Beat", cut: "Cut", put: "Put", left: "Leave",
};

export function cleanRecipeInstruction(step: string): string {
  const text = step.trim();
  const match = /^(?:I|We)\s+(?:then\s+)?([a-z]+)\b(.*)$/i.exec(text);
  if (!match) return text;
  const verb = verbs[match[1].toLowerCase()];
  return verb ? `${verb}${match[2]}` : text;
}