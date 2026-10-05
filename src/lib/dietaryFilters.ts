const meat = /\b(chicken|beef|pork|lamb|bacon|ham|turkey|sausage|pepperoni|veal|duck|goose|venison|rabbit|lard|tallow|gelatin|gelatine)\b/i;
const seafood = /\b(fish|salmon|shrimp|shrimps|prawn|prawns|tuna|cod|crab|lobster|anchovy|anchovies|sardine|sardines|mussel|mussels|clam|clams|oyster|oysters|scallop|scallops|roe|caviar|surimi|bonito|dashi|haddock|mackerel|trout|squid|octopus|tilapia|sushi fish)\b/i;
const dairy = /\b(milk|cheese|butter|cream|yogurt|yoghurt|custard|ghee|mozzarella|parmesan|cheddar|feta|ricotta|paneer|whey|casein|buttermilk)\b/i;
const egg = /\b(egg|eggs|yolk|yolks|mayonnaise|mayo|aioli|meringue)\b/i;
const carbs = /\b(rice|pasta|bread|sugar|potato|potatoes|flour|noodle|noodles|corn|beans|tortilla|tortillas)\b/i;

function normalizedIngredient(value: string): string {
  return value.toLowerCase().replace(/[-_]/g, " ").trim();
}
function animalIngredient(value: string): string {
  // Explicitly labeled substitutes should not be treated as their animal counterparts.
  if (/\b(vegan|plant based)\b/.test(value)) return "";
  return value;
}
function dairyIngredient(value: string): string {
  return animalIngredient(value)
    .replace(/\b(coconut|almond|oat|soy|soya|rice|cashew)\s+(milk|cream|yogurt|yoghurt)\b/g, "")
    .replace(/\b(peanut|almond|cashew|cocoa)\s+butter\b/g, "")
    .replace(/\bcream of tartar\b/g, "");
}
export function matchesDietaryPreferences(ingredients: string[], preferences: string[]): boolean {
  if (!preferences.length) return true;
  if (!ingredients.length) return false;
  const names = ingredients.map(normalizedIngredient);
  const hasMeat = names.some(name => meat.test(animalIngredient(name)));
  const hasSeafood = names.some(name => seafood.test(animalIngredient(name)));
  const hasDairy = names.some(name => dairy.test(dairyIngredient(name)));
  const hasEgg = names.some(name => egg.test(animalIngredient(name)));
  return preferences.every(preference => {
    switch (preference.toLowerCase()) {
      case "vegan": return !hasMeat && !hasSeafood && !hasDairy && !hasEgg && !names.some(name => /\bhoney\b/.test(name));
      case "vegetarian": return !hasMeat && !hasSeafood;
      case "lactose free": return !names.some(name => !/\blactose free\b/.test(name) && dairy.test(dairyIngredient(name)));
      case "keto": return !names.some(name => carbs.test(name));
      case "seafood": return hasSeafood;
      case "meat": return hasMeat;
      default: return true;
    }
  });
}