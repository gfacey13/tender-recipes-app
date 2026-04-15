import { Recipe } from "./RecipeCard";
import { Clock, DollarSign, ChefHat, Trash2, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface SavedScreenProps {
  savedRecipes: Recipe[];
  onRemove: (id: number) => void;
  onViewRecipe: (recipe: Recipe) => void;
}

export function SavedScreen({ savedRecipes, onRemove, onViewRecipe }: SavedScreenProps) {
  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="max-w-[500px] mx-auto px-5 py-6">
        <div className="mb-6">
          <h2 className="text-2xl text-gray-900 mb-1">Saved Recipes</h2>
          <p className="text-gray-500">{savedRecipes.length} recipes saved</p>
        </div>

        {savedRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl mb-2 text-gray-900">No Saved Recipes Yet</h3>
            <p className="text-gray-500">Start swiping to find recipes you love!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {savedRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => onViewRecipe(recipe)}
              >
                <div className="flex gap-4 items-stretch">
                  {/* Thumbnail */}
                  <div
                    className="w-28 h-28 flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${recipe.image})` }}
                  />

                  {/* Info */}
                  <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base text-gray-900 leading-snug mb-1.5 pr-1">
                        {recipe.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{recipe.cost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{recipe.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remove button — stopPropagation so it doesn't open details */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(recipe.id);
                      }}
                      className="self-start text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 mt-2"
                      aria-label={`Remove ${recipe.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-xs">Remove</span>
                    </button>
                  </div>

                  {/* Chevron hint */}
                  <div className="flex items-center pr-3">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
