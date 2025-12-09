/**
 * Dummy profiles for Speed Networker XR
 * These will spawn as 3D cards in the directory carousel
 */

export interface Profile {
  id: string;
  name: string;
  role: string;
  company: string;
  skills: string[];
  interests: string[];
  avatarColor: string; // Hex color for card aura
  matchScore: number; // Pre-calculated for demo
}

export const PROFILES: Profile[] = [
  {
    id: "p1",
    name: "Alex Chen",
    role: "XR Developer",
    company: "Meta Reality Labs",
    skills: ["Unity", "WebXR", "Hand Tracking"],
    interests: ["Spatial Computing", "AI", "Gaming"],
    avatarColor: "#00ff88",
    matchScore: 92,
  },
  {
    id: "p2",
    name: "Sarah Kim",
    role: "Product Designer",
    company: "Apple Vision",
    skills: ["Figma", "Spatial UI", "Prototyping"],
    interests: ["AR/VR", "Accessibility", "Design Systems"],
    avatarColor: "#ff6b00",
    matchScore: 87,
  },
  {
    id: "p3",
    name: "Marcus Johnson",
    role: "AI Engineer",
    company: "OpenAI",
    skills: ["Python", "LLMs", "Computer Vision"],
    interests: ["Generative AI", "Robotics", "XR"],
    avatarColor: "#00d4ff",
    matchScore: 78,
  },
  {
    id: "p4",
    name: "Elena Rodriguez",
    role: "Startup Founder",
    company: "SpatialMeet",
    skills: ["Business Dev", "Fundraising", "Strategy"],
    interests: ["Metaverse", "Social VR", "Web3"],
    avatarColor: "#ff00ff",
    matchScore: 95,
  },
  {
    id: "p5",
    name: "David Park",
    role: "3D Artist",
    company: "Pixar",
    skills: ["Blender", "Maya", "Substance"],
    interests: ["Animation", "Virtual Production", "Games"],
    avatarColor: "#ffcc00",
    matchScore: 71,
  },
  {
    id: "p6",
    name: "Priya Sharma",
    role: "Research Scientist",
    company: "MIT Media Lab",
    skills: ["HCI", "User Research", "Haptics"],
    interests: ["Embodiment", "Presence", "Social XR"],
    avatarColor: "#8b5cf6",
    matchScore: 89,
  },
];

// Ice breaker questions for the cube throw mechanic
export const ICE_BREAKER_QUESTIONS = [
  "What's the most exciting XR project you've worked on?",
  "If you could build any app in VR, what would it be?",
  "What's your hot take on the future of spatial computing?",
];
