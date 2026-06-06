export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  createdAt: string;
}

export interface PortfolioSettings {
  name: string;
  title: string;
  bio: string;
  aboutMe: string;
  skills: string[];
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
    email: string;
  };
  resumeUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface PortfolioData {
  projects: Project[];
  settings: PortfolioSettings;
}
