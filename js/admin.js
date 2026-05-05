const PASSWORD_HASH = "80a92cb9028fe33a31ca0d08055612942600b29e52ccbf14fc02350b778df737";
const STORAGE_KEY = "nazMedicalAdminImages";
const SESSION_KEY = "nazMedicalAdminSession";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const uploadForm = document.querySelector("[data-upload-form]");
const validationLog = document.querySelector("[data-validation-log]");
const imageGrid = document.querySelector("[data-image-grid]");
const imageTemplate = document.querySelector("[data-image-template]");
const emptyState = document.querySelector("[data-empty-state]");
const filterCategory = document.querySelector("[data-filter-category]");
const selectVisibleButton = document.querySelector("[data-select-visible]");
const selectionCount = document.querySelector("[data-selection-count]");
const bulkCategory = document.querySelector("[data-bulk-category]");
const bulkCaption = document.querySelector("[data-bulk-caption]");
const bulkEditButton = document.querySelector("[data-bulk-edit]");
const bulkDeleteButton = document.querySelector("[data-bulk-delete]");
const logoutButton = document.querySelector("[data-logout]");

let images = loadImages();
let selectedIds = new Set();

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function loadImages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveImages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

function categoryLabel(category) {
  return {
    "doctor-male": "Dr. Jameel - Male Doctor",
    "doctor-female": "Dr. Zulfa - Female Doctor",
    hero: "Hero Section",
    gallery: "Gallery",
  }[category];
}

function showDashboard() {
  loginPanel.classList.add("is-hidden");
  dashboard.classList.remove("is-hidden");
  renderImages();
}

function requireLogin() {
  if (sessionStorage.getItem(SESSION_KEY) === "active") {
    showDashboard();
  }
}

function sanitizeText(value) {
  return value.replace(/[<>]/g, "").trim();
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getVisibleImages() {
  const filter = filterCategory.value;
  return images.filter((image) => filter === "all" || image.category === filter);
}

function updateStats() {
  const maleCount = images.filter((image) => image.category === "doctor-male").length;
  const femaleCount = images.filter((image) => image.category === "doctor-female").length;
  const publicCount = images.filter((image) => ["hero", "gallery"].includes(image.category)).length;

  document.querySelector("[data-stat-total]").textContent = images.length;
  document.querySelector("[data-stat-male]").textContent = maleCount;
  document.querySelector("[data-stat-female]").textContent = femaleCount;
  document.querySelector("[data-stat-public]").textContent = publicCount;
}

function updateSelectionCount() {
  selectionCount.textContent = `${selectedIds.size} selected`;
}

function renderImages() {
  imageGrid.innerHTML = "";
  const visibleImages = getVisibleImages();
  emptyState.classList.toggle("is-hidden", visibleImages.length > 0);

  visibleImages.forEach((image) => {
    const node = imageTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector("input[type='checkbox']");
    const preview = node.querySelector("img");
    const captionInput = node.querySelector(".caption-input");
    const categoryInput = node.querySelector(".category-input");
    const detail = node.querySelector("small");

    checkbox.checked = selectedIds.has(image.id);
    preview.src = image.dataUrl;
    preview.alt = image.caption || image.name;
    captionInput.value = image.caption;
    categoryInput.value = image.category;
    detail.textContent = `${categoryLabel(image.category)} • ${image.name} • ${formatBytes(
      image.size
    )}`;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedIds.add(image.id);
      } else {
        selectedIds.delete(image.id);
      }
      updateSelectionCount();
    });

    node.querySelector("[data-save-card]").addEventListener("click", () => {
      image.caption = sanitizeText(captionInput.value);
      image.category = categoryInput.value;
      saveImages();
      renderImages();
    });

    node.querySelector("[data-delete-card]").addEventListener("click", () => {
      images = images.filter((item) => item.id !== image.id);
      selectedIds.delete(image.id);
      saveImages();
      renderImages();
    });

    imageGrid.appendChild(node);
  });

  updateStats();
  updateSelectionCount();
}

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File is larger than 5MB.";
  }

  if (/[<>:"|?*]/.test(file.name)) {
    return "Filename contains unsafe characters.";
  }

  return "";
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get("password");
  const hash = await sha256(password);

  if (hash !== PASSWORD_HASH) {
    loginMessage.textContent = "Invalid password.";
    return;
  }

  sessionStorage.setItem(SESSION_KEY, "active");
  loginForm.reset();
  loginMessage.textContent = "";
  showDashboard();
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(uploadForm);
  const files = Array.from(formData.getAll("images")).filter((file) => file.size > 0);
  const category = formData.get("category");
  const caption = sanitizeText(formData.get("caption") || "");
  const messages = [];

  for (const file of files) {
    const validationError = validateFile(file);
    if (validationError) {
      messages.push(`${file.name}: ${validationError}`);
      continue;
    }

    const dataUrl = await readFile(file);
    images.unshift({
      id: crypto.randomUUID(),
      name: sanitizeText(file.name),
      caption: caption || file.name.replace(/\.[^.]+$/, ""),
      category,
      type: file.type,
      size: file.size,
      dataUrl,
      createdAt: new Date().toISOString(),
    });
  }

  saveImages();
  uploadForm.reset();
  validationLog.textContent = messages.length
    ? messages.join(" ")
    : "Upload complete. Open or refresh the website gallery to see the photo.";
  validationLog.style.color = messages.length ? "#dc2626" : "#0f7f69";
  renderImages();
});

filterCategory.addEventListener("change", renderImages);

selectVisibleButton.addEventListener("click", () => {
  getVisibleImages().forEach((image) => selectedIds.add(image.id));
  renderImages();
});

bulkEditButton.addEventListener("click", () => {
  const nextCategory = bulkCategory.value;
  const nextCaption = sanitizeText(bulkCaption.value);

  images = images.map((image) => {
    if (!selectedIds.has(image.id)) {
      return image;
    }

    return {
      ...image,
      category: nextCategory || image.category,
      caption: nextCaption || image.caption,
    };
  });

  bulkCategory.value = "";
  bulkCaption.value = "";
  saveImages();
  renderImages();
});

bulkDeleteButton.addEventListener("click", () => {
  images = images.filter((image) => !selectedIds.has(image.id));
  selectedIds.clear();
  saveImages();
  renderImages();
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  dashboard.classList.add("is-hidden");
  loginPanel.classList.remove("is-hidden");
});

requireLogin();
