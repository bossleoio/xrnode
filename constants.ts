import { Profile } from './types';

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Sabina',
    role: 'Project Manager',
    company: 'Hired',
    bio: 'Navigating the intersection of economic trends and AR data visualization.',
    interests: ['Economic Indicators', 'Data Storytelling', 'AR Dashboards'],
    imageUrl: 'https://picsum.photos/400/500?random=1',
    matchPercentage: 92
  },
  {
    id: '2',
    name: 'Vong',
    role: 'Data Strategist',
    company: 'Minstar',
    bio: 'Looking for partners to build the next gen of coherent healthcare deliverables in VR.',
    interests: ['Healthcare Data', 'Virtual Collaboration', 'Clean Sets'],
    imageUrl: 'https://picsum.photos/400/500?random=2',
    matchPercentage: 88
  },
  {
    id: '3',
    name: 'Marlaina',
    role: 'XR Developer',
    company: 'Chamber of Commerce',
    bio: 'Focusing on member marketing through immersive city experiences.',
    interests: ['Spatial Audio', 'Digital Twins', 'Civic Tech'],
    imageUrl: 'https://picsum.photos/400/500?random=3',
    matchPercentage: 95
  }
];

export const APP_NAME = "XR NODE";
