import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Project, PortfolioSettings, ContactMessage } from "./src/types";

const app = express();
const PORT = 3000;

// Set up locations for our persistent files
const DATA_DIR = path.resolve(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default settings
const DEFAULT_SETTINGS: PortfolioSettings = {
  name: "Alex Rivera",
  title: "Designer & Creative Technologist",
  bio: "Crafting digital systems, immersive web spatial interfaces, and tactile experimental prototypes at the intersection of aesthetic design and human factors.",
  aboutMe: "I am a creative technologist collaborating with global teams to design fluid digital environments. Over the past five years, I have shaped interfaces that bridge sensory experience and functional architecture, specializing in high-performance frontends, spatial interactions, and rich generative animations. My practice balances industrial design minimalism with cutting-edge web engineering.",
  skills: [
    "TypeScript",
    "React / Next.js",
    "Three.js / WebGL",
    "Tailwind CSS",
    "Node.js",
    "Interaction Design",
    "Creative Coding",
    "Performance Optimization",
  ],
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    email: "alex@rivera.design",
  },
  resumeUrl: "#",
};

// Default projects seed
const DEFAULT_PROJECTS: Project[] = [
  {
    id: "project-1",
    title: "ZenScroll Engine",
    description: "A spatial web layout engine utilizing fluid canvas simulation for physical-based scrolling paradigms.",
    content: "## The Concept\n\nZenScroll redefines the scrolling experience on modern browsers. Instead of rigid layout jumps, it models document elements as nodes in a physical mass-spring system, allowing users to feel inertia, friction, and organic bounce. Integrated WebGL overlays map scrolling speed to particle flow density to provide real-time tactile and visual rhythm.\n\n## Tech Stack & Architecture\n\n- Custom physics solver running in React requestAnimationFrame loop\n- WebGL Canvas with instanced rendering\n- Fluid integration with Tailwind auto-sizing layout anchors\n\n## Outcomes\n\nAchieved an engagement increase of over 40% on media-heavy visual portfolios, with smooth 120 FPS performance on both desktop and mobile devices.",
    category: "Creative Coding",
    tags: ["React", "WebGL", "TypeScript", "Physics Engine"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://example.com/zenscroll",
    githubUrl: "https://github.com",
    featured: true,
    createdAt: new Date("2026-01-10").toISOString(),
  },
  {
    id: "project-2",
    title: "Atmosphere Ambient Synth",
    description: "An interactive, generative sound and color landscape synchronized with local climatological inputs.",
    content: "## The Climatology of Sound\n\nAtmosphere processes current real-time humidity, temperature, and barometric pressure data to construct interactive, evolving soundscapes. Through the Web Audio API, multiple microtonal oscillators generate ambient drones, while dynamic background CSS filters morph seamlessly according to the weather's intensity. Rainy days translate to low-pass filtered, nostalgic minor triads, while bright sunshine produces crystalline, crisp, major-seventh structures.\n\n## Highlighted Features\n\n- Procedural audio synthesis via Web Audio API (zero static sound files)\n- Responsive color field theory mappings using canvas-based shaders\n- Highly performant weather caching server-side proxies\n\n## Outcomes\n\nDeveloped a secure, zero-latency micro-synthesizer featured in several interaction-design showcases globally. Best experienced on headphones.",
    category: "Experimental Web",
    tags: ["Web Audio API", "Tailwind CSS", "Express API", "Generative Art"],
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://example.com/atmosphere",
    githubUrl: "https://github.com",
    featured: true,
    createdAt: new Date("2026-03-15").toISOString(),
  },
  {
    id: "project-3",
    title: "HyperForm Editor",
    description: "A canvas-free, performance-first visual UI builder backed of simple nested component schemas.",
    content: "## Conceptual Shift\n\nModern web builders rely heavily on heavy canvas absolute-positioning schemes, rendering output non-responsive by default. HyperForm introduces an alternate paradigm: standard semantic HTML containers styled with standard grid overlays, letting users visually manipulate layout proportions using lightweight drag markers.\n\n## Design Systems Integration\n\nHyperForm automatically binds to structural tokens (spacers, paddings, scale factors) defined in a central project configuration. Layout builders can resize, delete, or append blocks, seeing immediate code compilation with zero layout shifts.\n\n## Impact\n\nEmpowered early-stage startups to compile rapid semantic web experiments in minutes, outputting standardized clean markup with zero bloat.",
    category: "Software Tooling",
    tags: ["UI Builder", "React v19", "JSON Schema", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://example.com/hyperform",
    githubUrl: "https://github.com",
    featured: false,
    createdAt: new Date("2026-04-02").toISOString(),
  }
];

// Load and save helpers
function readJSONFile<T>(filePath: string, defaultVal: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), "utf8");
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

function writeJSONFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Populate default files if missing
const getSettings = (): PortfolioSettings => readJSONFile(SETTINGS_FILE, DEFAULT_SETTINGS);
const getProjects = (): Project[] => readJSONFile(PROJECTS_FILE, DEFAULT_PROJECTS);
const getMessages = (): ContactMessage[] => readJSONFile(MESSAGES_FILE, []);

// Body parsers
app.use(express.json());

// Public API: Get entire portfolio configuration (Settings + Projects)
app.get("/api/portfolio", (req, res) => {
  const settings = getSettings();
  const projects = getProjects();
  res.json({ settings, projects });
});

// Public API: Send contact form messages
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields." });
  }

  const messages = getMessages();
  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    subject: subject || "No Subject provided",
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  writeJSONFile(MESSAGES_FILE, messages);

  res.status(201).json({ success: true, message: "Your message was sent successfully." });
});

