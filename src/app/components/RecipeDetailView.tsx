import { motion } from "motion/react";
import { ArrowLeft, Clock, DollarSign, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Recipe } from "./RecipeCard";

interface RecipeDetailViewProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToGroceryList: (recipe: Recipe) => void;
}

const dietaryColors: Record<string, string> = {
  "Vegetarian": "bg-green-100 text-green-700",
  "Vegan": "bg-emerald-100 text-emerald-700",
  "Gluten-Free": "bg-amber-100 text-amber-700",
  "Dairy-Free": "bg-blue-100 text-blue-700",
  "Keto": "bg-purple-100 text-purple-700",
  "Paleo": "bg-orange-100 text-orange-700",
};

export function RecipeDetailView({ recipe, onClose, onAddToGroceryList }: RecipeDetailViewProps) {
  const instructions = recipe.instructions ?? [];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-white flex flex-col max-w-[500px] mx-auto"
    >
      {/* Hero image with back button overlay */}
      <div className="relative h-64 flex-shrink-0">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Recipe name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl text-white drop-shadow-lg leading-tight">{recipe.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <DollarSign className="w-3.5 h-3.5 text-white" />
              <span className="text-sm text-white">{recipe.cost}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span className="text-sm text-white">{recipe.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-6 pb-32">

          {/* Dietary tags */}
          {recipe.dietary && recipe.dietary.length > 0 && (
            <div>
              <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Dietary</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.dietary.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm ${dietaryColors[tag] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Ingredients</h2>
            <div className="grid grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Instructions</h2>
              <div className="space-y-4">
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-white">{idx + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 max-w-[500px] mx-auto px-5 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={() => onAddToGroceryList(recipe)}
          className="w-full flex items-center justify-center gap-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white py-4 rounded-2xl transition-colors shadow-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Grocery List</span>
        </button>
      </div>
    </motion.div>
  );
}
