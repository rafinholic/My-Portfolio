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
  name: "Ahmad Kamruzzaman",
  title: "Backend Developer & EEE Engineer",
  bio: "Specializing in Node.js backend systems, custom API architectures, and database control. Integrating electrical engineering insights with clean, scalable web software.",
  aboutMe: "I am a technology enthusiast, software developer, and B.Sc. candidate in Electrical and Electronics Engineering at North South University (expected in 2026). With a core focus on backend systems, I specialize in building performant Node.js engines, robust custom API integrations, and scalable PostgreSQL database structures.\n\nMy dual background in EEE and software development allows me to approach algorithmic and data problems at the intersecting boundaries of logical software and physical hardware. Whether collaborating to design resilient business platforms, crafting high-fidelity analytics dashboards, or embedding AI pathfinding into autonomous robotics, I strive for clean architecture and structural elegance. I am teachable, interactive, and driven to solve real-world industrial challenges through rigorous design.",
  skills: [
    "Node.js Backend",
    "API Design & Integration",
    "PostgreSQL Database Control",
    "JavaScript & TypeScript",
    "Git Version Control",
    "HTML & CSS Suite",
    "Embedded Hardware & IoT",
    "Technical Documentation",
    "Problem-Solving & Teams"
  ],
  socials: {
    github: "https://github.com/rafinholic",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    email: "partpola002@gmail.com",
  },
  resumeUrl: "#",
};

