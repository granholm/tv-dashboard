# Smart Home Dashboard

A 1080p dashboard designed for a Raspberry Pi or equivalent to display a newsfeed, Home Assistant data, weather, energy prices.

<img width="1916" height="1077" alt="image" src="https://github.com/user-attachments/assets/c05ea951-a0eb-47e8-ae72-8d0ad548c2ce" />

## Features

- **News Rotator**: Fetches news from Google RSS (configurable) and rotates through top stories.
- **Weather Widget**: Displays current weather and forecast from Home Assistant (`weather.smhi_home`).
- **Energy Monitor**: Shows current Nordpool electricity price with color coding (Low/Med/High) and a day-view chart.
- **Mock Mode**: Can run without a Home Assistant connection for testing/demo purposes.
- **Dark Mode**: Styled for TV usage (Slate/Gray palette).

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Bun + Express (Acts as a proxy/API gateway)
- **Charts**: Chart.js

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/granholm/tv-dashboard.git
   cd tv-dashboard
   ```

2. Install dependencies (for both server and client):
   ```bash
   bun install-all
   ```

3. Configure Environment:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` to add your Home Assistant URL and Token.
   - Optionally set `MOCK_MODE=true` to test without HA.

## Running

Start both the backend server and frontend client with one command:

```bash
bun run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## License

ISC
