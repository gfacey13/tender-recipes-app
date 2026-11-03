import type { Recipe } from "./RecipeCard";
import { ChefChatIcon } from "./ChefChatIcon";
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { createPortal } from "react-dom";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
type PlannedMeal = { id: number; name: string };
type MealPlan = Record<string, PlannedMeal>;
type PlanChange = { day: string; before?: PlannedMeal; after?: PlannedMeal };

type Message = {
  role: "user" | "assistant";
  text: string;
  recipes?: { recipe: Recipe; found: string[]; extras: number }[];
};
// Embedded mode displays the conversation inside a phone tab.
export function FloatingChatbot({
  embedded = false,
  userId,
  catalog, 
  allRecipes,
  dietary,
  budget,
  onViewRecipe,
}: {
  embedded?: boolean;
  userId: string | null;
  catalog: Recipe[];
  allRecipes: Recipe[];
  dietary: string[];
  budget: string;
  onViewRecipe: (recipe: Recipe) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [planChange, setPlanChange] = useState<PlanChange[] | null>(null);
  const planKey = "tender-recipes:weekly-plan:" + userId;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! Ask me about recipes, ingredients, or cooking.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasStartedReply, setHasStartedReply] = useState(false);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const requestPending = useRef(false);

  // Focus the message input when the window opens.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Keep the latest message and loading indicator visible.
  useEffect(() => {
    const area = messagesRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [messages, isLoading, isOpen, embedded, planChange]);

  function closeChat() {
    setIsOpen(false);
    launcherRef.current?.focus();
  }

  function readPlan(): MealPlan {
    return JSON.parse(localStorage.getItem(planKey) ?? "{}");
  }

  function confirmPlanChange() {
    if (!planChange || !userId) return;

    try {
      const plan = readPlan();
      if (planChange.some(({ day, before }) => plan[day]?.id !== before?.id)) {
        setPlanChange(null);
        setError("The plan changed since the preview. Ask for the change again.");
        return;
      }
      for (const { day, after } of planChange) {
        if (after) plan[day] = after;
        else delete plan[day];
      }
      localStorage.setItem(planKey, JSON.stringify(plan));
      setPlanChange(null);
      setError("");
      setMessages(previous => [...previous, { role: "assistant", text: "Your weekly meal plan was updated." }]);
    } catch {
      setError("Could not save your meal plan on this device. Please try again.");
    }
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    // Prevent empty messages and duplicate requests.
    if (!message || requestPending.current) return;

    // Match whole dish names and aliases from parenthetical catalog titles.
    const normalizeDish = (value: string) =>
      value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const query = " " + normalizeDish(message) + " ";
    const isSwap = /\b(?:substitut\w*|replac\w*|instead|swap\w*|without|allerg\w*|avoid\w*|lactose[- ]free|dairy[- ]free|gluten[- ]free|vegan|vegetarian)\b/i.test(message);
    const namedRecipes = (isSwap ? allRecipes : catalog).filter(recipe => {
      const aliases = [recipe.name, ...recipe.name.split(/[()]/)];
      return aliases.some(alias => {
        const name = normalizeDish(alias);
        return name.length >= 3 && query.includes(" " + name + " ");
      });
    }).slice(0, 3).map(recipe => ({ recipe, found: [], extras: 0 }));

    const showPlan = /^(?:show|view|what(?:'?s| is)(?: (?:on|in))?) (?:me )?my (?:weekly )?meal plan[?.!]*$/i.test(message);
    const remove = /^(?:please )?(?:remove|clear|delete)\b/i.test(message)
      || /^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]+(?:remove|clear|delete)\b/i.test(message);
    const clearAll = /^(?:please )?(?:clear|delete|empty) (?:my |the )?(?:weekly )?meal plan[?.!]*$/i.test(message);
    const planCommand = message.match(/^(?:please )?(?:add|plan|schedule|set|replace|swap|remove|clear)\b/i);
    const day = weekdays.find(value => new RegExp("\\b" + value + "\\b", "i").test(message));
    if (showPlan || remove || clearAll || (planCommand && (day || /\bmeal plan\b/i.test(message)))) {
      if (!userId) {
        setError("Sign in to use your meal plan.");
        return;
      }
      setError("");
      setInput("");
      setPlanChange(null);
      let reply: string;
      try {
        const plan = readPlan();

        const mentionedDays = weekdays.filter(value => new RegExp("\\b" + value + "\\b", "i").test(message));
        // Match the requested replacement after "with" or "to" if two dishes are named.
        const replacement = namedRecipes.length > 1 ? message.match(/\b(?:with|to)\s+(.+)$/i)?.[1] : undefined;
        const replacementQuery = " " + normalizeDish(replacement ?? message) + " ";
        const candidates = namedRecipes.filter(({ recipe }) =>
          [recipe.name, ...recipe.name.split(/[()]/)].some(alias => {
            const name = normalizeDish(alias);
            return name.length >= 3 && replacementQuery.includes(" " + name + " ");
          }));
        if (showPlan) {
          reply = "Weekly meal plan on this device:\n" + weekdays.map(value =>
            value + ": " + (plan[value]?.name ?? "Nothing planned")).join("\n");
        } else if (clearAll) {
          const changes = weekdays.filter(value => plan[value]).map(value => ({ day: value, before: plan[value] }));
          if (changes.length) setPlanChange(changes);
          reply = changes.length ? "Review the meals to remove before clearing your weekly plan." : "Your weekly meal plan is already empty.";
        } else if (remove && !day) {
          const dish = normalizeDish(message.replace(/^(?:please )?(?:remove|clear|delete)\s+/i, ""));
          const matches = weekdays.filter(value => plan[value] && normalizeDish(plan[value].name) === dish);
          if (matches.length === 1) {
            setPlanChange([{ day: matches[0], before: plan[matches[0]] }]);
            reply = "Review the meal to remove before saving.";
          } else {
            reply = "Which day should I clear? Try “Clear Monday.”";
          }
        } else if (!day || mentionedDays.length !== 1) {
          reply = "Which one day should I change? Try “Add Ezme to Monday.”";
        } else if (!remove && candidates.length !== 1) {
          reply = "Which catalog recipe should I put on " + day + "? Try “Add Ezme to " + day + ".”";
        } else {
          const before = plan[day];
          const recipe = candidates[0]?.recipe;
          const after = !remove && recipe ? { id: recipe.id, name: recipe.name } : undefined;
          if (before?.id === after?.id) {
            reply = after ? after.name + " is already planned for " + day + "." : day + " is already empty.";
          } else {
            setPlanChange([{ day, before, after }]);
            reply = "Review the change below before saving it to your weekly plan.";
          }
        }
      } catch {
        reply = "I couldn’t read your meal plan on this device.";
      }
      setMessages(previous => [...previous, { role: "user", text: message }, { role: "assistant", text: reply }]);
      return;
    }

    if (namedRecipes.length && !isSwap) {
      setError("");
      setInput("");
      setMessages(previous => [
        ...previous,
        { role: "user", text: message },
        { role: "assistant", text: "I found this in Tender Recipes. Tap a recipe to see its ingredients and instructions.", recipes: namedRecipes },
      ]);
      return;
    }

    const pantry = message.match(/^(?:what can i (?:cook|make)|(?:find|suggest|recommend)(?: me)? (?:a recipe|recipes)) (?:with|using) (.+?)[?.!]*$/i);
    if (pantry) {
      const normalize = (ingredient: string) => ingredient.toLowerCase().trim()
        .replace(/\btomatoes\b/g, "tomato")
        .replace(/\bpotatoes\b/g, "potato")
        .replace(/\b([a-z]{3,})s\b/g, "$1");
      const requested = [...new Set(pantry[1].split(/\s*(?:,|\band\b)\s*/i).map(normalize).filter(Boolean))];
      const matches = catalog.map(recipe => {
        const ingredients = recipe.ingredients.map(normalize);
        const found = requested.filter(ingredient => ingredients.includes(ingredient));
        return { recipe, found, extras: ingredients.filter(ingredient => !requested.includes(ingredient)).length };
      }).filter(match => match.found.length > 0)
        .sort((a, b) => b.found.length - a.found.length || a.extras - b.extras)
        .slice(0, 3);

      const budgetNote = budget === "Any"
        ? "Recipe costs are unavailable."
        : "Recipe costs are unavailable, so I can’t verify your budget.";
      const text = matches.length
        ? "Here are some matches from Tender Recipes. " + budgetNote
        : "I couldn’t find a catalog recipe matching those ingredients and your current filters. Try another ingredient or adjust your filters.";
      setError("");
      setInput("");
      setMessages(previous => [
        ...previous,
        { role: "user", text: message },
        { role: "assistant", text, recipes: matches },
      ]);
      return;
    }

    requestPending.current = true;
    setIsLoading(true);
    setError("");
    setHasStartedReply(false);
    setInput("");
    setMessages((previous) => [
      ...previous,
      { role: "user", text: message },
    ]);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);

    const matchedDish = namedRecipes.length === 1 ? namedRecipes[0].recipe : undefined;
    const substitution = isSwap ? {
      dietary,
      recipe: matchedDish && {
        name: matchedDish.name,
        ingredients: matchedDish.ingredients.map(name => {
          const amount = matchedDish.ingredientMeasures?.[name.trim().toLowerCase()]?.join(" + ");
          return amount ? amount + " " + name : name;
        }),
      },
    } : undefined;
    let receivedText = false;

    try {
      // Call our server endpoint. The Gemini key stays on the server.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, stream: true, substitution }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "The assistant is unavailable. Please try again.");
      }
      if (!response.body) throw new Error("Streaming is unavailable. Please try again.");

      // Each complete line is one event; a network chunk may contain part of a line.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;
      const handleLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "error") throw new Error(event.message || "The reply was interrupted.");
        if (event.type === "done") completed = true;
        if (event.type === "delta" && typeof event.text === "string" && event.text) {
          const first = !receivedText;
          receivedText = true;
          setHasStartedReply(true);
          setMessages(previous => {
            if (first) return [...previous, { role: "assistant", text: event.text }];
            return previous.map((item, index) => index === previous.length - 1
              ? { ...item, text: item.text + event.text } : item);
          });
        }
      };
      try {
        while (true) {
          const { value, done } = await reader.read();
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
          let newline;
          while ((newline = buffer.indexOf("\n")) !== -1) {
            handleLine(buffer.slice(0, newline));
            buffer = buffer.slice(newline + 1);
          }
          if (done) {
            if (buffer.trim()) handleLine(buffer);
            break;
          }
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      if (!completed || !receivedText) throw new Error("The reply was interrupted. Please try again.");
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name === "AbortError"
          ? "The reply took too long. Please try again."
          : cause instanceof Error ? cause.message : "Could not get a reply. Please try again.",
      );

      // Keep partial replies visible and restore the question for retry.
      controller.abort();
      setInput(message);
    } finally {
      window.clearTimeout(timeout);
      requestPending.current = false;
      setIsLoading(false);
    }
  }

  // Reuse the conversation in the phone tab and floating desktop window.
  const chat = (
    <div

      className={embedded ? "h-full min-h-0 w-full" : "fixed bottom-24 right-[max(1rem,calc(50vw-338px))] z-40"}
    >
      {(embedded || isOpen) && (
        <section
          id="tender-chat"
          aria-labelledby="tender-chat-title"
          onKeyDown={(event) => {
            // Allow keyboard users to close the window with Escape.
            if (!embedded && event.key === "Escape") {
              event.stopPropagation();
              closeChat();
            }
          }}
          className={embedded
            ? "flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
            : "mb-3 flex h-[min(480px,65dvh)] w-[360px] flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-xl"}
        >
          <header className="flex shrink-0 items-center justify-between bg-amber-500 px-4 py-3 text-white">
            <h2 id="tender-chat-title" className="font-semibold">
              Sous Chef
            </h2>

            <button
              type="button"
              onClick={closeChat}
              aria-label="Close chat"
              className={`${embedded ? "hidden" : "flex"} h-11 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2`}
            >
              <X aria-hidden="true" size={22} />
            </button>
          </header>

          {/* Announce new messages to screen readers. */}
          <div
            ref={messagesRef}
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            aria-relevant="additions"
            tabIndex={0}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`w-fit max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-amber-100 text-gray-900"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <span className="sr-only">
                  {message.role === "user" ? "You: " : "Assistant: "}
                </span>
                {message.text}
                {message.recipes?.map(({ recipe, found, extras }) => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => {
                      if (!embedded) closeChat();
                      onViewRecipe(recipe);
                    }}
                    className="mt-2 block min-h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-left hover:bg-amber-50 focus-visible:outline-2"
                  >
                    <span className="block font-semibold text-amber-800">{recipe.name}</span>
                    <span className="block text-xs text-gray-700">
                      {found.length ? <>Uses {found.join(", ")} · {extras} other {extras === 1 ? "ingredient" : "ingredients"}</> : "View recipe"}
                    </span>
                  </button>
                ))}
              </div>
            ))}

            {planChange && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-gray-900">
                {planChange.map(({ day, before, after }) => (
                  <div key={day} className="mb-2">
                    <p className="font-semibold">{day}</p>
                    <p>Current: {before?.name ?? "Nothing planned"}</p>
                    <p>Proposed: {after?.name ?? "Nothing planned"}</p>
                  </div>
                ))}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={confirmPlanChange} className="min-h-11 rounded-lg bg-amber-700 px-3 font-medium text-white">Confirm and save</button>
                  <button type="button" onClick={() => setPlanChange(null)} className="min-h-11 rounded-lg border border-amber-300 px-3">Cancel</button>
                </div>
              </div>
            )}
            {isLoading && (
              <p role="status" className="text-sm text-gray-600">
                {hasStartedReply ? "Writing…" : "Thinking…"}
              </p>
            )}
          </div>


          {/* Show starter questions before the first user message.
              Selecting one fills the input so the user can edit it. */}
          {messages.length === 1 && (
            <div className="flex shrink-0 flex-wrap gap-2 px-4 pb-3">
              {[
                "What can I cook with eggs and tomatoes?",
                "Suggest a quick vegetarian dinner",
                "What can I substitute for butter?",
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    setInput(question);
                    inputRef.current?.focus();
                  }}
                  className="min-h-11 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-gray-900 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Errors stay visible beside the message composer. */}
          {error && (
            <p role="alert" className="px-4 pb-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <form
            onSubmit={sendMessage}
            className="flex shrink-0 gap-2 border-t border-gray-200 p-3"
          >
            <label htmlFor="tender-chat-input" className="sr-only">
              Your cooking question
            </label>

            <input
              ref={inputRef}
              id="tender-chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a cooking question…"
              maxLength={2000}
              readOnly={isLoading}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send aria-hidden="true" size={20} />
            </button>
          </form>
        </section>
      )}

      {/* Launcher remains available when the window is closed. */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (isOpen) closeChat();
          else setIsOpen(true);
        }}
        aria-label={isOpen ? "Close recipe chat" : "Open recipe chat"}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "tender-chat" : undefined}
        className={`${embedded ? "hidden" : "flex"} ml-auto h-[72px] w-[72px] items-center justify-center rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600`}
      >
        {isOpen ? (
          <X aria-hidden="true" />
        ) : (
          <ChefChatIcon width={32} height={32} aria-hidden="true" />
        )}
      </button>
    </div>
  );

  // Phone chat stays inside the tab; desktop chat floats above the page.
  return embedded ? chat : createPortal(chat, document.body);
}