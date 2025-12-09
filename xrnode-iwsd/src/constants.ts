import { Profile } from './types';

export const APP_NAME = "XR NODE";
export const EVENT_NAME = "XR Matchmaking Hackathon 2025";

// Simulated event participant database
export const PARTICIPANT_DATABASE: Profile[] = [
  {
    id: 'p001',
    name: 'Sabina Chen',
    role: 'Project Manager',
    company: 'Hired',
    bio: 'Navigating the intersection of economic trends and AR data visualization. Passionate about bringing data to life in immersive environments.',
    interests: ['Economic Indicators', 'Data Storytelling', 'AR Dashboards'],
    skills: ['Project Management', 'Agile', 'Data Analysis', 'Stakeholder Communication'],
    imageUrl: 'https://picsum.photos/400/500?random=1',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/sabinachen',
    location: 'San Francisco, CA',
    experienceYears: 8
  },
  {
    id: 'p002',
    name: 'Vong Xiong',
    role: 'Data Strategist',
    company: 'Minstar',
    bio: 'Looking for partners to build the next gen of coherent healthcare deliverables in VR. Focused on making complex data accessible.',
    interests: ['Healthcare Data', 'Virtual Collaboration', 'Clean Sets'],
    skills: ['Data Strategy', 'Healthcare IT', 'VR Development', 'Python'],
    imageUrl: 'https://picsum.photos/400/500?random=2',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/vongxiong',
    location: 'Minneapolis, MN',
    experienceYears: 6
  },
  {
    id: 'p003',
    name: 'Marlaina Torres',
    role: 'XR Developer',
    company: 'Chamber of Commerce',
    bio: 'Focusing on member marketing through immersive city experiences. Building digital twins for civic engagement.',
    interests: ['Spatial Audio', 'Digital Twins', 'Civic Tech'],
    skills: ['Unity', 'WebXR', 'Three.js', 'React', 'TypeScript'],
    imageUrl: 'https://picsum.photos/400/500?random=3',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/marlainatorres',
    location: 'Austin, TX',
    experienceYears: 5
  },
  {
    id: 'p004',
    name: 'Deepak Sharma',
    role: 'Full Stack Developer',
    company: 'TechVentures',
    bio: 'Building scalable web applications with a focus on real-time collaboration features. Excited about WebXR possibilities.',
    interests: ['Real-time Systems', 'WebSockets', 'Cloud Architecture'],
    skills: ['Node.js', 'React', 'AWS', 'PostgreSQL', 'WebRTC'],
    imageUrl: 'https://picsum.photos/400/500?random=4',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/deepaksharma',
    location: 'Seattle, WA',
    experienceYears: 7
  },
  {
    id: 'p005',
    name: 'Serena Williams',
    role: 'AI/ML Engineer',
    company: 'NeuralPath',
    bio: 'Developing AI models for natural language understanding and recommendation systems. Interested in AI-powered matchmaking.',
    interests: ['Machine Learning', 'NLP', 'Recommendation Systems'],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Data Science'],
    imageUrl: 'https://picsum.photos/400/500?random=5',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/serenawilliamsai',
    location: 'Boston, MA',
    experienceYears: 4
  },
  {
    id: 'p006',
    name: 'Marcus Johnson',
    role: 'UX Designer',
    company: 'DesignForward',
    bio: 'Creating intuitive user experiences for emerging technologies. Specializing in spatial UI/UX for VR/AR applications.',
    interests: ['Spatial Design', 'User Research', 'Accessibility'],
    skills: ['Figma', 'Unity UI', 'User Research', 'Prototyping', 'Design Systems'],
    imageUrl: 'https://picsum.photos/400/500?random=6',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/marcusjohnsonux',
    location: 'New York, NY',
    experienceYears: 6
  },
  {
    id: 'p007',
    name: 'Aisha Patel',
    role: 'DevOps Engineer',
    company: 'CloudScale',
    bio: 'Automating infrastructure and deployment pipelines. Passionate about making development workflows seamless.',
    interests: ['CI/CD', 'Kubernetes', 'Infrastructure as Code'],
    skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'GitHub Actions'],
    imageUrl: 'https://picsum.photos/400/500?random=7',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/aishapatel',
    location: 'Denver, CO',
    experienceYears: 5
  },
  {
    id: 'p008',
    name: 'Ryan O\'Connor',
    role: 'Product Manager',
    company: 'InnovateTech',
    bio: 'Bridging the gap between technical teams and business goals. Experience launching XR products in enterprise markets.',
    interests: ['Product Strategy', 'Enterprise XR', 'Go-to-Market'],
    skills: ['Product Management', 'Roadmapping', 'User Stories', 'Analytics'],
    imageUrl: 'https://picsum.photos/400/500?random=8',
    matchPercentage: 0,
    linkedInUrl: 'https://linkedin.com/in/ryanoconnorpm',
    location: 'Chicago, IL',
    experienceYears: 9
  }
];

// Match level thresholds
export const MATCH_THRESHOLDS = {
  EXCELLENT: 75,
  GOOD: 50
};

// Aura colors for match visualization
export const AURA_COLORS = {
  EXCELLENT: '#22c55e', // Green
  GOOD: '#eab308',      // Yellow
  LOW: '#ef4444'        // Red
};

// QR Code prefix for validation
export const QR_PREFIX = 'XRNODE:';

// Scan timeout in milliseconds
export const SCAN_TIMEOUT = 30000;
