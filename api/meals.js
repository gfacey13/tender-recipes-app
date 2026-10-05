export function createMealsHandler({ key, fetchImpl = fetch } = {}) {
  return async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      res.statusCode = 405;
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }
    if (!key) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: "Recipe service is not configured" }));
      return;
    }
    try {
      const responses = await Promise.all(["latest.php", "randomselection.php"].map(async endpoint => {
        const upstream = await fetchImpl(`https://www.themealdb.com/api/json/v2/${encodeURIComponent(key)}/${endpoint}`, { signal: AbortSignal.timeout(12000) });
        if (!upstream.ok) throw new Error("Upstream unavailable");
        const result = await upstream.json();
        if (!Array.isArray(result.meals)) throw new Error("Invalid recipe response");
        return result.meals;
      }));
      const meals = [...new Map(responses.flat().map(meal => [meal.idMeal, meal])).values()];
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.end(JSON.stringify({ meals }));
    } catch {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "Could not load recipes. Please try again." }));
    }
  };
}

export default async function handler(req, res) {
  return createMealsHandler({ key: process.env.MEALDB_API_KEY })(req, res);
}