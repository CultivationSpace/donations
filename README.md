# Cultivation Space Donations

A simple, static web application that processes donation data from a [donations.tsv](web/donations.tsv) file and visualizes it using D3.js. The application provides charts to compare monthly donations against expenses and project year-end trends.

You can see the running application [here](https://cultivationspace.github.io/donations).

## Installation

### Requirements

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)

### Steps

Clone the repository and install dependencies:

```bash
git clone https://github.com/cultivationspace/donations.git
cd donations
npm install
```

## Development

After completing the [installation](#installation) steps, you can run `npm run dev` to start a local development server at [http://localhost:5173](http://localhost:5173). Vite provides hot module replacement, so changes to TypeScript and HTML files are reflected instantly in the browser.

Before committing, run `npm run check` to format, lint, and test the code.

## Scripts

- `npm run build`: Compile and bundle the project into the `dist/` directory.
- `npm run check`: Run format, lint, and tests in sequence.
- `npm run dev`: Start a local Vite development server with hot reloading.
- `npm run format`: Format TypeScript and HTML files using Prettier.
- `npm run lint`: Lint TypeScript files using ESLint.
- `npm run preview`: Serve the production build locally for testing.
- `npm run test`: Run tests using Vitest.
- `npm run upgrade`: Upgrade all dependencies to their latest versions.

## File Structure

```
donations/
├── src/                # Source code (TypeScript)
├── web/
│   ├── index.html      # HTML
│   └── donations.tsv   # TSV file containing donation data
├── .github/            # GitHub workflows and Dependabot config
├── eslint.config.js    # ESLint configuration
├── package.json        # Project metadata and scripts
├── vite.config.ts      # Vite configuration for bundling
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Updating Donation Data

The donation data lives in [`web/donations.tsv`](web/donations.tsv), a tab-separated file with the following columns:

| Column     | Description                             | Example   |
| ---------- | --------------------------------------- | --------- |
| `month`    | Year and month (`YYYY-MM`)              | `2026-02` |
| `donors`   | Number of new donors                    | `3`       |
| `received` | Amount received (€)                     | `1200.00` |
| `pledged`  | Amount pledged but not yet received (€) | `150.00`  |
| `needed`   | Monthly expenses (€)                    | `1487.49` |

To add a new month, append a row at the end. To preview the changes, run:

```bash
npm run dev
```

and open [localhost:5173](http://localhost:5173) in your browser.

Once everything looks correct, commit and push to `main` — the dashboard will update automatically via CI.

## Deployment

Deployment to GitHub Pages is automated via GitHub Actions. Pushing to the `main` branch triggers a workflow that lints, tests, and builds the project, then deploys the `dist/` directory.
