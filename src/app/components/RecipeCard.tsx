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
      className="absolute w-[90%] max-w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative h-full">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Enhanced gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">{recipe.cost}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{recipe.time}</span>
              </div>
            </div>
            <h2 className="text-4xl font-semibold mb-4 drop-shadow-2xl leading-tight">{recipe.name}</h2>
          </div>

          <div className="bg-gradient-to-b from-black/50 to-black/70 backdrop-blur-md p-5 rounded-2xl -mx-2 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium opacity-95">Key Ingredients</span>
              <ChevronUp className="w-4 h-4 opacity-70" />
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <span
                  key={idx}
                  className="bg-white/25 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-sm font-medium border border-white/20"
                >
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