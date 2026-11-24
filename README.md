# EduTech

Do the job before you get the job.

EduTech is a TechSpark 2026 prototype (education theme). School students anywhere in Georgia complete small, real-feeling tasks from companies in different fields, get a score and feedback from a reviewer, and build a portfolio that employers can browse.

Live demo: https://edutech-aoi.pages.dev

## What works in the demo

The whole loop works, in one browser, with no server:

1. **Sign up** as a student (name, school, city, grade), or press **Try the demo account** to load Luka, a student with 9 scored shifts.
2. **Do a shift**: punch in (a real timer starts), tick the checklist, write the answer, submit. The draft is saved as you type.
3. **Answer one follow-up question** from the "manager" about your own answer, in about two minutes, with pasting switched off.
4. **Review desk**: a person scores the work by hand on three things (checklist 40, quality 40, communication 20) and writes feedback.
5. **Profile**: stats, skills, badges, activity and certificates are all calculated from the scored work. Two scored shifts in one field with an average of 70 or more give a certificate with an ID.
6. **For employers**: browse candidates, invite a student (the invite shows up on their profile), verify a certificate ID, and post a new task that appears on the task board.

The site opens in Georgian and light mode. Use the buttons in the top right to switch to English or dark mode.

The companies and the sample candidates are made up. Everything a visitor creates is saved only in that browser (localStorage), so a phone and a laptop do not see each other's data.

## How we handle "the student just asked an AI"

There is no AI detector. Instead the reviewer and the employer see how the work was done:

- **Follow-up question**: after submitting, the student explains one part of their own answer in their own words, on a short clock, without paste.
- **Work trace**: time taken, share typed vs pasted, how many times the student left the tab. It is shown, not judged automatically.
- **Personal numbers**: tasks with numbers (sales, survey, budget) give every student slightly different numbers, so answers cannot be passed around.
- **Done in class**: the reviewer can mark a shift as supervised by a teacher.
- **The score is a filter, not the hiring decision**: the last step is a paid trial task or an interview with the employer.

## Files

No build step, no frameworks. Five files:

| File | What it holds |
|------|---------------|
| `index.html` | The page skeleton: header, main area, footer |
| `style.css` | All styles, light and dark colours, mobile and print layout |
| `data.js` | All content: fields, tasks, certificates, follow-up questions, the demo student, sample candidates |
| `app.js` | Logic: saved data, page views, the shift flow, profile numbers, routing |
| `review.js` | **Temporary.** The Review desk, where all grading is done by hand |

### Grading (`review.js`)

Nothing is scored automatically. On the Review desk a person types the three scores and the feedback. Two helpers are there if wanted:

- Each submission has a ready text to paste into any AI chat for a second opinion. The person still types the final score.
- **Download submissions** saves a JSON file. Fill in the `g` part of each submission (`c` 0-40, `q` 0-40, `m` 0-20, `fb` feedback, `by` reviewer name) and bring it back with **Load graded file**. This is how to grade on another computer.

When real grading is built, delete `review.js`, its `<script>` line in `index.html` and the "Review desk" link in `app.js`.

### Editing content

Every piece of text in `data.js` is written as `"English|Georgian"`. Change either half and both languages stay in sync. To add a task, copy one object in the `TASKS` list and edit it.

To give a task personal numbers, add `nums:[[base,spread,step],...]` and write `{0}`, `{1}`... in the brief where the numbers go (`{+}` is their sum).

## Run it locally

Open `index.html` in a browser. That is it.

## Deploy

The live site runs on Cloudflare Pages (Direct Upload). To update it, zip the five files (`index.html`, `style.css`, `data.js`, `app.js`, `review.js`) and upload the zip as a new deployment of the `edutech` Pages project in the Cloudflare dashboard.
