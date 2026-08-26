import { motion } from "motion/react";
import { Clock, DollarSign, ChevronUp } from "lucide-react";

export interface Recipe {
  id: number;
  name: string;
  image: string;
  cost: string;
  time: string;
  ingredients: string[];
  dietary?: string[];
  instructions?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}

export function RecipeCard({ recipe, onSwipe, style }: RecipeCardProps) {
  return (
    <motion.div
      drag="x"
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

        <div className="absolute inset-0 bg-yellow-200/10" />
        {/* Enhanced gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/30 via-transparent to-amber-900/90" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-yellow-100">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-amber-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-200/30">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">{recipe.cost}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-200/30">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{recipe.time}</span>
              </div>
            </div>
            
            <div className="inline-block bg-gray-800/25 backdrop-blur-md px-4 py-2 rounded-2xl mb-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-yellow-100">
                {recipe.name}
              </h2>
            </div>
            
          </div>

          <div className="bg-gradient-to-b from-black/50 to-black/70 backdrop-blur-md p-3 sm:p-4 md:p-5 rounded-2xl -mx-2 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium opacity-95">Key Ingredients</span>
              <ChevronUp className="w-4 h-4 opacity-70" />
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <span
                  key={idx}
                className="bg-yellow-100/30 backdrop-blur-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border border-yellow-200/30">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}