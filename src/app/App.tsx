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
import { supabase } from "../lib/supabase";



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
    const checkSession = async () => {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
    };

    checkSession();
  }, []);

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

  useEffect(() => {
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

      setSavedRecipes(formattedRecipes);
    };

    loadSavedRecipes();
  }, [isLoggedIn]);

  useEffect(() => {
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

      setGroceryList(data.map((item: any) => item.item_name));
    };

    loadGroceryItems();
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
  };


    const handleSwipe = async (direction: "left" | "right") => {
      setSwipeDirection(direction);
      setReviewedCount((prev) => prev + 1);

      if (direction === "right" && currentIndex < filteredRecipes.length) {
        const savedRecipe = filteredRecipes[currentIndex];

        await saveRecipe(savedRecipe); // saves to Supabase
        setTimeout(() => setMatchedRecipe(savedRecipe), 300);
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 200);
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

    if (!user) return;

    await supabase
      .from("saved_recipes")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", id.toString());

    setSavedRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
  };

  const handleRemoveGroceryItem = async (item: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", item);

    setGroceryList((prev) => prev.filter((groceryItem) => groceryItem !== item));
  };

  const handleAddGroceryItem = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !groceryList.includes(trimmed)) {
      setGroceryList((prev) => [...prev, trimmed]);
    }
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

  if (loading) {
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
          <div className="relative h-screen w-full bg-gradient-to-b from-[#F8F7F4] via-[#F1EEE8] to-[#E7E1D8] overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">

                <div className="absolute top-24 left-[8%] w-72 h-72 bg-stone-200/30 rounded-full blur-3xl"></div>
                  
                  <div className="absolute bottom-24 right-[8%] w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>

                  <motion.div
                    className="absolute top-32 left-[12%] text-5xl opacity-20 rotate-[-12deg]"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🍜
                  </motion.div>
                  
                  <motion.div
                    className="absolute top-3/7 right-[18%] text-5xl opacity-20 rotate-[-12deg]"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🍕
                  </motion.div>

                  <motion.div
                    className="absolute bottom-32 left-[15%] text-5xl opacity-20 rotate-[-10 deg]"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🥗
                  </motion.div>

                  <motion.div
                    className="absolute top-1/4 right-[28%] text-5xl opacity-20 rotate-[-8deg]"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0]
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🍔
                  </motion.div>

                  <motion.div
                    className="absolute bottom-1/3 right-[25%] text-5xl opacity-20 rotate-12"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🍣
                  </motion.div>

                  <motion.div
                    className="absolute top-2/3 left-[18%] text-5xl opacity-20 rotate-[-15deg]"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0]
                    }}
                    transition={{
                      duration: 9,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🌮
                  </motion.div>

                  <motion.div
                    className="absolute top-[18%] left-[8%] text-5xl opacity-15 rotate-[-10deg]"
                    animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🍩
                  </motion.div> 

                  <motion.div
                    className="absolute top-[55%] left-[10%] text-5xl opacity-15 rotate-12"
                    animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🍓
                  </motion.div>     

                  <motion.div
                    className="absolute bottom-[55%] left-[20%] text-5xl opacity-15 rotate-[-15deg]"
                    animate={{ y: [0, -12, 0], x: [0, 9, 0] }}
                    transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🥐
                  </motion.div>                                                

                  <motion.div
                    className="absolute top-[22%] right-[10%] text-5xl opacity-15 rotate-12"
                    animate={{ y: [0, -10, 0], x: [0, -6, 0] }}
                    transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🧋
                  </motion.div>

                  <motion.div
                    className="absolute top-[60%] right-[12%] text-5xl opacity-15 rotate-[-8deg]"
                    animate={{ y: [0, 12, 0], x: [0, 7, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🍰
                  </motion.div>

                  <motion.div
                    className="absolute bottom-[18%] right-[8%] text-5xl opacity-15 rotate-6"
                    animate={{ y: [0, -11, 0], x: [0, -5, 0] }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🍝
                  </motion.div>

                </div>
              
              <div className="relative h-full flex flex-col w-full max-w-[500px] mx-auto px-4">
              {activeTab === "home" && (
                <header className="px-6 py-5 flex items-center justify-between">
                  <div>
                    
                    <h1 className="flex items-end gap-2 leading-none">
                      <span
                        style={{ fontFamily: "Cherry Bomb One, cursive" }}
                        className="text-4xl md:text-5xl text-amber-500 !font-normal"
                      >
                        Tender
                      </span>

                      <span
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        className="text-[1.9rem] text-gray-900 font-semibold"
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

              <div className="flex-1 relative min-h-0 overflow-hidden">
                {activeTab === "home" && (
                  <div className="px-5 pt-2 pb-8">
                    {!hasMoreRecipes ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-10 h-10 text-yellow-500" />
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
                              onClick={() => setCurrentIndex(0)}
                              className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
                            >
                              Start Over
                            </button>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex justify-center">
                        <motion.div
                          className="relative w-full max-w-[400px] h-[540px]"
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
                    />
                  </div>
                )}

              </div>
              {activeTab === "home" && hasMoreRecipes && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pb-20">
                  <div className="max-w-[500px] mx-auto px-0 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleButtonAction("skip")}
                        className="flex flex-col items-center justify-center gap-2 min-h-[68px] min-w-[68px] hover:scale-105 transition-transform bg-white rounded-2xl shadow-lg px-4 py-3"
                        aria-label="Skip recipe"
                      >
                        <X className="w-6 h-6 text-amber-500" />
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

            <div className="mt-auto">
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