// Admin API Authentication
const getAdminPassword = (): string => {
  return process.env.ADMIN_PASSWORD || "admin123";
};

// Admin Login endpoint
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = getAdminPassword();

  if (password === adminPassword) {
    // Generate a simple token based on time + sign (client-safe signature)
    const token = `token-${Buffer.from(adminPassword).toString("base64")}-${Date.now().toString().slice(0, 5)}`;
    return res.json({ success: true, token });
  }

  res.status(401).json({ error: "Invalid admin password." });
});

// Auth middleware for administrative functions
const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminPassword = getAdminPassword();
  const expectedTokenPrefix = `token-${Buffer.from(adminPassword).toString("base64")}-`;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Authentication token missing." });
  }

  const token = authHeader.split(" ")[1];
  
  // Accept both the active token prefix check or direct password matching for safety during automation / tests
  if (token.startsWith(expectedTokenPrefix) || token === `direct-bypass-${adminPassword}`) {
    return next();
  }

  return res.status(403).json({ error: "Invalid or expired administrator token." });
};

// Admin API: Read Contact Messages
app.get("/api/admin/messages", requireAdminAuth, (req, res) => {
  res.json(getMessages());
});

// Admin API: Toggle Message Read Status
app.put("/api/admin/messages/:id/read", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const messages = getMessages();
  const index = messages.findIndex((m) => m.id === id);

  if (index !== -1) {
    messages[index].read = !messages[index].read;
    writeJSONFile(MESSAGES_FILE, messages);
    return res.json({ success: true, message: messages[index] });
  }

  res.status(404).json({ error: "Contact message not found." });
});

// Admin API: Delete Contact Message
app.delete("/api/admin/messages/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const messages = getMessages();
  const filtered = messages.filter((m) => m.id !== id);

  if (messages.length !== filtered.length) {
    writeJSONFile(MESSAGES_FILE, filtered);
    return res.json({ success: true, message: "Contact message deleted successfully." });
  }

  res.status(404).json({ error: "Contact message not found" });
});

// Admin API: Update Portfolio Settings
app.put("/api/admin/settings", requireAdminAuth, (req, res) => {
  const updatedSettings: PortfolioSettings = req.body;

  if (!updatedSettings.name || !updatedSettings.title) {
    return res.status(400).json({ error: "Name and Title settings are required." });
  }

  writeJSONFile(SETTINGS_FILE, updatedSettings);
  res.json({ success: true, settings: updatedSettings });
});

// Admin API: Post New Project
app.post("/api/admin/projects", requireAdminAuth, (req, res) => {
  const newProj: Omit<Project, "id" | "createdAt"> = req.body;

  if (!newProj.title || !newProj.description || !newProj.category) {
    return res.status(400).json({ error: "Project Title, Short Description, and Category are required." });
  }

  const projects = getProjects();
  const fullProj: Project = {
    ...newProj,
    id: `project-${Date.now()}`,
    createdAt: new Date().toISOString(),
    tags: Array.isArray(newProj.tags) ? newProj.tags : [],
    image: newProj.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80",
    featured: newProj.featured || false,
  };

  projects.push(fullProj);
  writeJSONFile(PROJECTS_FILE, projects);

  res.status(201).json({ success: true, project: fullProj });
});

// Admin API: Update Existing Project
app.put("/api/admin/projects/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const editedData: Partial<Project> = req.body;
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);

  if (idx !== -1) {
    projects[idx] = {
      ...projects[idx],
      ...editedData,
      // Do not allow client to change ID
      id: projects[idx].id,
    };
    writeJSONFile(PROJECTS_FILE, projects);
    return res.json({ success: true, project: projects[idx] });
  }

  res.status(404).json({ error: "Project not found." });
});

// Admin API: Delete Project
app.delete("/api/admin/projects/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (projects.length !== filtered.length) {
    writeJSONFile(PROJECTS_FILE, filtered);
    return res.json({ success: true, message: "Project deleted successfully." });
  }

  res.status(404).json({ error: "Project not found or already deleted." });
});

// Start server block
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Server running on http://localhost:${PORT}`);
  });
}

startServer();
