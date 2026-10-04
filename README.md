# SAT-NET 2077 - Cyberpunk Surveillance Earth

A futuristic 3D globe visualization combining live traffic cameras, CCTV feeds, Flock ALPR locations, police tracking, and crime data.

<img width="1280" height="640" alt="image" src="https://github.com/user-attachments/assets/33334040-4f91-4abf-a993-2cd520e10bfc" />

## Features

- **Interactive 3D Globe** - Three.js powered Earth with atmospheric glow
- **Multiple Data Layers**:
  - Traffic cameras (road511.com API)
  - CCTV feeds
  - Flock ALPR camera locations
  - Police unit positions
  - Live crime incident reports
- **Cyberpunk UI** - Neon aesthetics with daisyUI + custom styling
- **Zoom-based Camera Grid** - Camera previews appear when zoomed in

## Setup

### Environment Variables

Create `.env.local`:
```
VITE_ROAD511_API_KEY=your_road511_api_key
VITE_CRIMEOMETER_API_KEY=your_crimeometer_api_key
```

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Data Sources

- **Traffic Cameras**: [road511.com](https://road511.com) - 10,000+ cameras across US/Canada
- **UK Police Data**: [data.police.uk](https://data.police.uk)
- **Crime Data**: [CrimeoMeter](https://crimeometer.com) or local open data portals
- **Flock Cameras**: [DeFlock.me](https://deflock.me) crowdsourced mapping project

## Usage

1. Use mouse to rotate/zoom the globe
2. When zoom level > 3, camera grid appears with live feeds
3. Select region from dropdown to load data for different areas
4. Different colored points indicate:
   - Cyan: Traffic cameras
   - Magenta: CCTV
   - Yellow: Flock ALPR
   - Red: Police units
   - Orange: Crime incidents

## Tech Stack

- React 19 + TypeScript
- Three.js + three-globe
- Tailwind CSS v4 + daisyUI cyberpunk theme
- Vite

## License

MIT - For educational/research purposes only. Respect privacy and terms of service of all data providers.
