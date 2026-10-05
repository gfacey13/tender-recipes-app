import { useRef } from "react";
import { motion } from "motion/react";
import { Clock } from "lucide-react";

export interface Recipe {
  id: number;
  name: string;
  image: string;
  cost: string;
  time: string;
  ingredients: string[];
  ingredientMeasures?: Record<string, string[]>;
  dietary?: string[];
  instructions?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onView?: () => void;
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}

export function RecipeCard({ recipe, onSwipe, onView, style }: RecipeCardProps) {
  const dragged = useRef(false);
  return (
    <motion.div
      drag="x"
      onPointerDown={() => { dragged.current = false; }}
      onDragStart={() => { dragged.current = true; }}
      onClick={() => { if (!dragged.current) onView?.(); }}
      role="button"
      tabIndex={0}
      aria-label={`View ${recipe.name} recipe details`}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onView?.(); } }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipe(info.offset.x > 0 ? "right" : "left");
        }
      }}
      style={style}
      className="absolute inset-x-0 mx-auto w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative h-full">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="absolute inset-0 w-full h-full object-cover"
        />


        {/* Enhanced gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/85" />
        <div className="recipe-card-caption absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">

                <span className="text-sm font-medium">Cost unavailable</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{recipe.time}</span>
              </div>
            </div>

            <div className="inline-block mb-2">
              <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-white">
                {recipe.name}
              </h2>
            </div>

          </div>

          <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium opacity-95">Key Ingredients</span>

            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                <span
                  key={idx}
                className="bg-white/15 backdrop-blur-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                  {ingredient}
                </span>
              ))}
              {recipe.ingredients.length > 4 && <span className="self-center text-xs text-white/80">+{recipe.ingredients.length - 4} more in Details</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}