import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type UsdaNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  unitName?: string;
  value?: number;
};

type UsdaFood = {
  fdcId: number;
  description: string;
  dataType?: string;
  foodNutrients?: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
};

function getNutrient(
  nutrients: UsdaNutrient[],
  id: number,
  unit: string
) {
  const nutrient = nutrients.find(
    (n) => n.nutrientId === id
  );

  const value =
    typeof nutrient?.value === "number" &&
    Number.isFinite(nutrient.value)
      ? nutrient.value
      : null;

  return {
    value,
    unit,
  };
}

export default {
  fetch: withSupabase(
    { auth: "publishable" },
    async (req) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }

      let body: unknown;

      try {
        body = await req.json();
      } catch {
        return Response.json(
          { error: "Invalid JSON body" },
          { status: 400 }
        );
      }

      const ingredient =
        body !== null &&
        typeof body === "object" &&
        "ingredient" in body
          ? body.ingredient
          : undefined;

      if (
        typeof ingredient !== "string" ||
        !ingredient.trim() ||
        ingredient.length > 100
      ) {
        return Response.json(
          { error: "Enter a valid ingredient" },
          { status: 400 }
        );
      }

      const searchTerm = ingredient.trim();
      const apiKey = Deno.env.get("USDA_API_KEY");

      if (!apiKey) {
        return Response.json(
          { error: "USDA API key not configured" },
          { status: 500 }
        );
      }

      try {
        const url = new URL(
          "https://api.nal.usda.gov/fdc/v1/foods/search"
        );

        url.searchParams.set("api_key", apiKey);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchTerm,
            pageSize: 10,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          console.error(
            "USDA request failed:",
            response.status
          );

          return Response.json(
            { error: "Nutrition provider unavailable" },
            { status: 502 }
          );
        }

        const data = await response.json();

        const foods: UsdaFood[] = Array.isArray(data.foods)
          ? data.foods
          : [];

        const results = foods.map((food) => {
          const nutrients = food.foodNutrients ?? [];

          const hasPer100gBasis = [
            "Branded",
            "Foundation",
            "SR Legacy",
            "Survey (FNDDS)",
          ].includes(food.dataType ?? "");

          return {
            source: "USDA FoodData Central",
            sourceId: food.fdcId,
            name: food.description,
            dataType: food.dataType ?? null,

            nutrientBasis: hasPer100gBasis
              ? {
                  amount: 100,
                  unit: "g",
                }
              : null,

            servingSize:
              typeof food.servingSize === "number"
                ? food.servingSize
                : null,

            servingSizeUnit:
              food.servingSizeUnit ?? null,

            servingDescription:
              food.householdServingFullText ?? null,

            nutrients: {
              calories: getNutrient(
                nutrients,
                1008,
                "kcal"
              ),
              protein: getNutrient(
                nutrients,
                1003,
                "g"
              ),
              fat: getNutrient(
                nutrients,
                1004,
                "g"
              ),
              carbohydrates: getNutrient(
                nutrients,
                1005,
                "g"
              ),
              fiber: getNutrient(
                nutrients,
                1079,
                "g"
              ),
              sodium: getNutrient(
                nutrients,
                1093,
                "mg"
              ),
            },
          };
        });

        return Response.json({
          ingredient: searchTerm,
          count: results.length,
          results,
        });
      } catch (error) {
        console.error(
          "Nutrition search failed:",
          error
        );

        return Response.json(
          {
            error: "Unable to retrieve nutrition data",
          },
          { status: 502 }
        );
      }
    }
  ),
};
