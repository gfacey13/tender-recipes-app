import { X } from "lucide-react";

type Filters = {
  budget: string;
  dietary: string[];
  ingredients: string[];
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const dietaryOptions = [
  "Vegan",
  "Vegetarian",
  "Lactose Free",
  "Keto",
  "Seafood",
  "Meat",
];

const ingredientOptions = [
  "Chicken",
  "Beef",
  "Rice",
  "Cheese",
  "Egg",
  "Milk",
  "Garlic",
  "Onion",
  "Tomato",
  "Potato",
  "Pasta",
  "Salmon",
];

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
}: FilterPanelProps) {
  if (!isOpen) return null;

  const toggleDietary = (value: string) => {
    const updated = filters.dietary.includes(value)
      ? filters.dietary.filter((item) => item !== value)
      : [...filters.dietary, value];

    onFilterChange({ ...filters, dietary: updated });
  };

  const toggleIngredient = (value: string) => {
    const updated = filters.ingredients.includes(value)
      ? filters.ingredients.filter((item) => item !== value)
      : [...filters.ingredients, value];

    onFilterChange({ ...filters, ingredients: updated });
  };

  const clearAll = () => {
    onFilterChange({
      budget: "Any",
      dietary: [],
      ingredients: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      <div className="w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          <button onClick={onClose} aria-label="Close filters">
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Budget</h3>
          <div className="flex gap-2 flex-wrap">
            {["Any", "$", "$$", "$$$"].map((option) => (
              <button
                key={option}
                onClick={() => onFilterChange({ ...filters, budget: option })}
                className={`px-4 py-2 rounded-full border transition ${
                  filters.budget === option
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Dietary Preferences</h3>
          <div className="flex gap-2 flex-wrap">
            {dietaryOptions.map((option) => (
              <button
                key={option}
                onClick={() => toggleDietary(option)}
                className={`px-4 py-2 rounded-full border transition ${
                  filters.dietary.includes(option)
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Ingredients</h3>
          <div className="flex gap-2 flex-wrap">
            {ingredientOptions.map((option) => (
              <button
                key={option}
                onClick={() => toggleIngredient(option)}
                className={`px-4 py-2 rounded-full border transition ${
                  filters.ingredients.includes(option)
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={clearAll}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-800"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}