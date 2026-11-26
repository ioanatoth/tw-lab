// API Card
// API Name: JokeAPI
// Base URL: https://v2.jokeapi.dev/joke
// Endpoint used: https://v2.jokeapi.dev/joke/Any?safe-mode&contains=...
// HTTP method: GET
// Status code seen: 200
// Fields used: error, id, type, category, joke, setup, delivery, flags
// Relevance: Fits a web technology community portal by providing light, safe-mode developer/general jokes with search and state persistence.
export {};
interface JokeFlags {
    nsfw?: boolean;
    religious?: boolean;
    political?: boolean;
    racist?: boolean;
    sexist?: boolean;
    explicit?: boolean;
  }
  
  interface JokeItem {
    id: number;
    type: "single" | "twopart";
    category: string;
    joke?: string;
    setup?: string;
    delivery?: string;
    flags?: JokeFlags;
  }
  
  interface JokeSearchResponse {
    error: boolean;
    amount?: number;
    jokes?: JokeItem[];
    // Când API-ul întoarce un singur obiect (ex. la /joke/Any fără array), pot fi prezente direct câmpurile glumei:
    id?: number;
    type?: "single" | "twopart";
    category?: string;
    joke?: string;
    setup?: string;
    delivery?: string;
    message?: string;
  }
  
  const BASE_URL = "https://v2.jokeapi.dev/joke/Any";
  
  const statusEl = document.getElementById("status") as HTMLParagraphElement;
  const resultsEl = document.getElementById("results") as HTMLDivElement;
  const searchForm = document.getElementById("searchForm") as HTMLFormElement;
  const queryInput = document.getElementById("queryInput") as HTMLInputElement;
  const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
  
  async function getJSON<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
  
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
  
  function setStatus(text: string): void {
    statusEl.textContent = text;
  }
  
  function formatJokeBody(item: JokeItem): string {
    if (item.type === "twopart") {
      const part1 = item.setup ?? "";
      const part2 = item.delivery ?? "";
      return `${part1} — ${part2}`.trim();
    }
    return item.joke ?? "";
  }
  
  function createCard(item: JokeItem): HTMLElement {
    const card = document.createElement("div");
    card.className = "card";
  
    const title = document.createElement("h3");
    title.textContent = item.category || "Joke";
  
    const body = document.createElement("p");
    body.textContent = formatJokeBody(item);
  
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `ID: ${item.id} • Type: ${item.type}`;
  
    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(meta);
  
    return card;
  }
  
  function render(items: JokeItem[]): void {
    resultsEl.innerHTML = "";
  
    if (items.length === 0) {
      setStatus("No results found.");
      return;
    }
  
    items.forEach((item) => {
      resultsEl.appendChild(createCard(item));
    });
  
    setStatus(`Loaded ${items.length} result(s).`);
  }
  
  function buildURL(query: string): string {
    return `${BASE_URL}?safe-mode&amount=10&contains=${encodeURIComponent(query)}`;
  }
  
  async function search(): Promise<void> {
    const query = queryInput.value.trim();
    if (!query) {
      setStatus("Please enter a search term.");
      return;
    }
  
    searchBtn.disabled = true;
    setStatus("Loading...");
    resultsEl.innerHTML = "";
  
    try {
      const data = await getJSON<JokeSearchResponse>(buildURL(query));
  
      if (data.error) {
        // JokeAPI returnează error: true când nu găsește potriviri pentru "contains"
        render([]);
        localStorage.setItem("lastQuery", query);
        return;
      }
  
      const jokesList: JokeItem[] = Array.isArray(data.jokes)
        ? data.jokes
        : data.id !== undefined && data.type
        ? [
            {
              id: data.id,
              type: data.type,
              category: data.category ?? "Joke",
              joke: data.joke,
              setup: data.setup,
              delivery: data.delivery,
            },
          ]
        : [];
  
      render(jokesList);
      localStorage.setItem("lastQuery", query);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStatus(`Load failed: ${msg}`);
    } finally {
      searchBtn.disabled = false;
    }
  }
  
  searchForm.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    void search();
  });
  
  window.addEventListener("DOMContentLoaded", () => {
    const lastQuery = localStorage.getItem("lastQuery");
    if (lastQuery) {
      queryInput.value = lastQuery;
    }
  });