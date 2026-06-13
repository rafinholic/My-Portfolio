import React, { useState, useEffect } from "react";
import { Project, PortfolioSettings, ContactMessage } from "../types";
import {
  Settings,
  FolderKanban,
  MessageSquare,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  Eye,
  MailOpen,
  ArrowLeft,
  EyeOff,
  User,
  ExternalLink,
  Upload,
  FileText,
} from "lucide-react";

interface AdminDashboardProps {
  initialToken: string;
  adminPasswordEnv?: string;
  onLogout: () => void;
  onRefreshPortfolio: () => Promise<void>;
  portfolioProjects: Project[];
  portfolioSettings: PortfolioSettings;
}

type Tab = "projects" | "settings" | "messages";

export default function AdminDashboard({
  initialToken,
  onLogout,
  onRefreshPortfolio,
  portfolioProjects,
  portfolioSettings,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [token, setToken] = useState<string>(initialToken);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Projects form state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "Web App",
    tagsString: "",
    image: "",
    demoUrl: "",
    githubUrl: "https://github.com/rafinholic",
    featured: false,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    title: "",
    bio: "",
    aboutMe: "",
    skillsString: "",
    github: "",
    linkedin: "",
    twitter: "",
    email: "",
    resumeUrl: "",
  });

  // Action status messages
  const [status, setStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  const showStatus = (type: "success" | "error", text: string) => {
    setStatus({ type, text });
    setTimeout(() => setStatus({ type: null, text: "" }), 4000);
  };

  // Resume upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus({ type: null, text: "" });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Content = reader.result as string;

        try {
          const resp = await fetch("/api/admin/resume/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: selectedFile.name,
              fileContent: base64Content,
            }),
          });

          if (resp.ok) {
            const data = await resp.json();
            setUploadStatus({ type: "success", text: "Resume uploaded successfully!" });
            setSettingsForm((prev) => ({ ...prev, resumeUrl: data.resumeUrl }));
            setSelectedFile(null);
            
            // Reset the file input element description
            const fileInput = document.getElementById("resume-file-input") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            
            showStatus("success", "Resume uploaded successfully!");
            await onRefreshPortfolio();
          } else {
            const errData = await resp.json();
            setUploadStatus({ type: "error", text: errData.error || "Upload failed." });
          }
        } catch (err) {
          console.error(err);
          setUploadStatus({ type: "error", text: "Failed to connect to backend API." });
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error(err);
      setUploadStatus({ type: "error", text: "Failed to read local file." });
      setIsUploading(false);
    }
  };

  // Sync settings/projects with form when they load
  useEffect(() => {
    if (portfolioSettings) {
      setSettingsForm({
        name: portfolioSettings.name || "",
        title: portfolioSettings.title || "",
        bio: portfolioSettings.bio || "",
        aboutMe: portfolioSettings.aboutMe || "",
        skillsString: (portfolioSettings.skills || []).join(", "),
        github: portfolioSettings.socials?.github || "",
        linkedin: portfolioSettings.socials?.linkedin || "",
        twitter: portfolioSettings.socials?.twitter || "",
        email: portfolioSettings.socials?.email || "",
        resumeUrl: portfolioSettings.resumeUrl || "",
      });
    }
  }, [portfolioSettings]);

  // Fetch messages
  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await fetch("/api/admin/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to load contact messages.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch messages on tab transition
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    }
  }, [activeTab]);

  // Handle setting updates
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedSettings: PortfolioSettings = {
        name: settingsForm.name,
        title: settingsForm.title,
        bio: settingsForm.bio,
        aboutMe: settingsForm.aboutMe,
        skills: settingsForm.skillsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
        socials: {
          github: settingsForm.github,
          linkedin: settingsForm.linkedin,
          twitter: settingsForm.twitter,
          email: settingsForm.email,
        },
        resumeUrl: settingsForm.resumeUrl,
      };

      const resp = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (resp.ok) {
        showStatus("success", "Portfolio settings saved successfully.");
        await onRefreshPortfolio();
      } else {
        const errorData = await resp.json();
        showStatus("error", errorData.error || "Failed to update configurations.");
      }
    } catch (err) {
      console.error(err);
      showStatus("error", "Failed to connect to backend api.");
    }
  };

  // Project creator form opening
  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      description: "",
      content: "",
      category: "Web App",
      tagsString: "React, Tailwind, Node.js",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      demoUrl: "",
      githubUrl: "",
      featured: false,
    });
    setIsCreatingProject(true);
  };

  // Project editing form opening
  const openEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      description: proj.description,
      content: proj.content,
      category: proj.category,
      tagsString: proj.tags.join(", "),
      image: proj.image,
      demoUrl: proj.demoUrl || "",
      githubUrl: proj.githubUrl || "",
      featured: proj.featured || false,
    });
    setIsCreatingProject(false);
  };

  // Submit project (create / update)
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        content: projectForm.content,
        category: projectForm.category,
        tags: projectForm.tagsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
        image: projectForm.image,
        demoUrl: projectForm.demoUrl || undefined,
        githubUrl: projectForm.githubUrl || undefined,
        featured: projectForm.featured,
      };

      let url = "/api/admin/projects";
      let method = "POST";

      if (editingProject) {
        url = `/api/admin/projects/${editingProject.id}`;
        method = "PUT";
      }

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        showStatus("success", editingProject ? "Project updated successfully." : "New project added successfully.");
        setEditingProject(null);
        setIsCreatingProject(false);
        await onRefreshPortfolio();
      } else {
        const errorData = await resp.json();
        showStatus("error", errorData.error || "Failed to submit project data.");
      }
    } catch (err) {
      console.error(err);
      showStatus("error", "Failed to connect to backend server.");
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const resp = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        showStatus("success", "Project deleted successfully.");
        await onRefreshPortfolio();
      } else {
        const errorData = await resp.json();
        showStatus("error", errorData.error || "Failed to delete project.");
      }
    } catch (err) {
      console.error(err);
      showStatus("error", "Could not reach database repository.");
    }
  };

  // Toggle message read status
  const toggleMessageRead = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin/messages/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, read: !msg.read } : msg))
        );
      }
    } catch (err) {
      console.error("Failed to toggle read status", err);
    }
  };

  // Delete contact form message
  const handleDeleteMessage = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        showStatus("success", "Message deleted successfully.");
      }
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div>
          <span className="font-mono text-xs text-[#a855f7] dark:text-[#c084fc] font-semibold tracking-wider">
            ADMINISTRATOR WORKSPACE
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-white">
            Portfolio Management
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3.5 py-2 border border-zinc-250 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-300 rounded-md text-xs font-semibold cursor-pointer transition-colors"
            id="admin-logout-button"
          >
            <LogOut size={13} />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Persistent global notification status banner */}
      {status.type && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 text-sm border ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
              : "bg-red-50 text-red-800 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
          }`}
          id="admin-global-status-banner"
        >
          <Check size={16} className="flex-shrink-0" />
          <span>{status.text}</span>
        </div>
      )}

      {/* Main Panel Content Split (Tabs Side, Content Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation panel */}
        <div className="lg:col-span-1 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 rounded-xl p-3 h-fit">
          <button
            onClick={() => {
              setActiveTab("projects");
              setEditingProject(null);
              setIsCreatingProject(false);
            }}
            className={`flex items-center space-x-3 w-full px-4.5 py-3 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === "projects"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
            id="tab-btn-projects"
          >
            <FolderKanban size={15} />
            <span>Manage Works ({portfolioProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center space-x-3 w-full px-4.5 py-3 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === "settings"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
            id="tab-btn-settings"
          >
            <Settings size={15} />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center space-x-3 w-full px-4.5 py-3 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === "messages"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
            id="tab-btn-messages"
          >
            <MessageSquare size={15} />
            <span className="flex-1">Contact Messages</span>
            {messages.filter((m) => !m.read).length > 0 && (
              <span className="inline-block bg-[#a855f7] dark:bg-[#c084fc] text-white px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Content panel */}
        <div className="lg:col-span-3 min-h-[50vh] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl p-5 sm:p-7">
          
          {/* TAB 1: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              {!isCreatingProject && !editingProject ? (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                      Creative Projects Inventory
                    </h3>
                    <button
                      onClick={openCreateProject}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                      id="new-project-btn"
                    >
                      <Plus size={14} />
                      <span>Add Work</span>
                    </button>
                  </div>

                  {/* List of projects */}
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {portfolioProjects.map((proj) => (
                      <div key={proj.id} className="flex gap-4 py-4 items-center">
                        <div className="w-16 h-10 rounded-md bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-200/25">
                          <img
                            src={proj.image}
                            alt={proj.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-sans font-semibold text-zinc-900 dark:text-white text-sm truncate">
                            {proj.title}
                          </h4>
                          <div className="flex items-center space-x-2.5 mt-0.5">
                            <span className="font-mono text-[10px] text-zinc-400 capitalize">{proj.category}</span>
                            {proj.featured && (
                              <span className="bg-purple-500/10 text-purple-650 dark:text-purple-400 px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-wider font-mono">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEditProject(proj)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md cursor-pointer transition-colors"
                            title="Edit Project"
                            id={`edit-proj-btn-${proj.id}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id, proj.title)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-955 text-zinc-500 hover:text-red-650 dark:hover:text-red-400 rounded-md cursor-pointer transition-colors"
                            title="Delete Project"
                            id={`delete-proj-btn-${proj.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {portfolioProjects.length === 0 && (
                      <div className="py-12 text-center text-zinc-400 text-xs">
                        No projects defined. Click Add Work to seed your first one!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Form for project creation / modification */
                <form onSubmit={handleProjectSubmit} className="space-y-5" id="project-admin-form">
                  <div className="flex items-center space-x-2 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setIsCreatingProject(false);
                      }}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full cursor-pointer transition-colors"
                      id="close-form-btn"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-zinc-900 dark:text-white">
                        {editingProject ? `Modify: ${projectForm.title}` : "Add New Creative Project"}
                      </h3>
                      <p className="font-mono text-[9px] text-[#a855f7] dark:text-[#c084fc] uppercase">
                        {editingProject ? "UPDATE SCHEMAS" : "GENERATE ENTRY"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Project Title (required)
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                        placeholder="E.g., Quantum Particle Canvas"
                        id="form-title"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Category (required)
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                        className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                        placeholder="E.g., Web App, Fine Art, Experimental"
                        id="form-category"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                      Short Description (required)
                    </label>
                    <input
                      type="text"
                      required
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                      placeholder="High-level 1-sentence descriptor of what it does."
                      id="form-description"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Media Image URL (required)
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.image}
                        onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                        className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7] font-mono text-xs"
                        placeholder="https://..."
                        id="form-image"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Tools / Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={projectForm.tagsString}
                        onChange={(e) => setProjectForm({ ...projectForm, tagsString: e.target.value })}
                        className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                        placeholder="E.g., React, WebGL, Canvas"
                        id="form-tags"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        value={projectForm.demoUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                        className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7] font-mono text-xs"
                        placeholder="https://..."
                        id="form-demo-url"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        GitHub Source URL
                      </label>
                      <input
                        type="url"
                        value={projectForm.githubUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7] font-mono text-xs"
                        placeholder="https://github.com/..."
                        id="form-github-url"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                      Detailed Content Summary (supports basic double line space paragraphs & double hashtag heading lines)
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={projectForm.content}
                      onChange={(e) => setProjectForm({ ...projectForm, content: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7] font-sans"
                      placeholder="Introduce the architecture, development process, and outcomes..."
                      id="form-details"
                    ></textarea>
                  </div>

                  <div className="flex items-center space-x-3 py-1">
                    <input
                      type="checkbox"
                      id="form-featured"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                      className="rounded border-zinc-300 text-[#a855f7] focus:ring-[#a855f7]"
                    />
                    <label htmlFor="form-featured" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none uppercase cursor-pointer">
                      Mark as Featured (bannered) Project
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <button
                      type="submit"
                      className="flex items-center space-x-1.5 px-4.5 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-md text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      id="project-submit-btn"
                    >
                      <Save size={13} />
                      <span>{editingProject ? "Save Project" : "Add Project"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setIsCreatingProject(false);
                      }}
                      className="px-4.5 py-2 border border-zinc-250 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-300 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                      id="project-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSettingsSubmit} className="space-y-6 animate-fade-in" id="settings-admin-form">
              <div className="pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  Developer Profile Configurations
                </h3>
                <p className="font-mono text-[9px] text-[#a855f7] dark:text-[#c084fc] uppercase">
                  MANAGE PERSISTENT ROOT SETTINGS
                </p>
              </div>

              {/* Developer identity fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Developer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                    placeholder="E.g., Alex Rivera"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Professional Title Descriptor
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                    placeholder="E.g., Designer & Creative Technologist"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Short Hero Elevator Pitch (Bio)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.bio}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                  placeholder="Summarize your professional thesis in one powerful sentence."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Detailed Bio (About Me)
                </label>
                <textarea
                  rows={4}
                  required
                  value={settingsForm.aboutMe}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutMe: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7] font-sans"
                  placeholder="Introduce your focus, engineering systems background, and philosophies..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Skills Deck (comma separated)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.skillsString}
                    onChange={(e) => setSettingsForm({ ...settingsForm, skillsString: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7]"
                    placeholder="React, TypeScript, WebGL, Design Thinking"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Curriculum Vitae / Resume Links
                  </label>
                  <input
                    type="text"
                    value={settingsForm.resumeUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, resumeUrl: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-950 dark:text-white rounded-md text-sm focus:outline-none focus:border-[#a855f7] font-mono text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Upload Resume Section */}
              <div className="p-5 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-lg space-y-4 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="flex items-center space-x-2">
                  <Upload size={14} className="text-[#a855f7] dark:text-[#c084fc]" />
                  <h4 className="font-display font-semibold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                    Upload Physical Resume Document
                  </h4>
                </div>
                <p className="font-sans font-light text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                  Upload your updated CV (PDF, DOCX, or DOC). This will automatically host the file and update your active landing page resume download link.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 animate-fade-in">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          setUploadStatus({ type: null, text: "" });
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-file-input"
                      className="flex items-center space-x-2.5 px-4 py-3 border border-zinc-200 hover:border-zinc-305 dark:border-zinc-850 dark:hover:border-zinc-750 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200"
                    >
                      <FileText size={14} className="text-zinc-400" />
                      <span className="truncate flex-1 text-left">
                        {selectedFile ? selectedFile.name : "Choose a PDF/Doc resume file..."}
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleResumeUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex items-center justify-center space-x-1.5 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-400 rounded-md text-xs font-semibold cursor-pointer shadow-xs transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                    id="submit-resume-upload-button"
                  >
                    {isUploading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Upload Resume</span>
                      </>
                    )}
                  </button>
                </div>

                {uploadStatus.type && (
                  <div
                    className={`p-3 text-xs border rounded-md flex items-center space-x-2 ${
                      uploadStatus.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : "bg-red-50 text-red-00 border-red-250/20 dark:bg-red-955/20 dark:text-red-450 dark:border-red-900/30"
                    }`}
                  >
                    <Check size={12} className="flex-shrink-0" />
                    <span>{uploadStatus.text}</span>
                  </div>
                )}
              </div>

              {/* Social Channels Config Frame */}
              <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="font-display font-semibold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                  Operational Social Links
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">GitHub profile</label>
                    <input
                      type="url"
                      value={settingsForm.github}
                      onChange={(e) => setSettingsForm({ ...settingsForm, github: e.target.value })}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-md text-xs font-mono"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={settingsForm.linkedin}
                      onChange={(e) => setSettingsForm({ ...settingsForm, linkedin: e.target.value })}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-md text-xs font-mono"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">X / Twitter Account</label>
                    <input
                      type="url"
                      value={settingsForm.twitter}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twitter: e.target.value })}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-md text-xs font-mono"
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Contact Email Address</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-md text-xs font-mono"
                      placeholder="designer@domain.com"
                    />
                  </div>
                </div>
              </div>

              {/* Settings submissions */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                  id="settings-submit-btn"
                >
                  <Save size={13} />
                  <span>Update Configuration Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CONTACT FORM MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                  Contact Inbox Stream
                </h3>
                <p className="font-mono text-[9px] text-[#a855f7] dark:text-[#c084fc] uppercase">
                  INCOMING USER PROJECTIONS ({messages.length})
                </p>
              </div>

              {messagesLoading && (
                <div className="py-12 text-center text-xs text-zinc-500 font-mono tracking-wider">
                  ACCESSING INCOMING PACKETS...
                </div>
              )}

              {!messagesLoading && messages.length === 0 && (
                <div className="py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-xl text-center text-zinc-400 text-xs text-zinc-500">
                  Inbox empty. Ready to cache submissions.
                </div>
              )}

              {!messagesLoading && messages.length > 0 && (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-5 rounded-xl border transition-all duration-200 ${
                        msg.read
                          ? "bg-zinc-50/40 border-zinc-100 dark:bg-zinc-900/10 dark:border-zinc-900 text-zinc-500"
                          : "bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-xs"
                      }`}
                      id={`message-row-${msg.id}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150/10 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-sans font-bold text-sm text-zinc-900 dark:text-white">
                              {msg.name}
                            </span>
                            {!msg.read && (
                              <span className="bg-purple-500 text-white px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
                                UNREAD
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">
                            {msg.email} &bull; {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => toggleMessageRead(msg.id)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                            title={msg.read ? "Mark as Unread" : "Mark as Read"}
                            id={`read-message-${msg.id}`}
                          >
                            {msg.read ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-955 rounded-md cursor-pointer transition-colors text-zinc-500 hover:text-red-650 dark:hover:text-red-400"
                            title="Delete Message"
                            id={`delete-message-${msg.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 space-y-1.5">
                        <span className="font-sans font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                          Subject: {msg.subject}
                        </span>
                        <p className="font-sans text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
