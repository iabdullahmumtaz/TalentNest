# TalentNest

LinkedIn-style job portal with employer dashboards, applicant tracking, and advanced job search.

## Features

- Job search with location, type, and skills filters
- Employer dashboard to post jobs and manage applicants
- Applicant pipeline: applied → reviewing → interview → offered/rejected
- Per-employer application analytics
- Multi-page UI: home, job detail, dashboard, applications, login

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | TypeScript, Node.js, Express, Mongoose |
| Frontend | TypeScript, React, Vite, React Router |
| Auth     | JWT                     |

## Ports

| Service | Port |
|---------|------|
| UI      | 5018 |
| API     | 6018 |

## Quick Start

```bash
cp .env.example .env
cd backend && npm install
cd ../frontend && npm install
```

Terminal 1: `cd backend && npm run dev`  
Terminal 2: `cd frontend && npm run dev`

- **UI:** http://localhost:5018
- **API:** http://localhost:6018

## Project Structure

```
TalentNest/
├── backend/          # Express API
├── frontend/         # React job board
├── docker-compose.yml
└── .env.example
```

## License

MIT
