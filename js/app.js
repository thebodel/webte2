const CACHE_KEY = "webte2-lunch-menu";
const state = {
  selectedDay: getDefaultDay(),
  selectedRestaurants: new Set(RESTAURANTS.map((restaurant) => restaurant.id)),
  menus: []
};

document.addEventListener("DOMContentLoaded", () => {
  renderDayTabs();
  renderRestaurantFilters();
  bindControls();
  loadMenus(false);
});

function bindControls() {
  document.getElementById("refreshButton").addEventListener("click", () => loadMenus(true));
  document.getElementById("clearButton").addEventListener("click", () => {
    localStorage.removeItem(CACHE_KEY);
    state.menus = [];
    renderMenus();
  });
}

async function loadMenus(forceRefresh) {
  const cached = readCache();

  if (!forceRefresh && cached) {
    state.menus = cached.menus;
    renderMenus();
    return;
  }

  toggleLoading(true);

  const menus = await Promise.all(RESTAURANTS.map(loadRestaurantMenu));
  state.menus = menus;
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    date: dayjs().format("YYYY-MM-DD"),
    menus
  }));

  toggleLoading(false);
  renderMenus();
}

async function loadRestaurantMenu(restaurant) {
  try {
    const html = await fetchRestaurantHtml(restaurant);
    return restaurant.parser(html, restaurant);
  } catch (error) {
    return makeRestaurantMenu(restaurant, emptyDays(), "Menu sa nepodarilo načítať.");
  }
}

async function fetchRestaurantHtml(restaurant) {
  const sourceMode = document.getElementById("sourceMode").value;
  const requestUrl = sourceMode === "local" ? restaurant.localUrl : restaurant.sourceUrl;

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function readCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed.date === dayjs().format("YYYY-MM-DD") ? parsed : null;
  } catch {
    return null;
  }
}

function renderDayTabs() {
  const container = document.getElementById("dayTabs");
  container.innerHTML = "";

  DAYS.forEach((day) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn btn-outline-dark ${state.selectedDay === day.key ? "active" : ""}`;
    button.textContent = day.label;
    button.addEventListener("click", () => {
      state.selectedDay = day.key;
      renderDayTabs();
      renderMenus();
    });
    container.append(button);
  });
}

function renderRestaurantFilters() {
  const container = document.getElementById("restaurantFilters");
  container.innerHTML = "";

  RESTAURANTS.forEach((restaurant) => {
    const label = document.createElement("label");
    label.className = "restaurant-filter";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedRestaurants.has(restaurant.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedRestaurants.add(restaurant.id);
      else state.selectedRestaurants.delete(restaurant.id);
      label.classList.toggle("is-checked", checkbox.checked);
      renderMenus();
    });

    if (checkbox.checked) {
      label.classList.add("is-checked");
    }

    const box = document.createElement("span");
    box.className = "checkbox-box";

    label.append(checkbox, restaurant.name);
    label.insertBefore(box, label.childNodes[1]);
    container.append(label);
  });
}

function renderMenus() {
  const output = document.getElementById("menuOutput");
  output.innerHTML = "";

  const visibleMenus = state.menus.filter((menu) => state.selectedRestaurants.has(menu.id));

  if (!visibleMenus.length) {
    output.append(createMessage("Nie sú vybrané žiadne reštaurácie."));
    return;
  }

  visibleMenus.forEach((menu) => {
    output.append(createRestaurantCard(menu));
  });
}

function createRestaurantCard(menu) {
  const article = document.createElement("article");
  article.className = "restaurant-card";

  const title = document.createElement("h2");
  const link = document.createElement("a");
  link.href = menu.sourceUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = menu.name;
  title.append(link);

  const meta = document.createElement("p");
  meta.className = "restaurant-meta";
  meta.textContent = `Aktualizované: ${formatDateTime(menu.updatedAt)}`;

  article.append(title, meta);

  if (menu.error) {
    article.append(createMessage(menu.error));
    return article;
  }

  const dayKeys = state.selectedDay === "week"
    ? DAYS.filter((day) => day.key !== "week").map((day) => day.key)
    : [state.selectedDay];

  dayKeys.forEach((dayKey) => {
    article.append(createDaySection(dayKey, menu.days[dayKey] || []));
  });

  return article;
}

function createDaySection(dayKey, items) {
  const section = document.createElement("section");
  section.className = "menu-day";

  const heading = document.createElement("h3");
  heading.textContent = DAYS.find((day) => day.key === dayKey).label;
  section.append(heading);

  if (!items.length) {
    section.append(createMessage("Menu na tento deň nie je k dispozícii."));
    return section;
  }

  items.forEach((item) => section.append(createMenuItem(item)));
  return section;
}

function createMenuItem(item) {
  const itemElement = document.createElement("div");
  itemElement.className = "menu-item";

  const topLine = document.createElement("div");
  topLine.className = "item-topline";

  const name = document.createElement("span");
  const type = document.createElement("span");
  type.className = "item-type";
  type.textContent = item.type;
  name.append(type, ` ${item.name}`);

  const price = document.createElement("span");
  price.className = "item-price";
  price.textContent = item.price || "";

  topLine.append(name, price);
  itemElement.append(topLine);

  return itemElement;
}

function createMessage(text) {
  const message = document.createElement("p");
  message.className = "message";
  message.textContent = text;
  return message;
}

function toggleLoading(isLoading) {
  document.getElementById("loading").hidden = !isLoading;
}

function getDefaultDay() {
  const currentDay = new Date().getDay();
  const map = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday"
  };

  return map[currentDay] || "monday";
}

function formatDateTime(value) {
  return dayjs(value).format("DD. MM. YYYY HH:mm");
}

