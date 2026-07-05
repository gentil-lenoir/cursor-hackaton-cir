# CIR Admin Desktop (official)

Electron desktop app pushed by the admin team. Uses local SQLite for workers, departments, and issues.

## Styling (Tailwind CSS)

Styles live in `src/input.css` and compile to `renderer/tailwind.css`.

```bash
npm run build:css    # one-off build
npm run watch:css    # rebuild on save (dev)
npm start            # builds CSS automatically via prestart
```

Custom brand color: `text-cir-primary` / `#21d4b4`.

Animations use [Motion](https://motion.dev) (Framer Motion's vanilla JS API) via `renderer/motion-bridge.js`.

## Run (Windows / Linux / macOS)

```bash
cd admin
npm install
npm start
```

On Windows, if Electron fails to download, run once:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
node node_modules/electron/install.js
Remove-Item Env:NODE_OPTIONS
npm start
```

## Laravel web admin (real database)

For production-style admin with login and shared Laravel data, run the backend and open:

- URL: `http://localhost:8000/admin`
- Login: `admin2004@gmail.com` / `admin123` (municipal manager from seeder)

```bash
./scripts/start-backend.sh
```

## Note

`Apps/admin_app/` is a separate React prototype. Use this `admin/` folder or the Laravel `/admin` portal for the team's official admin work.
