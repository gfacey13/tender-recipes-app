import { useState } from "react";
import { Check, Plus, Trash2, ShoppingBag, DollarSign, Sparkles, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GroceryScreenProps {
  groceryList: string[];
  onRemoveItem: (item: string) => void;
  onAddItem: (item: string) => void;
  onClearList: () => void;
}

// Categorize ingredients
const categorizeItem = (item: string): string => {
  const itemLower = item.toLowerCase();

  if (["tomato", "onion", "garlic", "bell pepper", "zucchini", "vegetable", "herb", "basil",
    "green onion", "ginger", "spinach", "broccoli", "lettuce", "avocado", "carrot",
    "celery", "lemon", "lime", "cherry tomato", "mushroom", "sweet potato", "snap pea"].some(p => itemLower.includes(p))) {
    return "Produce";
  }

  if (["chicken", "beef", "pork", "salmon", "egg", "bacon", "lamb", "tofu",
    "fish", "shrimp", "turkey", "meat", "steak"].some(p => itemLower.includes(p))) {
    return "Protein";
  }

  if (["cheese", "cream", "mozzarella", "parmesan", "pecorino", "feta", "milk",
    "butter", "dairy", "yogurt", "coconut milk"].some(p => itemLower.includes(p))) {
    return "Dairy";
  }

  return "Pantry";
};

const categoryConfig = {
  Produce:  { icon: "🥬", color: "bg-green-50  text-green-700  border-green-200",  dot: "bg-green-500"  },
  Protein:  { icon: "🍗", color: "bg-red-50    text-red-700    border-red-200",    dot: "bg-red-500"    },
  Dairy:    { icon: "🧀", color: "bg-blue-50   text-blue-700   border-blue-200",   dot: "bg-blue-500"   },
  Pantry:   { icon: "🏺", color: "bg-amber-50  text-amber-700  border-amber-200",  dot: "bg-amber-500"  },
};

const CATEGORY_ORDER = ["Produce", "Protein", "Dairy", "Pantry"] as const;

export function GroceryScreen({
  groceryList,
  onRemoveItem,
  onAddItem,
  onClearList,
}: GroceryScreenProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCheck = (item: string) => {
    const next = new Set(checkedItems);
    next.has(item) ? next.delete(item) : next.add(item);
    setCheckedItems(next);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem("");
      setShowInput(false);
    }
  };

  const handleAddFirstItems = () => {
    const exampleItems = ["Chicken", "Rice", "Tomatoes", "Eggs", "Onions", "Garlic", "Parmesan", "Milk"];
    exampleItems.forEach(item => {
      if (!groceryList.includes(item)) onAddItem(item);
    });
  };

  // Filter based on search
  const filteredList = searchQuery.trim()
    ? groceryList.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : groceryList;

  // Group filtered items by category
  const categorizedItems = CATEGORY_ORDER.reduce<Record<string, string[]>>((acc, cat) => {
    acc[cat] = filteredList.filter(item => categorizeItem(item) === cat);
    return acc;
  }, {} as Record<string, string[]>);

  const activeCategories = CATEGORY_ORDER.filter(cat => categorizedItems[cat].length > 0);

  const isSearching = searchQuery.trim().length > 0;
  const noSearchResults = isSearching && filteredList.length === 0;

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      <div className="max-w-[500px] mx-auto px-5 py-6">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-semibold text-gray-900">Grocery List</h2>
            {groceryList.length > 0 && (
              <button
                onClick={onClearList}
                className="min-h-[44px] px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl flex items-center gap-1.5"
                aria-label="Clear all items"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {groceryList.length} {groceryList.length === 1 ? "item" : "items"}
            {checkedItems.size > 0 && ` · ${checkedItems.size} checked`}
          </p>
        </div>

        {/* Search Bar — always visible when list has items */}
        {groceryList.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Search grocery items</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items like chicken, rice, milk"
                className="w-full h-12 pl-11 pr-10 bg-white border border-gray-200 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
                aria-label="Search grocery items"
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Find Cheapest Alternatives */}
        {groceryList.length > 0 && !isSearching && (
          <button
            className="w-full min-h-[52px] px-5 py-3 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2.5 font-semibold"
            aria-label="Find cheapest alternatives"
          >
            <DollarSign className="w-5 h-5" />
            <span>Find Cheapest Alternatives</span>
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {/* Empty State — no items at all */}
        {groceryList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
              <ShoppingBag className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No Items Yet</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs mx-auto">
              Add ingredients from saved recipes or create your own custom list
            </p>
            <button
              onClick={handleAddFirstItems}
              className="min-h-[52px] px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-md inline-flex items-center gap-2.5 font-semibold"
              aria-label="Add first items"
            >
              <Plus className="w-5 h-5" />
              Add First Item
            </button>
          </motion.div>
        )}

        {/* No Search Results */}
        {noSearchResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-14 px-6"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
            <p className="text-sm text-gray-500">
              No items found in your grocery list matching{" "}
              <span className="font-medium text-gray-700">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {/* Categorized Grocery List */}
        {groceryList.length > 0 && !noSearchResults && (
          <div className="space-y-5">
            {activeCategories.map((category) => {
              const items = categorizedItems[category];
              const cfg = categoryConfig[category];
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Category Header */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border mb-3 ${cfg.color}`}>
                    <span className="text-xl" role="img" aria-label={category}>
                      {cfg.icon}
                    </span>
                    <span className="text-sm font-bold tracking-wide uppercase">{category}</span>
                    <span className="ml-auto text-xs font-semibold opacity-60">
                      {items.filter(i => !checkedItems.has(i)).length} / {items.length}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {items.map((item) => {
                        const checked = checkedItems.has(item);
                        return (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.18 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleCheck(item)}
                              className={`w-[28px] h-[28px] min-w-[28px] rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                checked
                                  ? "bg-green-500 border-green-500"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              role="checkbox"
                              aria-checked={checked}
                              aria-label={`Mark ${item} as ${checked ? "unchecked" : "checked"}`}
                            >
                              {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                            </button>

                            {/* Item Name + Quantity */}
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-base font-medium transition-all block truncate ${
                                  checked ? "line-through text-gray-400" : "text-gray-900"
                                }`}
                              >
                                {item}
                              </span>
                              <span className="text-xs text-gray-400 mt-0.5 block">1 unit</span>
                            </div>

                            {/* Category dot */}
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden="true" />

                            {/* Remove */}
                            <button
                              onClick={() => onRemoveItem(item)}
                              className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                              aria-label={`Remove ${item}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {/* Add Item Row */}
            {!isSearching && (
              <div className="pt-1">
                <AnimatePresence mode="wait">
                  {showInput ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-white rounded-2xl shadow-md border-2 border-amber-200 px-4 py-3 flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                        placeholder="Enter item name..."
                        className="flex-1 outline-none text-base font-medium text-gray-900 placeholder-gray-400"
                        autoFocus
                        aria-label="New item name"
                      />
                      <button
                        onClick={handleAddItem}
                        className="w-9 h-9 flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                        aria-label="Confirm add item"
                      >
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => { setShowInput(false); setNewItem(""); }}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowInput(true)}
                      className="w-full min-h-[52px] py-3.5 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center justify-center gap-2 font-semibold"
                      aria-label="Add new item"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
