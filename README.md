# Urban Life Simulator

A browser-based, single-player life sim / RPG.

## Quickstart
- Serve the repo as static files (GitHub Pages, Azure Static Web Apps, any static host).
- Open `index.html`.
- Optional: `?engine=websim` to use the WebSim narrator; otherwise local generator runs.

**Controls**
- Top bar: Save, Load, Export, Community, Glass House, Backrooms, Music, Auto, Shop.
- Right panel: Stats with tooltips, Objectives, Wanted stars.
- Sim Log: bottom-right, collapsible.

## Safari Compatibility
- ES5 only: no `?.`, `??`, object spread, or top-level await.
- All imports are relative and case-exact.
- Audio requires user gesture on iOS; an “Enable Audio” gate is shown.

## Deployment
### GitHub Pages
- Settings → Pages → Deploy from branch → `main` / root.
- Ensure `<base href="./">` in `index.html`.

### Azure Static Web Apps
- Add secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
- Use minimal workflow (no build):
  - `app_location: "/"`, `api_location: ""`, `app_artifact_location: ""`.
