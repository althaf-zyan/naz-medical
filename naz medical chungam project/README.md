# NAZ Medical Center Website

Professional static landing page for NAZ Medical Center in Aluva, Kerala.

## Project Structure

- `index.html` - Main website page with hero, services, gallery, testimonials, contact form, footer, and mobile sticky actions.
- `admin.html` - Browser-based admin panel for image library organization and validation.
- `css/styles.css` - Responsive styling, brand colors, card grids, animations, lightbox, footer, and mobile layouts.
- `css/admin.css` - Admin dashboard layout, login screen, upload controls, and image grid.
- `js/main.js` - Mobile navigation, scroll animations, gallery filters, lightbox controls, floating WhatsApp button, and WhatsApp appointment form.
- `js/admin.js` - Admin authentication, local image library, bulk operations, validation, and statistics.
- `images/` - Logo and future gallery assets.

## Implementation Checklist

- [x] Update business hours across hero, why choose us, contact, footer, and SEO copy.
- [x] Add medium NAZ logo inside the hero section.
- [x] Add male and female doctor profile cards in the hero.
- [x] Clean gallery so it only shows doctor-related photos.
- [x] Keep only Dr. Jameel and Dr. Zulfa in the doctor gallery.
- [x] Preserve mobile-first responsive layout and scroll animations.

## Design Suggestions

- Replace the doctor placeholders with professional portraits named `dr-jameel.jpg` and `dr-zulfa.jpg`.
- Use matching portrait crop style for both doctors so the gallery feels balanced.
- Keep gallery photos doctor-focused; avoid clinic interiors, equipment, and unrelated facility shots.

## Clarification Questions

- Should the doctor cards include qualifications such as MBBS, specialization, or registration details?
- Do you want separate appointment buttons for Dr. Jameel and Dr. Zulfa?
- Should Sunday hours be shown as emergency-only or normal consultation hours?

## Preview

Open `index.html` directly in a browser, or run a local static server from this folder:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173`.

## Image Assets

The logo is expected at `images/naz-logo.png`.

Doctor gallery placeholders currently reference `images/dr-jameel.jpg` and `images/dr-zulfa.jpg`.

## Admin Access

Open `admin.html` from the same local server and log in with the provided admin password.

The admin panel supports Dr. Jameel, Dr. Zulfa, Hero Section, and Gallery categories, bulk select/delete/edit actions, image statistics, and file validation.

Doctor uploads from the admin panel are read by the public website gallery in the same browser. Refresh `index.html` after uploading a doctor photo.

Because this project is static HTML with no backend, admin uploads are stored in the browser's local storage for preview and organization. A production-secure admin that writes files to the live website for all visitors requires a backend, CMS, or hosting service with protected uploads.