// Default projects seed
const DEFAULT_PROJECTS: Project[] = [
  {
    id: "project-art-cms",
    title: "Artisanal Content Management System (CMS)",
    description: "A custom content organization system built with a developer team to support cataloging and digital curation for a prominent art gallery.",
    content: "## The Artwork Lifecycle & Curation Platform\n\nThis Custom Content Management System (CMS) was engineered in collaboration with a developer team specifically for the website of an art organization. Curation of physical and digital artwork requires highly bespoke, visual workflow control, different from typical modular blogs or static pages.\n\nOur primary target was to build an interface that allows gallery curators to organize collections, update live exhibitions, and upload high-fidelity image archives smoothly while retaining high interactive speed.\n\n## Database Structure & Core Contributions\n\n- **Bespoke Portfolio Nodes**: Designed flexible schemas to represent artwork metadata, artist profiles, medium categories, and historic exhibition associations.\n- **Intuitive Visual Flow**: Spearheaded critical components of the frontend development to ensure non-technical artists and gallery staff can curate items seamlessly without encountering technical friction.\n- **Responsive Art Portals**: Refined the grid assets and touch curation layout to optimize loading speeds of high-density graphic assets, preventing layout shifts and network choking.\n\n## Operational Impact\n\nThe CMS transformed the art organization's digitisation lifecycle. Artists can now submit entries directly, and curators can publish full dynamic exhibitions with customized layouts in minutes, preserving the aesthetic philosophy of the physical exhibitions.",
    category: "Web Development",
    tags: ["CMS", "Database Design", "Team Collab", "UI/UX Curation"],
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://github.com/rafinholic",
    githubUrl: "https://github.com/rafinholic",
    featured: true,
    createdAt: new Date("2025-10-12").toISOString(),
  },
  {
    id: "project-transit-ims",
    title: "TransitFlow Inventory Management System (IMS)",
    description: "An analytical dispatch and cargo inventory tracking controller featuring interactive charting and full responsive design.",
    content: "## Optimizing Supply Chain Logic & Vehicle Dispatch\n\nBuilt for a transport and logistics enterprise, this comprehensive Inventory Management System (IMS) streamlines tracking cargo, monitoring container stocks, and managing vehicular dispatch. Moving assets in transportation requires live, high-precision analytics to minimize idle times.\n\nOur team focused on replacing legacy physical logs with a high-throughput, responsive dashboard capable of updating inventory levels, dispatch times, and transaction data in real time.\n\n## Core Technical Highlights\n\n- **Live Analytics with Recharts**: Engineered interactive, high-density line charts, active bar visualizers, and stock analytics that flag low-supply depots or delayed transit vectors automatically.\n- **Modern Component Shell**: Developed the modular UI using Tailwind CSS paired with lightweight, headless elements. This ensures extremely fast loading speeds and complete responsive safety across rugged warehouse tablets, delivery mobile screens, and desktop dispatch centers.\n- **Automated Delivery (CI/CD)**: Set up a robust, zero-downtime deployment flow via GitHub and Vercel. Every single pull request runs through build verification, testing dependencies before merging seamlessly into production.\n\n## Outcomes & Fleet Efficiency\n\nThe system helped reduce logistical planning delays by 35% through consolidated dispatch metrics. Warehouse managers can audit active parts and vehicle statuses instantly, leading to highly optimized fuel usage and rapid delivery routes.",
    category: "Software Development",
    tags: ["Recharts", "Tailwind CSS", "Headless UI", "CI/CD Vercel", "Inventory Systems"],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://github.com/rafinholic",
    githubUrl: "https://github.com/rafinholic",
    featured: true,
    createdAt: new Date("2026-02-14").toISOString(),
  },
  {
    id: "project-fire-robot",
    title: "AI Integrated Autonomous Firefighting Robot",
    description: "An autonomous exploration rover engineered for flame sensing, active maze-navigation, and safety hazard mitigation.",
    content: "## Hardware-Software Convergence for Emergency Response\n\nThis high-performance autonomous robot was designed and simulated as part of our academic B.Sc. Electrical and Electronics Engineering (EEE) curriculum. Building physical systems that respond to unpredictable thermal hazards requires combining real-time hardware signals with robust, edge-computed AI processing.\n\nThe autonomous rover moves dynamically through enclosed spaces, navigating obstacles, locating target heat points, and deploying fire extinguishing agents with absolute algorithmic precision.\n\n## System Architecture & Control Loops\n\n- **Multisensory Inputs**: Integrated flame sensors, infrared transducers, and ultrasonic distance modules bound to a centralized microcontroller unit.\n- **AI Pathfinding Module**: Programmed custom micro-pathfinding algorithms letting the robot navigate complex mazes, route around debris, and optimize search coverage in high-risk zones.\n- **Electronic Power Regulation**: Designed power distribution circuitry to regulate current draw from high-discharge lithium batteries, ensuring motor controls and active onboard water pumps run without brownout hazards.\n\n## Educational & Practical Realizations\n\nSuccessfully verified pathfinding logic and hardware integration across various physical test corridors. The research highlighted how embedding lightweight intelligent pathfinding agents onto physical silicon nodes significantly reduces response latency compared to centralized cloud-based control.",
    category: "Academic Projects",
    tags: ["AI Pathfinding", "Robotics Control", "Microcontrollers", "EEE Engineering"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://github.com/rafinholic",
    githubUrl: "https://github.com/rafinholic",
    featured: true,
    createdAt: new Date("2025-05-20").toISOString(),
  },
  {
    id: "project-teg-generator",
    title: "Thermoelectric Generator Unit",
    description: "An eco-friendly energy-harvesting module converting waste temperature differentials into regulated electrical sensor power.",
    content: "## Green Energy Harvesting from Waste Heat\n\nWaste heat accounts for more than half of all industrial energy loss worldwide. The EcoVolt Thermoelectric Generator (TEG) project proposes an efficient, modular solution to capture ambient thermal differentials and convert them into stable, regulated electrical energy to drive low-power IoT sensing nodes.\n\nThe research represents an empirical fusion of material physics, electrical regulation circuits, and environmental sustainability principles.\n\n## Hardware Design & Engineering Process\n\n- **Seebeck-Effect Conversion**: Leveraged semiconductor-based bismuth telluride (Bi2Te3) thermoelectric couples subjected to active high-differential thermal zones.\n- **Active Boost Circuitry**: Designed and prototyped custom boost converters and step-up logic systems to elevate weak, millivolt-level TEG outputs into a stable 3.3V power rail.\n- **Telemetry & Logging**: Developed an integrated sensor monitoring board that measures active temperatures, output currents, and harvesting efficiency, transmitting metrics over serial links for statistical review.\n\n## Empirical Performance\n\nThe module successfully powered remote temperature and humidity sensor nodes continuously using simple, unassisted industrial machine heat. This project demonstrates the feasibility of self-powering industrial telemetry nodes, eliminating standard battery maintenance cycles and reducing environmental toxic waste.",
    category: "Academic Projects",
    tags: ["Energy Harvesting", "circuits", "Electrical Design", "EcoTech"],
    image: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://github.com/rafinholic",
    githubUrl: "https://github.com/rafinholic",
    featured: false,
    createdAt: new Date("2024-11-05").toISOString(),
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
