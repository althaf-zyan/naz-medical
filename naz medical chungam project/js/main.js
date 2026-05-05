const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuLinks = document.querySelectorAll("[data-menu] a");
const revealItems = document.querySelectorAll(".reveal, .reveal-card");
const filterButtons = document.querySelectorAll("[data-filter]");
const ADMIN_IMAGE_KEY = "nazMedicalAdminImages";
let galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const floatingWhatsApp = document.querySelector("[data-floating-whatsapp]");
const appointmentForm = document.querySelector("[data-appointment-form]");
let activeGalleryIndex = 0;

function getAdminImages() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_IMAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function latestAdminImage(category) {
  return getAdminImages()
    .filter((image) => image.category === category)
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0];
}

function applyAdminImages() {
  document.querySelectorAll("[data-admin-image]").forEach((imageElement) => {
    const adminImage = latestAdminImage(imageElement.dataset.adminImage);
    if (!adminImage) {
      return;
    }

    imageElement.src = adminImage.dataUrl;
    imageElement.alt = adminImage.caption || imageElement.alt;
    imageElement.style.display = "block";

    const galleryCard = imageElement.closest(".gallery-card");
    if (galleryCard) {
      const caption = galleryCard.querySelector("figcaption");
      caption.textContent = adminImage.caption || caption.textContent;
    }
  });
}

function setHeaderShadow() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function toggleMenu() {
  const isOpen = menu.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

function openLightbox(index) {
  galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
  const card = galleryCards[index];
  const image = card.querySelector("img");
  const caption = card.querySelector("figcaption").textContent;

  activeGalleryIndex = index;
  lightboxImage.src = image.getAttribute("src");
  lightboxImage.alt = image.getAttribute("alt") || caption;
  lightboxCaption.textContent = caption;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function moveLightbox(direction) {
  const visibleCards = galleryCards.filter((card) => !card.classList.contains("is-hidden"));
  const currentCard = galleryCards[activeGalleryIndex];
  const visibleIndex = visibleCards.indexOf(currentCard);
  const nextVisibleIndex = (visibleIndex + direction + visibleCards.length) % visibleCards.length;
  activeGalleryIndex = galleryCards.indexOf(visibleCards[nextVisibleIndex]);
  openLightbox(activeGalleryIndex);
}

function handleAppointmentSubmit(event) {
  event.preventDefault();
  const formData = new FormData(appointmentForm);
  const name = formData.get("name");
  const phone = formData.get("phone");
  const service = formData.get("service");
  const message = formData.get("message") || "No additional message";
  const text = `Hi NAZ Medical Center, I want to book an appointment.%0AName: ${encodeURIComponent(
    name
  )}%0APhone: ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(
    service
  )}%0AMessage: ${encodeURIComponent(message)}`;

  window.open(`https://wa.me/+917594817060?text=${text}`, "_blank", "noopener,noreferrer");
}

applyAdminImages();

menuToggle.addEventListener("click", toggleMenu);
menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("scroll", setHeaderShadow, { passive: true });
setHeaderShadow();

setTimeout(() => {
  floatingWhatsApp.classList.add("is-visible");
}, 2000);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    galleryCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

galleryCards.forEach((card, index) => {
  card.addEventListener("click", () => openLightbox(index));
});

document.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
document.querySelector("[data-lightbox-prev]").addEventListener("click", () => moveLightbox(-1));
document.querySelector("[data-lightbox-next]").addEventListener("click", () => moveLightbox(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    moveLightbox(1);
  }
});

appointmentForm.addEventListener("submit", handleAppointmentSubmit);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item, index) => {
    if (item.classList.contains("reveal-card")) {
      item.style.setProperty("--stagger-delay", `${Math.min(index % 12, 8) * 70}ms`);
    }
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
