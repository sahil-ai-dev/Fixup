# Fixup

Fixup is a responsive, static frontend concept for a location-based device-repair marketplace. It is built with HTML, CSS and vanilla JavaScript. No backend is required for the local demo.

> **Demo notice:** Accounts, mechanics, distances, requests, bookings, notifications and payments are simulated in the browser. The app does not contact real repair professionals, send SMS, track live locations, process money or provide production authentication.

## Run locally

From the project directory, start Python's built-in static server:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open [http://localhost:8000](http://localhost:8000). Python 3 is required. Stop the server with `Ctrl+C`.

The site uses ordinary `.html` links and can also be hosted as static files.

## Main pages

- `index.html` — homepage, service categories, demo mechanic cards, how-it-works, FAQ and trust information.
- `login.html`, `signup.html` — customer/mechanic demo login and simulated signup.
- `services.html`, `about.html` — services and product concept.
- `user/` — customer dashboard, repair request and mechanic selection, booking confirmation, repair status, payments, profile and support.
- `mechanic/` — existing mechanic dashboard plus request management, active/completed repairs, demo earnings, payments, profile, sample reviews, membership and support.
- `admin/dashboard.html` — existing frontend-only admin demonstration.
- `css/` — shared variables, base styles and the static site's responsive styles.
- `js/config.js`, `js/storage.js`, `js/site.js` — central brand/demo configuration, seeded demo records and page interactions.

## Demo accounts

On the login page select the matching role and use:

| Role | Mobile | Password |
|---|---|---|
| Customer | `9876543210` | `Demo@123` |
| Mechanic | `9988776655` | `Demo@123` |

Use the **Open admin demo dashboard** link on the login page for the seeded admin view. It is not a production admin sign-in.

Signup checks the entered password for length and confirmation, then discards it instead of saving it. Newly created demo accounts can use `Demo@123` to re-enter. The OTP is simulated (`123456`); no SMS is sent. Mechanic membership checkout is also simulated at ₹299 per 30 days.

## Demo data and reset

The project seeds sample users, mechanics, requests, bookings, transactions, reviews, complaints and notifications. Browser demo state is stored in `localStorage` using the `fixup_` prefix. Theme, profile fields, demo bookings, transaction entries, support requests and notification read state persist across refreshes.

Use **Reset demo data** on login or in a dashboard to clear local demo state and restore the initial examples. Do not enter real passwords, bank details, card data, or sensitive personal information.

## Features

- Light/dark theme preference saved locally.
- Responsive layouts and mobile dashboard navigation.
- Client-side form checks for Indian mobile numbers, PIN codes, email and uploaded image type/size.
- Manual service-area entry; browser location permission is requested only after the user chooses the location action.
- Search/filter/sort for sample mechanic profiles.
- Demo booking and transaction creation without card or bank fields.
- Repair status updates, mechanic request responses and profile editing.
- Local support complaint creation, notification read controls, print-to-PDF receipt action and demo reset.
- Accessible labels, semantic landmarks, focus styles and reduced-motion support.

## Deployment

Upload the project files to any static host, including Netlify, Vercel or GitHub Pages. No build step or environment variables are required. Keep the existing directory structure so relative page, CSS and JavaScript paths continue to work. A static host must serve `index.html` at the site root.

## Backend integrations needed for production

Production use requires a backend for authentication and authorization, phone/OTP delivery, provider onboarding and verification, genuine geospatial matching, provider notifications, booking lifecycle coordination, customer support, securely processed payments and subscription validation. A production privacy policy, terms, operational contact information and data retention rules must also be supplied. Client-side checks and localStorage are not security controls.
