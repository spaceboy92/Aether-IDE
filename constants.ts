
import { FileNode } from './types';

export const APP_NAME = "Aether";

export const DEFAULT_FILES: FileNode[] = [
  {
    id: '1',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aether Project</title>
    <link rel="stylesheet" href="src/index.css">
    <style>
      /* Fallback if external CSS fails in blob preview */
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: white; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="src/App.js"></script>
</body>
</html>`,
    lastModified: Date.now()
  },
  {
    id: '2',
    name: 'src/index.css',
    language: 'css',
    content: `
:root {
  --bg-color: #0f172a;
  --text-color: #f8fafc;
  --accent-color: #38bdf8;
  --card-bg: #1e293b;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  min-height: 100vh;
  margin: 0;
}

#root {
  width: 100%;
}

.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
}

.main-content {
  padding: 2rem;
  overflow-y: auto;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
h2 { font-size: 1.25rem; font-weight: 600; color: var(--accent-color); margin-bottom: 1rem; }
`,
    lastModified: Date.now()
  },
  {
    id: '3',
    name: 'src/App.js',
    language: 'javascript',
    content: `
const App = () => {
    const root = document.getElementById('root');
    root.innerHTML = \`
        <div class="dashboard">
            <div style="background:#020617; padding:20px; border-right:1px solid #1e293b;">
               <h3 style="color:#38bdf8; font-weight:bold; margin-bottom:20px;">Aether App</h3>
               <div style="opacity:0.7;">Dashboard</div>
               <div style="opacity:0.7;">Settings</div>
            </div>
            <main class="main-content">
                <header style="margin-bottom: 2rem;">
                   <h1>Welcome to Aether</h1>
                   <p style="opacity: 0.7">Your new project is ready.</p>
                </header>
                <div class="card">
                   <h2>Getting Started</h2>
                   <p>Edit src/App.js to change this content. The preview updates automatically.</p>
                </div>
            </main>
        </div>
    \`;
};

App();
`,
    lastModified: Date.now()
  }
];

export const SHOWCASE_BLUEPRINTS = {}; 
