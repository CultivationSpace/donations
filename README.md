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

After completing the [installation](#installation) steps, you can run `npm run dev` to start a local development server. This command serves the web application at [http://localhost:8080](http://localhost:8080) and uses Rollup.js in watch mode to automatically rebuild the JavaScript bundle whenever changes are made to the TypeScript files.

To maintain consistent coding style, please run `npm run format` before committing.

## Scripts

- `npm run build`: Compile the TypeScript files and bundle them into a single JavaScript file at `web/charts.js`.
- `npm run dev`: Run a local server, watch for changes in TypeScript files and automatically rebuild.
- `npm run format`: Format TypeScript and HTML files using Prettier.
- `npm run server`: Serve the application locally.

## File Structure

```
donations/
├── src/                # Source code (TypeScript)
├── web/                
│   ├── index.html      # HTML
│   └── donations.tsv   # TSV file containing donation data
├── .github/            # GitHub workflows for CI/CD
├── package.json        # Project metadata and scripts
├── rollup.config.js    # Rollup configuration for bundling
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Deployment

To deploy the application, you can use any static hosting service (e.g., GitHub Pages, Netlify, Vercel). For GitHub Pages:

1. Build the project:
```bash
npm run build
```

2. Push the contents of the `web/` directory to the `gh-pages` branch.
