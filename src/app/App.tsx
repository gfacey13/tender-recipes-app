import { useEffect, useRef, useState } from "react";
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
import { supabase } from "../lib/supabase";



export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [fetchAttempt, setFetchAttempt] = useState(0);
  const [history, setHistory] = useState<{ recipe: Recipe; direction: "left" | "right"; index: number }[]>([]);
  const actionPending = useRef(false);
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
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsLoggedIn(!!session);
        setAuthLoading(false);
        if (!session) {
          setSavedRecipes([]);
          setGroceryList([]);
          setHistory([]);
          setCurrentIndex(0);
        }
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setIsLoggedIn(!!session);
        setAuthLoading(false);
      }
    }).catch(() => { if (active) setAuthLoading(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setFetchError(false);

        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=", { signal: controller.signal });
        if (!res.ok) throw new Error(`Recipe request failed (${res.status})`);
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
        if (controller.signal.aborted) return;
        setFetchError(true);
        console.error("Failed to fetch recipes:", error);
        setRecipes([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchRecipes();
    return () => controller.abort();
  }, [fetchAttempt]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    const loadSavedRecipes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.log(error);
        return;
      }

      const formattedRecipes = data.map((recipe: any) => ({
        id: Number(recipe.recipe_id),
        name: recipe.recipe_name,
        image: recipe.image,
        cost: recipe.cost,
        time: recipe.time,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions || [],
      }));

      if (active) setSavedRecipes(formattedRecipes);
    };

    loadSavedRecipes().catch(console.error);
    return () => { active = false; };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    const loadGroceryItems = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("grocery_items")
        .select("item_name")
        .eq("user_id", user.id);

      if (error) {
        console.log(error);
        return;
      }

      if (active) setGroceryList(data.map((item: any) => item.item_name));
    };

    loadGroceryItems().catch(console.error);
    return () => { active = false; };
  }, [isLoggedIn]);

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

