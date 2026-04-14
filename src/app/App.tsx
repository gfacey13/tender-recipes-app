import { useEffect, useState } from "react";
import { RecipeCard, Recipe } from "./components/RecipeCard";
import { FilterPanel } from "./components/FilterPanel";
import { MatchModal } from "./components/MatchModal";
import { BottomNav } from "./components/BottomNav";
import { SavedScreen } from "./components/SavedScreen";
import { GroceryScreen } from "./components/GroceryScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { RecipeDetailView } from "./components/RecipeDetailView";
import { LoginScreen } from "./components/LoginScreen";
import { Heart, X, SlidersHorizontal, RotateCcw, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [matchedRecipe, setMatchedRecipe] = useState<Recipe | null>(null);
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);

  const [filters, setFilters] = useState({
    budget: "Any",
    dietary: [] as string[],
    ingredients: [] as string[],
  });

  const [activeTab, setActiveTab] = useState<"home" | "saved" | "grocery" | "profile">("home");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);

        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=");
        const data = await res.json();

        if (!data.meals) {
          setRecipes([]);
          return;
        }

        const mapped: Recipe[] = data.meals.map((meal: any) => {
          const ingredients = Array.from({ length: 20 }, (_, i) => {
            const ingredient = meal[`strIngredient${i + 1}`]?.trim();
            return ingredient ? ingredient : null;
          }).filter(Boolean) as string[];

          const rawTags = meal.strTags
            ? meal.strTags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
            : [];

          return {
            id: Number(meal.idMeal),
            name: meal.strMeal,
            image: meal.strMealThumb,
            cost: "$$",
            time: "30 min",
            ingredients,
            dietary: [meal.strCategory, meal.strArea, ...rawTags].filter(Boolean),
            instructions: meal.strInstructions
              ? meal.strInstructions
                  .split(/\r\n|\n|\.\s/)
                  .map((step: string) =>
                     step
                      .trim()
                      .replace(/^step\s*\d+[:.)-]*\s*/i, "")
                  )
                  .filter((step: string) => step.length > 2)
                  .filter((step: string) => !/^\d+[:.)-]*$/.test(step))
              : [],
          };
        });

        setRecipes(mapped);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

const filterRecipes = (recipesToFilter: Recipe[]) => {
  return recipesToFilter.filter((recipe) => {
    if (filters.budget !== "Any" && recipe.cost !== filters.budget) return false;
    if (filters.dietary.length > 0) {
      
      const ingredients = recipe.ingredients.map((i) => i.toLowerCase());

      const dairyWords = [
        "milk",
        "cheese",
        "butter",
        "cream",
        "yogurt",
        "yoghurt",
        "custard",
        "ghee",
        "mozzarella",
        "parmesan",
        "cheddar",
        "feta",
        "ricotta",
        "cream cheese",
        "evaporated milk",
        "condensed milk",
      ];

      const meatWords = [
        "chicken",
        "beef",
        "pork",
        "lamb",
        "bacon",
        "ham",
        "turkey",
        "sausage",
        "pepperoni",
        "veal",
      ];

      const seafoodWords = [
        "fish",
        "salmon",
        "shrimp",
        "prawn",
        "tuna",
        "cod",
        "crab",
        "lobster",
        "anchovy",
        "sardine",
        "mussel",
        "clam",
        "oyster",
        "scallop",
      ];

      const eggWords = ["egg", "eggs"];
      const honeyWords = ["honey"];
      const highCarbWords = [
        "rice",
        "pasta",
        "bread",
        "sugar",
        "potato",
        "flour",
        "noodles",
        "corn",
        "beans",
        "tortilla",
      ];

      const containsAny = (words: string[]) =>
        ingredients.some((ingredient) =>
          words.some((word) => ingredient.includes(word))
        );

      const isValid = filters.dietary.every((diet) => {
        switch (diet.toLowerCase()) {
          case "vegan":
            return (
              !containsAny(meatWords) &&
              !containsAny(seafoodWords) &&
              !containsAny(dairyWords) &&
              !containsAny(eggWords) &&
              !containsAny(honeyWords)
            );

          case "vegetarian":
            return !containsAny(meatWords) && !containsAny(seafoodWords);

          case "lactose free":
            return !containsAny(dairyWords);

          case "keto":
            return !containsAny(highCarbWords);

          case "seafood":
            return containsAny(seafoodWords);

          case "meat":
            return containsAny(meatWords);

          default:
            return true;
        }
      });

      if (!isValid) return false;
    }

    if (filters.ingredients.length > 0) {
      const hasOneIngredient = filters.ingredients.some((filterIngredient) =>
        recipe.ingredients.some((recipeIngredient) =>
          recipeIngredient.toLowerCase().includes(filterIngredient.toLowerCase())
        )
      );
      if (!hasOneIngredient) return false;
    }

    return true;
  });
};

