const apiUrl = "http://127.0.0.1:8000/api/v1/mountains";

const mountainsContainer = document.getElementById("mountains");
const message = document.getElementById("message");
const reloadButton = document.getElementById("reload");

function createPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "image-placeholder";
  placeholder.textContent = "Фото вершини";
  return placeholder;
}

function createCard(mountain) {
  const card = document.createElement("article");
  card.className = "card";

  if (mountain.image && /^https?:\/\//i.test(mountain.image)) {
    const image = document.createElement("img");
    image.className = "card-image";
    image.src = mountain.image;
    image.alt = mountain.name;
    image.loading = "lazy";

    image.addEventListener("error", function () {
      image.replaceWith(createPlaceholder());
    });

    card.appendChild(image);
  } else {
    card.appendChild(createPlaceholder());
  }

  const content = document.createElement("div");
  content.className = "card-content";

  const name = document.createElement("h2");
  name.textContent = mountain.name;

  const height = document.createElement("p");
  height.className = "height";
  height.textContent = `${mountain.height} м`;

  const description = document.createElement("p");
  description.className = "description";
  description.textContent = mountain.description;

  content.append(name, height, description);
  card.appendChild(content);

  return card;
}

async function loadMountains() {
  reloadButton.disabled = true;
  mountainsContainer.replaceChildren();
  message.className = "";
  message.textContent = "Завантажуємо гори…";

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const mountains = await response.json();

    if (!Array.isArray(mountains)) {
      throw new Error("Сервер повернув неправильний формат даних.");
    }

    if (mountains.length === 0) {
      message.textContent = "Поки що немає доданих гір.";
      return;
    }

    mountains.forEach(function (mountain) {
      mountainsContainer.appendChild(createCard(mountain));
    });

    message.textContent = `Знайдено гір: ${mountains.length}`;
  } catch (error) {
    message.className = "error";
    message.textContent =
      "Не вдалося завантажити гори. Спробуйте оновити сторінку.";
    console.error("Помилка завантаження гір:", error);
  } finally {
    reloadButton.disabled = false;
  }
}

reloadButton.addEventListener("click", loadMountains);
loadMountains();