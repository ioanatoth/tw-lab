// API Card
// API Name: Open Library Search API
// Base URL: https://openlibrary.org
// Endpoint used: https://openlibrary.org/search.json?q=...
// HTTP method: GET
// Status code seen: 200
// Fields used: key, title, author_name, first_publish_year
// Relevance: Fits a web technology community portal by allowing students to search programming and web development books.

interface BookDoc {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
  }
  
  interface OpenLibrarySearchResponse {
    docs: BookDoc[];
  }
  
  const BASE_URL = "https://openlibrary.org/search.json";
  const SEARCH_PARAM = "q";
  
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
  
  function createCard(book: BookDoc): HTMLElement {
    const card = document.createElement("div");
    card.className = "card";
  
    const title = document.createElement("h3");
    title.textContent = book.title || "Untitled";
  
    const author = document.createElement("p");
    const authorsText =
      book.author_name && book.author_name.length > 0
        ? book.author_name.join(", ")
        : "Unknown author";
    author.textContent = `Author: ${authorsText}`;
  
    const year = document.createElement("p");
    year.textContent = book.first_publish_year
      ? `First published: ${book.first_publish_year}`
      : "Year: N/A";
  
    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(year);
  
    return card;
  }
  
  function render(items: BookDoc[]): void {
    resultsEl.innerHTML = "";
  
    if (items.length === 0) {
      setStatus("No results found.");
      return;
    }
  
    items.slice(0, 12).forEach((item) => {
      resultsEl.appendChild(createCard(item));
    });
  
    setStatus(`Loaded ${Math.min(items.length, 12)} result(s).`);
  }
  
  function buildURL(query: string): string {
    return `${BASE_URL}?${SEARCH_PARAM}=${encodeURIComponent(query)}`;
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
      const data = await getJSON<OpenLibrarySearchResponse>(buildURL(query));
      render(data.docs || []);
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