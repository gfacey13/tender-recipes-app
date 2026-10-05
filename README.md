
  # Recipe Discovery App Interface (Copy)

  This is a code bundle for Recipe Discovery App Interface (Copy). The original project is available at https://www.figma.com/design/hqNtWQoX2HRTP6sjAjekrX/Recipe-Discovery-App-Interface--Copy-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Premium recipes on Vercel

Set MEALDB_API_KEY in Vercel Settings → Environment Variables for Production and Preview. Redeploy after saving it. Never use a VITE_ prefix for this key: those variables are public in browser builds.

For local development, copy .env.example to .env.local, enter your key, and restart npm run dev. The Vite server handles /api/meals locally; Vercel serves api/meals.js in deployment. The route combines latest meals and a random selection, deduplicates recipes, and caches results for five minutes. Premium does not provide price or cooking-time data.