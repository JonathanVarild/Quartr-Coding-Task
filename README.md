# SEC Filings Explorer

A small full-stack application for searching SEC filings by company ticker. It uses React and Vite for the frontend, Bun and Elysia for the API, and shared TypeScript response types.

## Features

- Search SEC submissions using company tickers.
- Retrieve the complete filing history referenced by the SEC submissions data.
- Filter by one or more filing forms and by filing date.
- Sort results by newest or oldest filing date.
- Navigate results with direct page controls or a page-number input.
- Expand a filing to inspect its full normalized data and SEC document link.
- View form counts from the latest 12 months and the latest 10-K date.

## Requirements

- Node.js with npm
- [Bun](https://bun.sh/) for the backend

## Setup

Install dependencies:

```sh
npm install
```

Start the frontend and backend in watch mode:

```sh
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`.

## API

### `GET /companies/:ticker/filings`

Returns a filtered, sorted, and paginated list from the company's complete SEC filing history.

| Query parameter | Description |
| --- | --- |
| `page` | One-based page number. Defaults to `1`. |
| `sortOrder` | `desc` for newest first or `asc` for oldest first. |
| `formTypeFilter` | Filing form to include. Repeat the parameter to select multiple forms. |
| `from` | Optional inclusive filing date in `YYYY-MM-DD` format. |
| `to` | Optional inclusive filing date in `YYYY-MM-DD` format. |

Example:

```text
GET /companies/AAPL/filings?page=1&sortOrder=desc&formTypeFilter=10-K&formTypeFilter=10-Q
```

### `GET /filings/summary`

Accepts one or more repeated `tickers` parameters. For each company it returns its CIK, filing counts grouped by `form` over the latest 12 months, and the latest 10-K filing date.

```text
GET /filings/summary?tickers=AAPL&tickers=MSFT
```

### `GET /companies/:ticker/forms`

Returns only the distinct form names needed by the frontend filter dropdown. Unlike the summary endpoint, these options cover the company's complete filing history and are not restricted to the latest 12 months.

```text
GET /companies/AAPL/forms
```

## Commands

- `npm run dev` starts the frontend and backend in watch mode.
- `npm run dev:frontend` starts only the frontend.
- `npm run dev:backend` starts only the backend.
- `npm run typecheck` checks the frontend and backend TypeScript projects.
- `npm run build` builds both applications.
- `npm run build:frontend` builds the frontend into `frontend/dist`.
- `npm run build:backend` builds the backend into `backend/dist`.
- `npm run preview:frontend` previews the built frontend.
- `npm run start` runs the built backend.

## Project structure

```text
frontend/src/components/  UI components
frontend/src/hooks/       Filing explorer state and requests
frontend/src/utils/       API client, formatting, and local types
backend/routes/           Elysia route definitions
backend/services/         SEC requests, rate limiting, history caching, and normalization
shared/                   Types shared by the frontend and backend
```

## AI assistance

The AI prompts used during development are documented in [AI-prompts.md](./AI-prompts.md).

## Notes

Implementation notes are documented in [NOTES.md](./NOTES.md).

## Time spent

The task was capped at four hours, and I spent just about that: approximately three hours on the initial backend and frontend implementation, followed by one hour of refactoring, cleanup, and finalization. I later spent about 20 additional minutes fixing the full filing history, caching, and related issues.
