import { motion, AnimatePresence } from "motion/react";
import { X, DollarSign, Leaf, Package } from "lucide-react";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    budget: string;
    dietary: string[];
    ingredients: string[];
  };
  onFilterChange: (filters: any) => void;
}

export function FilterPanel({ isOpen, onClose, filters, onFilterChange }: FilterPanelProps) {
  const budgetOptions = ["Any", "$", "$$", "$$$"];
  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"];
  const commonIngredients = ["Chicken", "Beef", "Rice", "Pasta", "Eggs", "Cheese", "Tomatoes", "Onions"];

  const toggleDietary = (option: string) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter(d => d !== option)
      : [...filters.dietary, option];
    onFilterChange({ ...filters, dietary: newDietary });
  };

  const toggleIngredient = (option: string) => {
    const newIngredients = filters.ingredients.includes(option)
      ? filters.ingredients.filter(i => i !== option)
      : [...filters.ingredients, option];
    onFilterChange({ ...filters, ingredients: newIngredients });
  };

  const clearFilters = () => {
    onFilterChange({
      budget: "Any",
      dietary: [],
      ingredients: []
    });
  };

  const activeFilterCount = 
    (filters.budget !== "Any" ? 1 : 0) + 
    filters.dietary.length + 
    filters.ingredients.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 z-10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Filters</h3>
                  {activeFilterCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close filters"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-8 pb-32">
              {/* Budget Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Budget</h4>
                    <p className="text-sm text-gray-500">Select your price range</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {budgetOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => onFilterChange({ ...filters, budget: option })}
                      className={`min-h-[52px] px-4 py-3 rounded-xl font-medium transition-all ${
                        filters.budget === option
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95"
                      }`}
                      aria-pressed={filters.budget === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>

              {/* Dietary Needs Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Dietary Needs</h4>
                    <p className="text-sm text-gray-500">Choose all that apply</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleDietary(option)}
                      className={`min-h-[48px] px-5 py-3 rounded-full font-medium transition-all ${
                        filters.dietary.includes(option)
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95"
                      }`}
                      aria-pressed={filters.dietary.includes(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>

              {/* Ingredients Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Ingredients I Have</h4>
                    <p className="text-sm text-gray-500">Select ingredients to prioritize</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {commonIngredients.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleIngredient(option)}
                      className={`min-h-[48px] px-5 py-3 rounded-full font-medium transition-all ${
                        filters.ingredients.includes(option)
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95"
                      }`}
                      aria-pressed={filters.ingredients.includes(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-900 py-4 rounded-xl hover:bg-gray-200 transition-colors font-medium min-h-[52px]"
                  aria-label="Clear all filters"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-4 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/30 font-semibold min-h-[52px]"
                aria-label="Apply filters and close"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}