const filteredRecipes = filterRecipes(recipes);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentIndex(0);
  };

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setReviewedCount((prev) => prev + 1);

    if (direction === "right" && currentIndex < filteredRecipes.length) {
      const savedRecipe = filteredRecipes[currentIndex];
      setSavedRecipes((prev) => [...prev, savedRecipe]);
      setTimeout(() => setMatchedRecipe(savedRecipe), 300);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 200);
  };

  const handleButtonAction = (action: "skip" | "save") => {
    handleSwipe(action === "skip" ? "left" : "right");
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const previousRecipe = filteredRecipes[currentIndex - 1];
      setCurrentIndex((prev) => prev - 1);

      if (
        savedRecipes.length > 0 &&
        previousRecipe &&
        savedRecipes[savedRecipes.length - 1].id === previousRecipe.id
      ) {
        setSavedRecipes((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleViewRecipe = () => {
    if (matchedRecipe) {
      setSelectedRecipe(matchedRecipe);
    }
    setMatchedRecipe(null);
  };

  const handleAddToGroceryList = (recipe?: Recipe) => {
    const targetRecipe = recipe ?? matchedRecipe;

    if (targetRecipe) {
      const newItems = targetRecipe.ingredients.filter((item) => !groceryList.includes(item));
      setGroceryList((prev) => [...prev, ...newItems]);
      setMatchedRecipe(null);
      setSelectedRecipe(null);
    }
  };

  const handleRemoveSaved = (id: number) => {
    setSavedRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
  };

  const handleRemoveGroceryItem = (item: string) => {
    setGroceryList((prev) => prev.filter((i) => i !== item));
  };

  const handleAddGroceryItem = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !groceryList.includes(trimmed)) {
      setGroceryList((prev) => [...prev, trimmed]);
    }
  };

  const handleClearGroceryList = () => {
    setGroceryList([]);
  };

  const currentRecipe = filteredRecipes[currentIndex];
  const hasMoreRecipes = currentIndex < filteredRecipes.length;

  const activeFilterCount =
    (filters.budget !== "Any" ? 1 : 0) +
    filters.dietary.length +
    filters.ingredients.length;

  const hasActiveFilters = activeFilterCount > 0;

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-b from-rose-50 to-orange-50">
        <p className="text-lg text-gray-700">Loading recipes...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isLoggedIn ? (
        <motion.div
          key="login"
          className="size-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35 }}
        >
          <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          className="size-full"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, type: "spring", bounce: 0.18 }}
        >
          <div className="size-full bg-gradient-to-b from-rose-50 to-orange-50 overflow-hidden">
            <div className="h-full flex flex-col max-w-[500px] mx-auto">
              {activeTab === "home" && (
                <header className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl text-gray-900">Tender Recipes</h1>
                    <p className="text-sm text-gray-500">{savedRecipes.length} saved</p>
                  </div>

                  <button
                    onClick={() => setShowFilterPanel(true)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[48px] ${
                      hasActiveFilters ? "bg-rose-500 text-white" : "bg-white text-gray-900"
                    }`}
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal
                      className={`w-5 h-5 ${hasActiveFilters ? "text-white" : "text-gray-700"}`}
                    />
                    <span className="font-medium">
                      Filters{hasActiveFilters ? ` (${activeFilterCount})` : ""}
                    </span>
                  </button>
                </header>
              )}

              <div className="flex-1 relative overflow-hidden pb-2">
                {activeTab === "home" && (
                  <div className="h-full flex items-center justify-center px-5 pb-36">
                    {!hasMoreRecipes ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-10 h-10 text-rose-500" />
                        </div>

                        {filteredRecipes.length === 0 ? (
                          <>
                            <h2 className="text-2xl mb-2 text-gray-900">No Matching Recipes</h2>
                            <p className="text-gray-500 mb-6 px-4">
                              No recipes match your current filters. Try adjusting your filters to
                              see more options.
                            </p>
                            <button
                              onClick={() => {
                                setFilters({ budget: "Any", dietary: [], ingredients: [] });
                                setCurrentIndex(0);
                              }}
                              className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                            >
                              Clear Filters
                            </button>
                          </>
                        ) : (
                          <>
                            <h2 className="text-2xl mb-2 text-gray-900">No More Recipes!</h2>
                            <p className="text-gray-500 mb-6">
                              You've reviewed all available recipes
                            </p>
                            <button
                              onClick={() => setCurrentIndex(0)}
                              className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                            >
                              Start Over
                            </button>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <AnimatePresence>
                        {currentRecipe && (
                          <RecipeCard
                            key={currentRecipe.id}
                            recipe={currentRecipe}
                            onSwipe={handleSwipe}
                            style={{ zIndex: 1 }}
                          />
                        )}
                      </AnimatePresence>
                    )}

                    <AnimatePresence>
                      {swipeDirection === "left" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1/4 right-12 z-10"
                        >
                          <div className="w-32 h-32 border-8 border-red-500 rounded-full flex items-center justify-center rotate-12 bg-white/90">
                            <span className="text-4xl text-red-500">SKIP</span>
                          </div>
                        </motion.div>
                      )}

                      {swipeDirection === "right" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1/4 left-12 z-10"
                        >
                          <div className="w-32 h-32 border-8 border-green-500 rounded-full flex items-center justify-center -rotate-12 bg-white/90">
                            <span className="text-4xl text-green-500">SAVE</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === "saved" && (
                  <SavedScreen
                    savedRecipes={savedRecipes}
                    onRemove={handleRemoveSaved}
                    onViewRecipe={(recipe) => setSelectedRecipe(recipe)}
                  />
                )}

                {activeTab === "grocery" && (
                  <GroceryScreen
                    groceryList={groceryList}
                    onRemoveItem={handleRemoveGroceryItem}
                    onAddItem={handleAddGroceryItem}
                    onClearList={handleClearGroceryList}
                  />
                )}

                {activeTab === "profile" && (
                  <ProfileScreen
                    savedCount={savedRecipes.length}
                    groceryCount={groceryList.length}
                    reviewedCount={reviewedCount}
                  />
                )}
              </div>

              {activeTab === "home" && (
                <div className="absolute bottom-20 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pb-4">
                  <div className="max-w-[500px] mx-auto px-6 py-6">
                    {hasMoreRecipes && (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleButtonAction("skip")}
                          className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[68px] hover:scale-105 transition-transform bg-white rounded-2xl shadow-lg px-4 py-3"
                          aria-label="Skip recipe"
                        >
                          <X className="w-6 h-6 text-red-500" />
                          <span className="text-sm font-medium text-gray-900">Skip</span>
                        </button>

                        <button
                          onClick={handleUndo}
                          disabled={currentIndex === 0}
                          className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[60px] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 bg-white rounded-2xl shadow-lg px-3 py-3"
                          aria-label="Undo last action"
                        >
                          <RotateCcw className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-medium text-gray-900">Undo</span>
                        </button>

                        <button
                          onClick={() => handleButtonAction("save")}
                          className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[68px] hover:scale-105 transition-transform bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg px-4 py-3"
                          aria-label="Save recipe"
                        >
                          <Heart className="w-6 h-6 text-white" fill="white" />
                          <span className="text-sm font-medium text-white">Save</span>
                        </button>

                        <button
                          onClick={() => {
                            if (currentRecipe) setSelectedRecipe(currentRecipe);
                          }}
                          className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[60px] hover:scale-105 transition-transform bg-white rounded-2xl shadow-lg px-3 py-3"
                          aria-label="Recipe details"
                        >
                          <Info className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                savedCount={savedRecipes.length}
                groceryCount={groceryList.length}
              />
            </div>

            <FilterPanel
              isOpen={showFilterPanel}
              onClose={() => setShowFilterPanel(false)}
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <AnimatePresence>
              {matchedRecipe && (
                <MatchModal
                  recipe={matchedRecipe}
                  onClose={() => setMatchedRecipe(null)}
                  onViewRecipe={handleViewRecipe}
                  onAddToGroceryList={() => handleAddToGroceryList()}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedRecipe && (
                <RecipeDetailView
                  recipe={selectedRecipe}
                  onClose={() => setSelectedRecipe(null)}
                  onAddToGroceryList={(recipe) => handleAddToGroceryList(recipe)}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}