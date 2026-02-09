# Cultivation Space Donations

A simple, static web application that processes donation data from a [donations.tsv](web/donations.tsv) file and visualizes it using D3.js. The application provides charts to compare monthly donations against expenses and project year-end trends.

## Demo

You can view a live demo of the application [here](https://cultivationspace.github.io/donations).

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

To maintain consistent coding style, please run `npm run format` before committing.

## Scripts

- `npm run build`: Compile and bundle the project into the `dist/` directory.
- `npm run dev`: Start a local Vite development server with hot reloading.
- `npm run format`: Format TypeScript and HTML files using Prettier.
- `npm run preview`: Serve the production build locally for testing.

## File Structure

```
donations/
├── src/                # Source code (TypeScript)
├── web/
│   ├── index.html      # HTML
│   └── donations.tsv   # TSV file containing donation data
├── .github/            # GitHub workflows for CI/CD
├── package.json        # Project metadata and scripts
├── vite.config.ts      # Vite configuration for bundling
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Deployment

Deployment to GitHub Pages is automated via GitHub Actions. Pushing to the `main` branch triggers a workflow that builds the project and deploys the `dist/` directory.
