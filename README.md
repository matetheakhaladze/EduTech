# EduTech

Do the job before you get the job.

EduTech is a TechSpark 2026 prototype (education theme). Students complete small, real-feeling tasks from companies in different fields, get a score and feedback, and build a portfolio that employers can browse.

Live demo: https://edutech-aoi.pages.dev

## What is in the demo

- **Home**: the idea, how a "shift" works, and the fields you can try
- **Tasks**: 14 sample tasks across 8 fields (web development, design, marketing, data, writing, customer support, finance, engineering)
- **Task page**: brief from a "manager", checklist, timer, submission and feedback
- **Profile**: a demo student with stats, certificates, completed work, activity, skills and badges
- **For employers**: browse candidates by field

The site opens in Georgian and light mode. Use the buttons in the top right to switch to English or dark mode.

All students, companies, scores and certificates are sample data for the demo.

## Files

No build step, no frameworks. Just four files:

| File | What it holds |
|------|---------------|
| `index.html` | The page skeleton: header, main area, footer |
| `style.css` | All styles, light and dark colours, mobile layout |
| `data.js` | All content: fields, tasks, the demo student, candidates |
| `app.js` | Logic: language and theme switch, page views, routing |

### Editing content

Every piece of text in `data.js` is written as `"English|Georgian"`. Change either half and both languages stay in sync. To add a task, copy one object in the `TASKS` list and edit it.

## Run it locally

Open `index.html` in a browser. That is it.

## Deploy

The live site runs on Cloudflare Pages (Direct Upload). To update it, zip the four files and upload the zip as a new deployment of the `edutech` Pages project in the Cloudflare dashboard.