const filteredRecipes = filterRecipes(
  recipes.filter(
    (recipe) => !savedRecipes.some((saved) => saved.id === recipe.id)
  )
);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentIndex(0);
    setHistory([]);
  };


    const handleSwipe = async (direction: "left" | "right") => {
      const recipe = filteredRecipes[currentIndex];
      if (!recipe || actionPending.current) return;
      actionPending.current = true;
      setSwipeDirection(direction);
      try {
        if (direction === "right" && !(await saveRecipe(recipe))) return;
        setHistory(prev => [...prev, { recipe, direction, index: currentIndex }]);
        setReviewedCount(prev => prev + 1);
        // Saving removes this card from the deck, so its successor already has this index.
        if (direction === "left") setCurrentIndex(prev => prev + 1);
        else setMatchedRecipe(recipe);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Could not save recipe. Please try again.");
      } finally {
        setSwipeDirection(null);
        actionPending.current = false;
      }
    };

    const saveRecipe = async (recipe: Recipe) => {
      const alreadySaved = savedRecipes.some((saved) => saved.id === recipe.id);

      if (alreadySaved) return false;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first");
        return false;
      }

      const { error } = await supabase.from("saved_recipes").insert({
        user_id: user.id,
        recipe_id: recipe.id.toString(),
        recipe_name: recipe.name,
        image: recipe.image,
        cost: recipe.cost,
        time: recipe.time,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions || [],
      });

      if (error) {
        alert(error.message);
        return false;
      }

      setSavedRecipes((prev) => [...prev, recipe]);
      return true;
    };

  const handleButtonAction = async (action: "skip" | "save") => {
    if (action === "save") {
      await handleSwipe("right");
    } else {
      handleSwipe("left");
    }
  };

  const handleUndo = async () => {
    const last = history[history.length - 1];
    if (!last || actionPending.current) return;
    actionPending.current = true;
    try {
      if (last.direction === "right" && !(await handleRemoveSaved(last.recipe.id))) return;
      setCurrentIndex(last.index);
      setHistory(prev => prev.slice(0, -1));
      setReviewedCount(prev => Math.max(0, prev - 1));
      setMatchedRecipe(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not undo. Please try again.");
    } finally { actionPending.current = false; }
  };

  const handleViewRecipe = () => {
    if (matchedRecipe) {
      setSelectedRecipe(matchedRecipe);
    }
    setMatchedRecipe(null);
  };

  const handleAddToGroceryList = async (recipe?: Recipe) => {
    const targetRecipe = recipe ?? matchedRecipe;

    if (!targetRecipe) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first");
      return;
    }

    const newItems = targetRecipe.ingredients.filter(
      (item) => !groceryList.includes(item)
    );

    if (newItems.length === 0) return;

    const rows = newItems.map((item) => ({
      user_id: user.id,
      item_name: item,
    }));

    const { error } = await supabase.from("grocery_items").insert(rows);

    if (error) {
      alert(error.message);
      return;
    }

    setGroceryList((prev) => [...prev, ...newItems]);
    setMatchedRecipe(null);
    setSelectedRecipe(null);
  };

  const handleRemoveSaved = async (id: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from("saved_recipes")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", id.toString());

    if (error) { alert(error.message); return false; }
    setSavedRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    return true;
  };

  const handleRemoveGroceryItem = async (item: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", item);

    if (error) { alert(error.message); return; }
    setGroceryList((prev) => prev.filter((groceryItem) => groceryItem !== item));
  };

  const handleAddGroceryItem = async (item: string) => {
    const trimmed = item.trim();
    if (!trimmed || groceryList.some(existing => existing.toLowerCase() == trimmed.toLowerCase())) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("grocery_items").insert({ user_id: user.id, item_name: trimmed });
    if (error) { alert(error.message); return; }
    setGroceryList(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
  };

  const handleClearGroceryList = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    setGroceryList([]);
  };

  const currentRecipe = filteredRecipes[currentIndex];
  const hasMoreRecipes = currentIndex < filteredRecipes.length;

  const activeFilterCount =
    (filters.budget !== "Any" ? 1 : 0) +
    filters.dietary.length +
    filters.ingredients.length;

  const hasActiveFilters = activeFilterCount > 0;

  if (authLoading || (isLoggedIn && loading)) {
    return (
      <div className="size-full bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-100">

        <div className="flex justify-center pt-6">
          <h1 className="text-3xl flex items-center gap-2 tracking-tight">
            <span
              style={{ fontFamily:  "Cherry Bomb One, cursive" }}
              className="text-amber-400"
            >
              Tender
            </span>
            <span
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-gray-900 font-semibold"
            >
              Recipes
            </span>
          </h1>
        </div>
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
          <div className="relative h-[100dvh] w-full bg-gradient-to-b from-[#F8F7F4] via-[#F1EEE8] to-[#E7E1D8] overflow-hidden">
              <div className="app-shell relative h-full flex flex-col w-full max-w-[500px] mx-auto px-2 sm:px-4 bg-[#F8F7F4]">
              {activeTab === "home" && (
                <header className="shrink-0 px-2 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-2">
                  <div>
                    
                    <h1 className="flex items-baseline gap-2 leading-none">
                      <span
                        style={{ fontFamily: "Cherry Bomb One, cursive" }}
                        className="text-3xl sm:text-4xl md:text-5xl text-amber-500 !font-normal"
                      >
                        Tender
                      </span>

                      <span
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        className="text-xl sm:text-[1.9rem] text-gray-900 font-semibold"
                      >
                        Recipes
                      </span>
                    </h1>

                    <p className="text-sm text-gray-500 ml-2 relative top-2">{savedRecipes.length} saved</p>
                  </div>

                  <button
                    onClick={() => setShowFilterPanel(true)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[48px] ${
                      hasActiveFilters ? "bg-amber-500 text-white" : "bg-white text-gray-900"
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

              <div className="app-content flex-1 relative min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
                {activeTab === "home" && (
                  <div className="discovery-stage relative px-2 sm:px-5 py-3 flex-1 flex items-center justify-center">
                    {!hasMoreRecipes ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-10 h-10 text-yellow-500" />
                        </div>

                        {fetchError ? (
                          <>
                            <h2 className="text-2xl mb-2 text-gray-900">Could not load recipes</h2>
                            <button onClick={() => setFetchAttempt(prev => prev + 1)} className="px-6 py-3 bg-amber-500 text-white rounded-full">Try Again</button>
                          </>
                        ) : filteredRecipes.length === 0 ? (
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
                              className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
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
                              onClick={() => { setCurrentIndex(0); setHistory([]); }}
                              className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
                            >
                              Start Over
                            </button>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex justify-center items-center w-full h-full min-h-0">
                        <motion.div
                          className="
                          relative
                          w-full
                          max-w-[360px]
                          sm:max-w-[400px]
                          md:max-w-[430px]
                          h-full max-h-[620px]
                          "
                          animate={{
                            x: [0, 18, 0, -18, 0],
                          }}
                          transition={{
                            delay: 4,
                            duration: 1.2,
                            repeat: Infinity,
                            repeatDelay: 6,
                          }}
                        >
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
                        </motion.div>
                      </div>
                    )}

                    <AnimatePresence>
                      {swipeDirection === "left" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1/4 right-12 z-10"
                        >
                          <div className="w-32 h-32 border-8 border-amber-400 text-red-500 rounded-full flex items-center justify-center rotate-12 bg-white/90">
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
                          <div className="w-32 h-32 border-8 border-green-500 text-green-500 rounded-full flex items-center justify-center -rotate-12 bg-white/90">
                            <span className="text-4xl text-green-500">SAVE</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === "saved" && (
                  <div className="h-full overflow-y-auto">
                    <SavedScreen
                      savedRecipes={savedRecipes}
                      onRemove={handleRemoveSaved}
                      onViewRecipe={(recipe) => setSelectedRecipe(recipe)}
                    />
                  </div>
                )}

                {activeTab === "grocery" && (
                  <div className="h-full overflow-y-auto">
                    <GroceryScreen
                      groceryList={groceryList}
                      onRemoveItem={handleRemoveGroceryItem}
                      onAddItem={handleAddGroceryItem}
                      onClearList={handleClearGroceryList}
                    />
                  </div>
                )}

                {activeTab === "profile" && (

                  <div className="h-full overflow-y-auto">
                    <ProfileScreen
                      savedCount={savedRecipes.length}
                      groceryCount={groceryList.length}
                      reviewedCount={reviewedCount}
                      onLogout={async () => {
                        try {
                          const { error } = await supabase.auth.signOut();
                          if (error) throw error;
                          setActiveTab("home");
                        } catch (error) {
                          alert(error instanceof Error ? error.message : "Could not log out. Please try again.");
                        }
                      }}
                    />
                  </div>
                )}

              </div>
              {activeTab === "home" && (hasMoreRecipes || history.length > 0) && (
                <div className="recipe-actions relative shrink-0 bg-gradient-to-t from-white via-white to-transparent z-20">
                  <div className="max-w-[500px] mx-auto px-0 py-2">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleButtonAction("skip")}
                        disabled={!hasMoreRecipes || swipeDirection !== null}
                        className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[68px] hover:scale-105 transition-transform bg-white rounded-2xl shadow-lg px-4 py-3"
                        aria-label="Skip recipe"
                      >
                        <X className="w-6 h-6 text-amber-500" />
                        <span className="text-sm font-medium text-gray-900">Skip</span>
                      </button>

                      <button
                        onClick={handleUndo}
                        disabled={history.length === 0 || swipeDirection !== null}
                        className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[60px] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 bg-white rounded-2xl shadow-lg px-3 py-3"
                        aria-label="Undo last action"
                      >
                        <RotateCcw className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium text-gray-900">Undo</span>
                      </button>

                      <button
                        onClick={() => handleButtonAction("save")}
                        disabled={!hasMoreRecipes || swipeDirection !== null}
                        className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[68px] hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg px-4 py-3"
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
                  </div>
                </div>
              )}

            <div className="mt-auto shrink-0 relative z-30">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}