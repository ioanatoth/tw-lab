const BASE_URL = "https://v2.jokeapi.dev/joke/Any";
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("queryInput");
const searchBtn = document.getElementById("searchBtn");
async function getJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return (await response.json());
    }
    finally {
        clearTimeout(timer);
    }
}
function setStatus(text) {
    statusEl.textContent = text;
}
function formatJokeBody(item) {
    if (item.type === "twopart") {
        const part1 = item.setup ?? "";
        const part2 = item.delivery ?? "";
        return `${part1} — ${part2}`.trim();
    }
    return item.joke ?? "";
}
function createCard(item) {
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
function render(items) {
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
function buildURL(query) {
    return `${BASE_URL}?safe-mode&amount=10&contains=${encodeURIComponent(query)}`;
}
async function search() {
    const query = queryInput.value.trim();
    if (!query) {
        setStatus("Please enter a search term.");
        return;
    }
    searchBtn.disabled = true;
    setStatus("Loading...");
    resultsEl.innerHTML = "";
    try {
        const data = await getJSON(buildURL(query));
        if (data.error) {
            // JokeAPI returnează error: true când nu găsește potriviri pentru "contains"
            render([]);
            localStorage.setItem("lastQuery", query);
            return;
        }
        const jokesList = Array.isArray(data.jokes)
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
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setStatus(`Load failed: ${msg}`);
    }
    finally {
        searchBtn.disabled = false;
    }
}
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    void search();
});
window.addEventListener("DOMContentLoaded", () => {
    const lastQuery = localStorage.getItem("lastQuery");
    if (lastQuery) {
        queryInput.value = lastQuery;
    }
});
export {};
