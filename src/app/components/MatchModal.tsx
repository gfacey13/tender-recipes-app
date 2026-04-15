import { motion } from "motion/react";
import { Recipe } from "./RecipeCard";
import { Heart, ShoppingCart, Eye, X, Clock, DollarSign } from "lucide-react";

interface MatchModalProps {
  recipe: Recipe;
  onClose: () => void;
  onViewRecipe: () => void;
  onAddToGroceryList: () => void;
}

export function MatchModal({ recipe, onClose, onViewRecipe, onAddToGroceryList }: MatchModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-[90%] max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] bg-white/95 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors backdrop-blur-sm"
          aria-label="Close match confirmation"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Hero Image with Heart */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30">
              <Heart className="w-14 h-14 text-white" fill="white" />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
              It's a Match!
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              You saved{" "}
              <span className="font-semibold text-gray-900">{recipe.name}</span>
            </p>
          </motion.div>

          {/* Recipe Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm"
          >
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 rounded-2xl" />
            
            <div className="relative">
              {/* Cost and Time */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">{recipe.cost}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{recipe.time}</span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 text-center">
                  Key Ingredients
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {recipe.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3.5 py-1.5 bg-white rounded-full text-sm font-medium text-gray-800 border border-gray-300 shadow-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={onViewRecipe}
              className="w-full min-h-[68px] py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-500/30 active:scale-[0.98]"
              aria-label="View full recipe details"
            >
              <Eye className="w-6 h-6" />
              <span className="text-lg font-semibold">View Full Recipe</span>
            </button>
            
            <button
              onClick={onAddToGroceryList}
              className="w-full min-h-[68px] py-4 bg-white text-gray-900 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 border-2 border-gray-300 shadow-md active:scale-[0.98]"
              aria-label="Add ingredients to grocery list"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="text-lg font-semibold">Add to Grocery List</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}