import { useState } from "react";
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

const allRecipes: Recipe[] = [
  {
    id: 1,
    name: "Creamy Garlic Pasta",
    image: "https://images.unsplash.com/photo-1734769774783-78ddeed93751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "20 min",
    ingredients: ["Pasta", "Garlic", "Cream", "Parmesan"],
    dietary: ["Vegetarian"],
    instructions: [
      "Bring a large pot of salted water to a boil. Cook pasta until al dente, then reserve ½ cup pasta water before draining.",
      "Meanwhile, melt butter in a large skillet over medium heat. Add minced garlic and sauté for 1–2 minutes until fragrant but not browned.",
      "Pour in the heavy cream and bring to a gentle simmer. Season with salt, pepper, and a pinch of nutmeg.",
      "Add the drained pasta to the skillet and toss to coat. Add a splash of pasta water to loosen the sauce to your liking.",
      "Remove from heat and stir in grated Parmesan until melted and silky. Serve immediately topped with extra Parmesan and fresh parsley.",
    ],
  },
  {
    id: 2,
    name: "Mediterranean Bowl",
    image: "https://images.unsplash.com/photo-1615196483149-f6ab06744895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "35 min",
    ingredients: ["Quinoa", "Chickpeas", "Feta", "Tomatoes"],
    dietary: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Rinse quinoa under cold water. Combine with 2 cups water in a saucepan, bring to a boil, then reduce heat, cover, and simmer for 15 minutes until fluffy.",
      "While quinoa cooks, drain and rinse chickpeas. Toss with olive oil, cumin, and paprika, then roast at 400°F for 20 minutes until crispy.",
      "Dice tomatoes, cucumber, and red onion. Toss with lemon juice, olive oil, salt, and fresh herbs.",
      "Assemble bowls: spoon quinoa as the base, add roasted chickpeas, the vegetable mix, and sliced olives.",
      "Top generously with crumbled feta, drizzle with extra-virgin olive oil, and finish with a squeeze of lemon.",
    ],
  },
  {
    id: 3,
    name: "Teriyaki Salmon Bowl",
    image: "https://images.unsplash.com/photo-1596181367808-c7c64b779b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$$",
    time: "30 min",
    ingredients: ["Salmon", "Rice", "Teriyaki", "Vegetables"],
    dietary: ["Dairy-Free"],
    instructions: [
      "Cook Japanese short-grain rice according to package instructions. Season with a splash of rice vinegar and a pinch of sugar while warm.",
      "Pat salmon fillets dry and brush all over with teriyaki sauce. Let marinate for 10 minutes while you prep the vegetables.",
      "Heat a non-stick pan over medium-high heat. Place salmon skin-side down and cook for 4 minutes, then flip and cook another 3 minutes.",
      "Blanch broccoli and snap peas in boiling water for 2 minutes, then drain and toss with sesame oil.",
      "Build the bowl: rice base, salmon fillet, and vegetables. Drizzle with extra teriyaki, garnish with sesame seeds and sliced scallions.",
    ],
  },
  {
    id: 4,
    name: "Roasted Vegetable Platter",
    image: "https://images.unsplash.com/photo-1614207279966-a46c93c0fbc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "45 min",
    ingredients: ["Bell Peppers", "Zucchini", "Onions", "Herbs"],
    dietary: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free"],
    instructions: [
      "Preheat oven to 425°F (220°C). Line two large baking sheets with parchment paper.",
      "Chop bell peppers, zucchini, red onions, and any other desired vegetables into uniform bite-sized pieces.",
      "Toss vegetables with olive oil, minced garlic, dried oregano, thyme, salt, and pepper. Spread in a single layer — don't overcrowd.",
      "Roast for 25–30 minutes, flipping halfway through, until vegetables are tender with caramelized edges.",
      "Transfer to a serving platter, scatter with fresh herbs like parsley or basil, and drizzle with a little balsamic glaze.",
    ],
  },
  {
    id: 5,
    name: "Carbonara Classic",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "25 min",
    ingredients: ["Pasta", "Eggs", "Bacon", "Pecorino"],
    dietary: [],
    instructions: [
      "Cook spaghetti in well-salted boiling water until al dente. Reserve at least 1 cup of pasta cooking water before draining.",
      "While pasta cooks, cut guanciale or bacon into small cubes and fry in a skillet over medium heat until crispy. Remove from heat.",
      "Whisk together 2 whole eggs and 2 yolks with finely grated Pecorino Romano. Season generously with black pepper.",
      "Add hot drained pasta to the skillet with the bacon. Toss off the heat, then pour in the egg mixture and quickly toss, adding pasta water a splash at a time to create a glossy, creamy sauce.",
      "Serve immediately in warmed bowls, topped with extra Pecorino and a crack of black pepper.",
    ],
  },
  {
    id: 6,
    name: "Spicy Stir Fry",
    image: "https://images.unsplash.com/photo-1566196163783-c0088b57c92e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "15 min",
    ingredients: ["Chicken", "Vegetables", "Soy Sauce", "Ginger"],
    dietary: ["Dairy-Free"],
    instructions: [
      "Slice chicken breast thinly against the grain. Toss with soy sauce, cornstarch, and a pinch of sugar; marinate for 5 minutes.",
      "Mix the sauce: soy sauce, rice vinegar, chilli paste, fresh ginger, garlic, and a drizzle of sesame oil.",
      "Heat a wok or large skillet over high heat until smoking. Add oil, then stir-fry chicken in batches for 2–3 minutes until golden. Set aside.",
      "In the same wok, stir-fry vegetables (broccoli, peppers, snap peas) for 2 minutes. Return chicken to the pan.",
      "Pour sauce over everything, toss for 1 minute until glossy and fragrant. Serve over steamed rice with sesame seeds.",
    ],
  },
  {
    id: 7,
    name: "Gourmet Ramen Bowl",
    image: "https://images.unsplash.com/photo-1651457157056-f6d076082e5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "40 min",
    ingredients: ["Ramen", "Pork", "Egg", "Green Onions"],
    dietary: ["Dairy-Free"],
    instructions: [
      "Bring broth (chicken or pork bone stock) to a simmer. Season with soy sauce, mirin, and white miso paste. Keep warm on low heat.",
      "Soft-boil eggs: lower into boiling water for exactly 6.5 minutes, then transfer to an ice bath. Peel and marinate in soy sauce and mirin for 15 minutes.",
      "Thinly slice cooked chashu pork (or pan-sear pork belly slices with soy and honey glaze for 3 minutes per side).",
      "Cook ramen noodles per package instructions. Drain and divide between deep bowls.",
      "Ladle hot broth over noodles. Top with pork slices, halved marinated egg, bamboo shoots, nori, and sliced green onions. Add a drizzle of chilli oil.",
    ],
  },
  {
    id: 8,
    name: "Margherita Pizza",
    image: "https://images.unsplash.com/photo-1592320649423-42e6fbac5658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxkZWxpY2lvdXMlMjBmb29kJTIwcmVjaXBlcyUyMG1lYWxzfGVufDF8fHx8MTc3NTE4MDc2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "30 min",
    ingredients: ["Dough", "Tomatoes", "Mozzarella", "Basil"],
    dietary: ["Vegetarian"],
    instructions: [
      "Place a pizza stone or heavy baking sheet in the oven and preheat to its highest setting (at least 500°F / 260°C) for at least 30 minutes.",
      "Stretch pizza dough on a floured surface into a 12-inch round. Transfer to a floured pizza peel or parchment paper.",
      "Crush canned San Marzano tomatoes by hand; season with salt and a drizzle of olive oil. Spread evenly over dough, leaving a 1-inch border.",
      "Tear fresh mozzarella into pieces and scatter over the sauce. Slide pizza onto the hot stone and bake for 8–10 minutes until crust is charred and cheese is bubbling.",
      "Remove from oven, immediately top with fresh basil leaves, and finish with a drizzle of extra-virgin olive oil.",
    ],
  },
  {
    id: 9,
    name: "Grilled Chicken Caesar",
    image: "https://images.unsplash.com/photo-1676300186659-030de568e39a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxncmlsbGVkJTIwY2hpY2tlbiUyMGNhZXNhciUyMHNhbGFkfGVufDF8fHx8MTc3NTcwMjQ4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "25 min",
    ingredients: ["Chicken", "Romaine", "Parmesan", "Croutons"],
    dietary: [],
    instructions: [
      "Pound chicken breasts to an even thickness. Season with olive oil, garlic powder, salt, and pepper. Grill over medium-high heat for 5–6 minutes per side until cooked through.",
      "Let chicken rest 5 minutes before slicing on an angle.",
      "Make the dressing: whisk together mayonnaise, anchovy paste, minced garlic, lemon juice, Worcestershire sauce, and grated Parmesan. Season to taste.",
      "Chop romaine hearts into large pieces. Toss with Caesar dressing until evenly coated.",
      "Divide salad into bowls, top with sliced chicken, crunchy croutons, and shaved Parmesan. Crack extra black pepper over the top.",
    ],
  },
  {
    id: 10,
    name: "Beef Tacos",
    image: "https://images.unsplash.com/photo-1640983743761-4f0e0204bc58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxiZWVmJTIwdGFjb3MlMjBtZXhpY2FufGVufDF8fHx8MTc3NTcwMjQ4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "20 min",
    ingredients: ["Beef", "Tortillas", "Cheese", "Tomatoes", "Onions"],
    dietary: [],
    instructions: [
      "Brown ground beef in a skillet over high heat, breaking it apart. Drain excess fat.",
      "Add taco seasoning (cumin, chilli powder, garlic powder, paprika, salt) and a splash of water. Stir and simmer for 3 minutes.",
      "Warm corn or flour tortillas directly over a gas flame or in a dry skillet for 30 seconds per side.",
      "Dice fresh tomatoes and white onion; finely chop cilantro. Shred cheese and slice jalapeños.",
      "Load tortillas with seasoned beef, then pile on your toppings: cheese, tomatoes, onion, cilantro, and a squeeze of lime.",
    ],
  },
  {
    id: 11,
    name: "Tofu Stir Fry",
    image: "https://images.unsplash.com/photo-1711247355155-873ce02ab092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2Z1JTIwc3RpciUyMGZyeSUyMGFzaWFuJTIwZm9vZHxlbnwxfHx8fDE3NzU3MDI0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "20 min",
    ingredients: ["Tofu", "Rice", "Vegetables", "Soy Sauce"],
    dietary: ["Vegan", "Vegetarian", "Dairy-Free"],
    instructions: [
      "Press firm tofu between paper towels with a heavy weight for 10 minutes to remove excess moisture. Cut into 1-inch cubes.",
      "Cook rice according to package instructions and keep warm.",
      "Heat oil in a non-stick skillet over medium-high. Pan-fry tofu cubes undisturbed for 3–4 minutes per side until golden and crispy.",
      "Push tofu to one side. Add sliced vegetables (bok choy, mushrooms, snap peas) and stir-fry for 3 minutes.",
      "Mix soy sauce, sesame oil, garlic, and ginger into a sauce; pour over tofu and vegetables. Toss everything together and serve over rice.",
    ],
  },
  {
    id: 12,
    name: "Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNocm9vbSUyMHJpc290dG8lMjBmb29kfGVufDF8fHx8MTc3NTY4NTM3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$$",
    time: "45 min",
    ingredients: ["Rice", "Mushrooms", "Parmesan", "Onions"],
    dietary: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "Warm vegetable broth in a saucepan over low heat. In a separate large pan, sauté diced onion in butter and olive oil until translucent.",
      "Add Arborio rice and toast for 2 minutes, stirring, until the edges look translucent. Add a splash of white wine and stir until absorbed.",
      "Add warm broth one ladleful at a time, stirring constantly and waiting until each addition is absorbed before adding the next. This should take about 20 minutes.",
      "Meanwhile, sauté sliced mushrooms (cremini, shiitake, or porcini) separately in butter until golden. Season with thyme and garlic.",
      "Stir mushrooms into the risotto. Remove from heat and vigorously stir in cold butter and grated Parmesan until creamy. Season to taste and serve immediately.",
    ],
  },
  {
    id: 13,
    name: "Egg Fried Rice",
    image: "https://images.unsplash.com/photo-1564834730442-15e1985f2710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxlZ2clMjBmcmllZCUyMHJpY2UlMjBhc2lhbnxlbnwxfHx8fDE3NzU3MDI0ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "15 min",
    ingredients: ["Rice", "Eggs", "Vegetables", "Soy Sauce"],
    dietary: ["Vegetarian", "Dairy-Free"],
    instructions: [
      "Use day-old cooked rice for best results — fresh rice is too moist. Break up any clumps with your hands.",
      "Heat a wok or large skillet over very high heat until smoking. Add oil, then pour in beaten eggs and scramble quickly. Push to the side.",
      "Add frozen peas, corn, and diced carrots. Stir-fry for 1 minute.",
      "Add cold rice and press it into the hot pan. Let it sit for 1 minute to develop a slight crust, then toss everything together.",
      "Season with soy sauce and a drizzle of sesame oil. Stir-fry for another minute. Finish with sliced green onions and white pepper.",
    ],
  },
  {
    id: 14,
    name: "Keto Burger Bowl",
    image: "https://images.unsplash.com/photo-1723861112984-5f9130584e74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXRvJTIwYnVyZ2VyJTIwYm93bCUyMGxvdyUyMGNhcmJ8ZW58MXx8fHwxNzc1NzAyNDgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "25 min",
    ingredients: ["Beef", "Lettuce", "Cheese", "Tomatoes", "Onions"],
    dietary: ["Keto", "Gluten-Free"],
    instructions: [
      "Season ground beef (80/20 blend) with salt, pepper, garlic powder, and Worcestershire sauce. Form into patties slightly larger than your desired serving size.",
      "Heat a cast-iron skillet over high heat until very hot. Cook patties 3–4 minutes per side for medium. Add cheese in the last minute to melt.",
      "While patties cook, slice tomatoes, red onion, and pickles. Shred iceberg or butter lettuce.",
      "Make a quick burger sauce: mix mayonnaise, ketchup (sugar-free), mustard, pickle juice, and paprika.",
      "Build the bowl: lettuce base, burger patty broken into pieces, tomatoes, onions, pickles, and a drizzle of burger sauce.",
    ],
  },
  {
    id: 15,
    name: "Paleo Chicken Bowl",
    image: "https://images.unsplash.com/photo-1629793980444-11a91aa44476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwYWxlbyUyMGNoaWNrZW4lMjBib3dsJTIwaGVhbHRoeXxlbnwxfHx8fDE3NzU3MDI0ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "30 min",
    ingredients: ["Chicken", "Sweet Potato", "Vegetables", "Herbs"],
    dietary: ["Paleo", "Dairy-Free", "Gluten-Free"],
    instructions: [
      "Dice sweet potatoes into 1-inch cubes. Toss with olive oil, paprika, and salt. Roast at 425°F for 20–25 minutes until tender and caramelized.",
      "Season chicken thighs with garlic, cumin, coriander, salt, and pepper. Pan-sear in an oven-safe skillet over medium-high heat for 4 minutes per side.",
      "Transfer skillet to the oven and bake at 400°F for 10 minutes until chicken is cooked through. Rest 5 minutes, then slice.",
      "Blanch or steam broccoli and green beans for 3 minutes until bright green and tender-crisp.",
      "Build bowls with sweet potato, sliced chicken, and greens. Drizzle with a simple herb sauce made from blended avocado, lemon, garlic, and fresh cilantro.",
    ],
  },
  {
    id: 16,
    name: "Vegan Chickpea Curry",
    image: "https://images.unsplash.com/photo-1688923130941-889a41f4439c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdhbiUyMGNoaWNrcGVhJTIwY3VycnklMjBib3dsfGVufDF8fHx8MTc3NTczNTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "35 min",
    ingredients: ["Chickpeas", "Coconut Milk", "Tomatoes", "Spinach", "Spices"],
    dietary: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free"],
    instructions: [
      "Heat oil in a large pot over medium heat. Sauté diced onion for 5 minutes until softened, then add minced garlic and grated ginger for another minute.",
      "Add spices: 2 tsp cumin, 1 tsp turmeric, 1 tsp coriander, 1 tsp garam masala, and chilli flakes to taste. Stir for 1 minute to bloom.",
      "Pour in crushed tomatoes and cook for 5 minutes, stirring occasionally, until the sauce darkens and thickens slightly.",
      "Add drained chickpeas and coconut milk. Bring to a gentle boil, then reduce heat and simmer uncovered for 15 minutes.",
      "Stir in fresh spinach and cook for 2 minutes until wilted. Season with salt and a squeeze of lemon. Serve with basmati rice or flatbread.",
    ],
  },
  {
    id: 17,
    name: "Keto Bacon & Egg Skillet",
    image: "https://images.unsplash.com/photo-1608475861994-cf7af0f0c1be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXRvJTIwYmFjb24lMjBlZ2clMjBza2lsbGV0JTIwYnJlYWtmYXN0fGVufDF8fHx8MTc3NTczNTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "15 min",
    ingredients: ["Eggs", "Bacon", "Spinach", "Avocado"],
    dietary: ["Keto", "Paleo", "Gluten-Free", "Dairy-Free"],
    instructions: [
      "Cook bacon strips in a cast-iron skillet over medium heat until crispy. Transfer to a paper towel-lined plate, leaving 1 tablespoon of drippings in the pan.",
      "Add a large handful of baby spinach to the pan and sauté in the bacon fat for 1 minute until just wilted. Season with salt and pepper.",
      "Create small wells in the spinach and crack eggs directly into them. Cover the skillet and cook for 3–5 minutes depending on desired yolk doneness.",
      "While eggs cook, slice a ripe avocado and season with flaky salt and a squeeze of lime.",
      "Crumble crispy bacon over the eggs, add avocado slices alongside, and serve directly from the skillet.",
    ],
  },
  {
    id: 18,
    name: "Zucchini Pesto Noodles",
    image: "https://images.unsplash.com/photo-1645775372267-c0299feab469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6dWNjaGluaSUyMG5vb2RsZXMlMjBwZXN0byUyMHBhc3RhfGVufDF8fHx8MTc3NTczNTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "20 min",
    ingredients: ["Zucchini", "Basil Pesto", "Cherry Tomatoes", "Pine Nuts", "Parmesan"],
    dietary: ["Vegetarian", "Keto", "Gluten-Free"],
    instructions: [
      "Spiralize 3–4 medium zucchinis into noodles. Lay them on a paper towel and sprinkle lightly with salt; let sit 5 minutes to draw out moisture, then pat dry.",
      "Toast pine nuts in a dry skillet over medium heat for 2–3 minutes, tossing frequently, until golden. Set aside.",
      "Halve cherry tomatoes. Optionally blister them in a hot skillet with a drizzle of olive oil for 2 minutes for extra flavour.",
      "Toss zucchini noodles with pesto, coating evenly. Add cherry tomatoes and gently mix.",
      "Plate the noodles and finish with toasted pine nuts, shaved Parmesan, and cracked black pepper. Serve immediately.",
    ],
  },
  {
    id: 19,
    name: "Paleo Beef & Broccoli",
    image: "https://images.unsplash.com/photo-1760504526069-ff0f8bf6e4ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVmJTIwYnJvY2NvbGklMjBzdGlyJTIwZnJ5JTIwYXNpYW58ZW58MXx8fHwxNzc1NzM1OTEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$",
    time: "25 min",
    ingredients: ["Beef", "Broccoli", "Coconut Aminos", "Garlic", "Sesame"],
    dietary: ["Paleo", "Dairy-Free", "Gluten-Free"],
    instructions: [
      "Thinly slice flank steak against the grain. Marinate in coconut aminos, minced garlic, grated ginger, and sesame oil for 10 minutes.",
      "Blanch broccoli florets in boiling water for 2 minutes, then immediately transfer to an ice bath to preserve their bright green colour.",
      "Mix the sauce: coconut aminos, a little arrowroot starch, beef broth, garlic, and ginger in a small bowl.",
      "Heat a wok over high heat. Sear beef in batches for 1–2 minutes per side until browned. Set aside.",
      "Add broccoli to the wok, pour over the sauce, and bring to a bubble. Return beef and toss to coat. Serve garnished with sesame seeds.",
    ],
  },
  {
    id: 20,
    name: "Red Lentil Soup",
    image: "https://images.unsplash.com/photo-1722239312486-2675eac7cec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW50aWwlMjBzb3VwJTIwYm93bCUyMHZlZ2V0YXJpYW58ZW58MXx8fHwxNzc1NzM1OTEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$",
    time: "40 min",
    ingredients: ["Red Lentils", "Carrots", "Cumin", "Tomatoes", "Onion"],
    dietary: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free"],
    instructions: [
      "Rinse red lentils until the water runs clear. Dice onion, carrots, and celery.",
      "Heat olive oil in a large pot over medium heat. Sauté onion and carrots for 5 minutes until softened. Add garlic, cumin, smoked paprika, and turmeric; cook 1 minute.",
      "Add canned diced tomatoes and stir, scraping up any bits. Cook for 3 minutes.",
      "Add rinsed lentils and 5 cups of vegetable broth. Bring to a boil, then reduce heat and simmer uncovered for 20–25 minutes until lentils are completely tender.",
      "Use an immersion blender to partially blend for a creamy-but-chunky texture. Season with salt, lemon juice, and a drizzle of olive oil. Serve with crusty bread.",
    ],
  },
  {
    id: 21,
    name: "Herb Lamb Chops",
    image: "https://images.unsplash.com/photo-1619711667542-c049700dd9e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1iJTIwaGVyYiUyMGNob3BzJTIwZ3JpbGxlZHxlbnwxfHx8fDE3NzU3MzU5MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cost: "$$$",
    time: "25 min",
    ingredients: ["Lamb", "Rosemary", "Garlic", "Olive Oil", "Lemon"],
    dietary: ["Paleo", "Keto", "Dairy-Free", "Gluten-Free"],
    instructions: [
      "Mix a marinade of minced garlic, finely chopped rosemary, lemon zest, lemon juice, olive oil, salt, and cracked black pepper.",
      "Pat lamb chops dry and coat generously in the herb marinade. Let rest at room temperature for 15 minutes (or up to 2 hours in the fridge).",
      "Heat a heavy cast-iron skillet or grill pan over high heat until very hot. Add a drizzle of oil.",
      "Sear lamb chops for 3 minutes per side for medium-rare (internal temp 135°F / 57°C). For thicker chops, add 1 minute per side.",
      "Transfer to a warm plate, tent loosely with foil, and rest for 5 minutes. Serve with a wedge of lemon and a fresh herb garnish.",
    ],
  },
];

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
    ingredients: [] as string[]
  });
  const [activeTab, setActiveTab] = useState<"home" | "saved" | "grocery" | "profile">("home");

  const filterRecipes = (recipesToFilter: Recipe[]) => {
    return recipesToFilter.filter(recipe => {
      if (filters.budget !== "Any" && recipe.cost !== filters.budget) return false;
      if (filters.dietary.length > 0) {
        const hasAll = filters.dietary.every(d => recipe.dietary?.includes(d));
        if (!hasAll) return false;
      }
      if (filters.ingredients.length > 0) {
        const hasOne = filters.ingredients.some(fi =>
          recipe.ingredients.some(ri => ri.toLowerCase().includes(fi.toLowerCase()))
        );
        if (!hasOne) return false;
      }
      return true;
    });
  };

  const recipes = filterRecipes(allRecipes);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentIndex(0);
  };

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setReviewedCount(prev => prev + 1);
    if (direction === "right" && currentIndex < recipes.length) {
      const savedRecipe = recipes[currentIndex];
      setSavedRecipes([...savedRecipes, savedRecipe]);
      setTimeout(() => setMatchedRecipe(savedRecipe), 300);
    }
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
    }, 200);
  };

  const handleButtonAction = (action: "skip" | "save") => {
    handleSwipe(action === "skip" ? "left" : "right");
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (savedRecipes.length > 0 && savedRecipes[savedRecipes.length - 1].id === recipes[currentIndex - 1].id) {
        setSavedRecipes(savedRecipes.slice(0, -1));
      }
    }
  };

  const handleViewRecipe = () => {
    if (matchedRecipe) setSelectedRecipe(matchedRecipe);
    setMatchedRecipe(null);
  };

  const handleAddToGroceryList = (recipe?: Recipe) => {
    const target = recipe ?? matchedRecipe;
    if (target) {
      const newItems = target.ingredients.filter(i => !groceryList.includes(i));
      setGroceryList([...groceryList, ...newItems]);
      setMatchedRecipe(null);
      setSelectedRecipe(null);
    }
  };

  const handleRemoveSaved = (id: number) => {
    setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== id));
  };

  const handleRemoveGroceryItem = (item: string) => {
    setGroceryList(groceryList.filter(i => i !== item));
  };

  const handleAddGroceryItem = (item: string) => {
    if (!groceryList.includes(item)) setGroceryList([...groceryList, item]);
  };

  const handleClearGroceryList = () => setGroceryList([]);

  const currentRecipe = recipes[currentIndex];
  const hasMoreRecipes = currentIndex < recipes.length;

  const activeFilterCount =
    (filters.budget !== "Any" ? 1 : 0) +
    filters.dietary.length +
    filters.ingredients.length;
  const hasActiveFilters = activeFilterCount > 0;

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
                    <SlidersHorizontal className={`w-5 h-5 ${hasActiveFilters ? "text-white" : "text-gray-700"}`} />
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
                        {recipes.length === 0 ? (
                          <>
                            <h2 className="text-2xl mb-2 text-gray-900">No Matching Recipes</h2>
                            <p className="text-gray-500 mb-6 px-4">No recipes match your current filters. Try adjusting your filters to see more options.</p>
                            <button
                              onClick={() => { setFilters({ budget: "Any", dietary: [], ingredients: [] }); setCurrentIndex(0); }}
                              className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                            >
                              Clear Filters
                            </button>
                          </>
                        ) : (
                          <>
                            <h2 className="text-2xl mb-2 text-gray-900">No More Recipes!</h2>
                            <p className="text-gray-500 mb-6">You've reviewed all available recipes</p>
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