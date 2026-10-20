const DAYS = [
  { key: "monday", label: "Pondelok" },
  { key: "tuesday", label: "Utorok" },
  { key: "wednesday", label: "Streda" },
  { key: "thursday", label: "Štvrtok" },
  { key: "friday", label: "Piatok" },
  { key: "week", label: "Celý týždeň" }
];

const RESTAURANTS = [
  {
    id: "eat-meet",
    name: "Eat & Meet",
    sourceUrl: "https://eatandmeet.sk/",
    localUrl: "data/eatandmeet.html",
    parser: parseEatAndMeet
  },
  {
    id: "mlynska-koliba",
    name: "Mlynská Koliba",
    sourceUrl: "https://mlynskakoliba.sk/#done",
    localUrl: "data/mlynska-koliba.html",
    parser: parseMlynskaKoliba
  },
  {
    id: "riviera",
    name: "Reštaurácia Riviera",
    sourceUrl: "https://restauraciariviera.sk/obedove-menu/",
    localUrl: "data/riviera.html",
    parser: parseRiviera
  }
];

function makeRestaurantMenu(restaurant, days, error = null) {
  return {
    id: restaurant.id,
    name: restaurant.name,
    sourceUrl: restaurant.sourceUrl,
    updatedAt: new Date().toISOString(),
    days,
    error
  };
}

function normalizeDayName(value) {
  const normalized = removeDiacritics(value).toLowerCase();

  if (normalized.includes("pondelok")) return "monday";
  if (normalized.includes("utorok")) return "tuesday";
  if (normalized.includes("streda")) return "wednesday";
  if (normalized.includes("stvrtok")) return "thursday";
  if (normalized.includes("piatok")) return "friday";

  return null;
}

function removeDiacritics(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createHtmlDocument(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

function compactLines(document) {
  return document.body.textContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== "* * *");
}

function emptyDays() {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: []
  };
}

function splitAllergens(text) {
  const match = text.match(/\(([\d,\s]+)\)|A([\d,\s]+)/);
  return match ? (match[1] || match[2]).replace(/\s/g, "") : "";
}

function parsePrice(text) {
  const match = text.match(/\d+[,.]\d{2}\s*€/);
  return match ? match[0].replace(".", ",") : "";
}

function parseRiviera(html, restaurant) {
  const doc = createHtmlDocument(html);
  const lines = compactLines(doc);
  const days = emptyDays();
  let currentDay = null;
  let currentPrice = "";

  lines.forEach((line, index) => {
    const day = normalizeDayName(line);
    if (day) {
      currentDay = day;
      currentPrice = parsePrice(line);
      return;
    }

    if (!currentDay) return;

    const nextLine = lines[index + 1] || "";
    const isNumberedMeal = /^\d+\.\s/.test(line);
    const isSoupLine = index > 0 && /0,25\s*l/i.test(nextLine);

    if (isSoupLine) {
      days[currentDay].push({
        type: "Polievka",
        name: line,
        price: currentPrice,
        weight: "",
        allergens: ""
      });
    }

    if (isNumberedMeal) {
      days[currentDay].push({
        type: `Menu ${line.match(/^\d+/)[0]}`,
        name: line.replace(/^\d+\.\s*/, ""),
        price: currentPrice,
        weight: "",
        allergens: ""
      });
    }
  });

  return makeRestaurantMenu(restaurant, days);
}

function parseMlynskaKoliba(html, restaurant) {
  const doc = createHtmlDocument(html);
  const days = emptyDays();
  const weeklyPrice = [...doc.querySelectorAll("h2")]
    .map((heading) => heading.textContent.trim())
    .find((line) => /A\/B\s*-\s*\d+[,.]\d{2}\s*€/.test(line)) || "";
  const currentPrice = parsePrice(weeklyPrice);

  doc.querySelectorAll("h2").forEach((heading) => {
    const day = normalizeDayName(heading.textContent);
    if (!day) return;

    const content = heading.nextElementSibling;
    if (!content) return;

    content.querySelectorAll("span.p").forEach((part) => {
      const text = part.textContent.replace(/\s+/g, " ").trim();
      const match = text.match(/^(Polievka|MENU\s+[ABC]):\s*(.+)$/);
      if (!match) return;

      days[day].push({
        type: match[1],
        name: match[2].trim(),
        price: currentPrice,
        weight: "",
        allergens: ""
      });
    });
  });

  return makeRestaurantMenu(restaurant, days);
}

function parseEatAndMeet(html, restaurant) {
  const doc = createHtmlDocument(html);
  const days = emptyDays();

  ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach((dayKey, index) => {
    const pane = doc.querySelector(`#day-${index + 1}`);
    if (!pane) return;

    pane.querySelectorAll(".menu-body").forEach((item) => {
      const type = item.querySelector("h4")?.textContent.trim() || "";
      const priceText = item.querySelector(".price")?.textContent.trim() || "";
      const name = item.querySelector(".desc")?.textContent.replace(/\s+/g, " ").trim() || "";

      if (!type || !name) return;

      days[dayKey].push({
      type,
      name: name.replace(/\s*\([\d,\s]+\)\s*$/, ""),
      price: parsePrice(priceText),
      weight: "",
      allergens: ""
      });
    });
  });

  return makeRestaurantMenu(restaurant, days);
}
