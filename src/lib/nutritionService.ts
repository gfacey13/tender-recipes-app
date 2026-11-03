
import { supabase } from "./supabase";

export type NutrientValue = {
  value: number | null;
  unit: string;
};

export type NutritionResult = {
  source: string;
  sourceId: number;
  name: string;
  dataType: string | null;
  nutrientBasis: {
    amount: number;
    unit: string;
  } | null;
  servingSize: number | null;
  servingSizeUnit: string | null;
  servingDescription: string | null;
  nutrients: {
    calories: NutrientValue;
    protein: NutrientValue;
    fat: NutrientValue;
    carbohydrates: NutrientValue;
    fiber: NutrientValue;
    sodium: NutrientValue;
  };
};

type NutritionSearchResponse = {
  ingredient: string;
  count: number;
  results: NutritionResult[];
};

export async function searchNutrition(
  ingredient: string
): Promise<NutritionSearchResponse> {
  if (!ingredient.trim()) {
    throw new Error("Please enter an ingredient.");
  }

  const { data, error } =
    await supabase.functions.invoke<NutritionSearchResponse>(
      "nutrition-search",
      {
        body: { ingredient: ingredient.trim() },
      }
    );

  if (error) {
    console.error("Nutrition search failed:", error);
    throw new Error("Unable to search nutritional information.");
  }

  if (!data) {
    throw new Error("No response from nutrition database.");
  }

  return data;
}
