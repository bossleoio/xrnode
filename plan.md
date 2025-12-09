# XR NODE - XR Matchmaking Hackathon MVP Plan

## Project Overview
Build a mixed reality matchmaking application for a hackathon event that enables participants to scan QR codes on physical cards to discover and connect with other attendees. The MVP emphasizes simplified interactions, visual matching indicators (color-coded auras), and a confirmation handshake mechanism—prioritizing a focused demo experience over a fully productionized system.

## Target Scope: Hackathon MVP (2-Week Timeline)
- QR code scanning via camera (web-based using Meta IWSDK)
- Single profile view post-scan with AI-powered matching visualization
- Directory/scroll view of all registered participants
- Color-coded matching indicators (green/yellow/red based on AI analysis)
- Handshake confirmation mechanism to "lock" connections
- Social emote/notification system for appreciation signals
- Event-specific participant database integration

---

## Core User Interaction Flow

### Primary Flow: QR Code Scanning & Matching
1. **Scan Phase**: User opens camera and scans QR code on another participant's physical card
2. **Profile Display**: Single profile card appears with scanned participant's information
3. **Matching Visualization**: AI-powered match score displayed with color-coded aura (green/yellow/red)
4. **Confirmation Handshake**: User performs simulated or physical handshake gesture to "lock" connection
5. **Connection Saved**: Matched connection is added to user's network list

### Secondary Flow: Directory View
- Scroll-able list of all registered event participants
- Color-coded matching indicators for each profile
- Quick access to view full profiles without scanning

---

## Phase 1: Environment Setup & Dependencies

### 1.1 Install Meta IWSDK
- Add Meta's Interaction Web SDK (Immersive WebXR SDK) to project dependencies
- SDK provides camera access and hand tracking for gesture recognition
- Ensure compatibility with React 19.2.1 and TypeScript setup
- Update package.json with the IWSDK dependency

### 1.2 Configure WebXR Support
- Add WebXR feature detection to app initialization
- Implement fallback UI for non-WebXR browsers (demo mode)
- Configure for Meta Quest devices (primary target)
- Test on Chrome with WebXR enabled for development

### 1.3 Update HTML & Manifest
- Add WebXR meta tags to index.html for device capability detection
- Configure viewport for immersive experiences
- Add camera permission request meta tags
- Update app manifest for WebXR compatibility

### 1.4 Event Database Connection
- Set up connection to event-specific participant database
- Configure API endpoints for participant data retrieval
- Implement authentication/authorization for event access
- Test database connectivity and data format

---

## Phase 2: Camera & Permissions Setup

### 2.1 Request Camera Permissions
- Create utility function to request camera access
- Handle permission denial with user-friendly messaging
- Store permission state to avoid repeated requests
- Implement permission check before entering SCANNING state

### 2.2 Initialize Camera Stream
- Access device's rear camera for QR scanning
- Create video element to display live camera feed
- Ensure stream is initialized before QR detection begins
- Handle camera initialization errors gracefully

### 2.3 Handle Camera Lifecycle
- Start camera stream when entering SCANNING state
- Stop camera stream when exiting SCANNING or closing app
- Implement proper cleanup to prevent resource leaks
- Handle camera disconnection gracefully

---

## Phase 3: QR Code Detection & Decoding

### 3.1 Initialize IWSDK QR Detection
- Set up Meta IWSDK's computer vision module for QR detection
- Configure detection parameters (frame rate, confidence threshold)
- Bind camera stream to detection engine
- Test detection accuracy in various lighting conditions

### 3.2 Implement QR Code Detection Loop
- Create continuous detection loop processing camera frames
- Use IWSDK's QR detection API to identify codes in each frame
- Implement debouncing to prevent duplicate processing
- Add visual feedback (bounding box, focus indicator) on detection

### 3.3 Decode QR Code Data
- Extract raw data from detected QR codes
- Parse QR content to retrieve participant ID
- Validate decoded data format
- Handle malformed QR codes with error messages

---

## Phase 4: Participant Data & AI Matching Integration

### 4.1 QR Code Data Schema
- Define QR code format: contains participant ID (unique identifier)
- QR codes printed on physical cards at event
- Participant ID maps to event database record
- Document QR code generation requirements for event organizers

### 4.2 Implement Profile Lookup Service
- Create service function to fetch participant data by ID from event database
- Retrieve full profile: name, role, company, bio, interests, image, LinkedIn profile
- Implement error handling for invalid or missing participant IDs
- Cache profile data to reduce API calls

### 4.3 AI Matching Analysis (Serena's Component)
- Integrate with AI matching service to analyze compatibility
- Input: Current user profile + scanned participant profile
- Analysis criteria:
  - Skill set alignment (DevOps, Java developer, etc.)
  - Domain/industry match
  - Work experience level compatibility
  - Organizational connections
  - Geographic location/country
- Output: Match percentage score (0-100)

### 4.4 Validate Profile Data
- Ensure retrieved profile matches Profile interface
- Handle missing or incomplete data
- Implement fallback behavior for validation failures

---

## Phase 5: Matching Visualization & Color-Coded Auras

### 5.1 Implement Color-Coded Aura System
- Display matching score with visual aura effect around profile card
- **Green Aura**: Excellent match (75-100%) - high compatibility
- **Yellow Aura**: Good match (50-74%) - moderate compatibility
- **Red Aura**: Lower match (0-49%) - limited compatibility
- Animate aura glow effect for visual appeal

### 5.2 Update Profile Card Display
- Show participant name, role, company, bio, interests
- Display match percentage prominently
- Show color-coded aura indicator
- Include profile image from event registration

### 5.3 Add Scanning Feedback UI
- Display "Scanning..." status while camera is active
- Show "QR Code Detected" confirmation with visual feedback
- Display "Processing..." while fetching profile and AI analysis
- Show error messages for failed scans or API errors
- Implement timeout mechanism if no QR detected after 30 seconds

---

## Phase 6: Handshake Confirmation Mechanism

### 6.1 Gesture Recognition Setup
- Use IWSDK hand tracking to detect user hand gestures
- Implement handshake gesture recognition (two hands coming together)
- Configure gesture sensitivity and detection parameters
- Test gesture recognition accuracy

### 6.2 Implement Handshake Flow
- After profile is displayed, prompt user to perform handshake
- Detect when both participants' hands meet (simulated or physical)
- Provide visual/audio feedback when handshake is recognized
- Lock connection into user's network list upon successful handshake

### 6.3 Handshake Alternatives
- If gesture recognition is unavailable, implement button-based confirmation
- "Confirm Connection" button as fallback
- Haptic feedback on confirmation (if device supports)

---

## Phase 7: Connection Management & Network List

### 7.1 Store Confirmed Connections
- Save confirmed connections to local storage or user session
- Track connection timestamp and match score
- Maintain list of all locked connections from current session

### 7.2 Display Network List
- Show all confirmed connections in a separate view
- Display connection cards with match score and color indicator
- Allow user to review all matched participants

### 7.3 Connection Persistence
- Sync connections to event database after handshake
- Enable participants to view mutual connections
- Prepare data for post-event follow-up

---

## Phase 8: Directory/Scroll View

### 8.1 Implement Directory View
- Create scrollable list of all registered event participants
- Display profile cards with name, role, company, interests
- Show color-coded match indicators for each participant
- Allow filtering/sorting by match score or category

### 8.2 Directory Navigation
- Add toggle between Directory View and Scanning View
- Implement smooth transitions between views
- Allow quick access to full profile from directory
- Maintain state when switching between views

### 8.3 Directory Search & Filter
- Implement search by name or skill
- Filter by match score (green/yellow/red)
- Filter by industry or role
- Sort by match percentage

---

## Phase 9: Social Elements & Appreciation System

### 9.1 Implement Emote/Notification System
- Add "star" or appreciation button to profile cards
- Allow users to send positive signals to other participants
- Display notification when user receives appreciation
- Implement notification queue/history

### 9.2 Social Interactions
- Show appreciation count on profile cards
- Create visual feedback when emote is sent
- Implement notification center for received signals
- Consider gamification elements (badges, streaks, etc.)

### 9.3 Meta Horizon Worlds Inspiration
- Adopt social-first design philosophy
- Encourage organic, natural interactions
- Create moments of delight and connection
- Implement smooth, intuitive social gestures

---

## Phase 10: App State Management & Navigation

### 10.1 Update App State Enum
- **LANDING**: Welcome/intro screen
- **SCANNING**: Active QR code scanning mode
- **PROFILE_VIEW**: Single profile display post-scan
- **HANDSHAKE**: Awaiting handshake confirmation
- **DIRECTORY**: Scrollable participant list view
- **NETWORK**: User's confirmed connections list
- **ERROR**: Error state with recovery options

### 10.2 State Transitions
- LANDING → SCANNING (user initiates scan)
- SCANNING → PROFILE_VIEW (QR detected and profile loaded)
- PROFILE_VIEW → HANDSHAKE (user ready to confirm)
- HANDSHAKE → NETWORK (connection confirmed)
- NETWORK → SCANNING (scan another participant)
- LANDING → DIRECTORY (view all participants)
- Any state → ERROR (on failure, with recovery to LANDING)

### 10.3 Navigation & UI Flow
- Bottom navigation or tab bar for quick access to Scanning, Directory, Network
- Header with event name and user's connection count
- Back buttons for easy navigation
- Persistent state across view transitions

---

## Phase 11: Testing & Validation

### 11.1 Unit Testing
- Test QR code decoding with various formats
- Test AI matching algorithm with sample profiles
- Test gesture recognition accuracy
- Test profile data validation
- Test color-coded aura assignment logic

### 11.2 Integration Testing
- Test full scanning flow: camera → QR detection → profile load → handshake → save
- Test directory view with sample participant data
- Test state transitions and navigation
- Test error handling and recovery
- Test rapid successive scans

### 11.3 Device Testing
- Test on Meta Quest 2 and Quest 3 (primary targets)
- Test on Android devices with WebXR support
- Test on desktop browsers (Chrome with WebXR)
- Verify camera performance and detection speed
- Test in various lighting conditions (bright, dim, outdoor)

### 11.4 User Testing
- Conduct user testing with hackathon participants
- Gather feedback on matching visualization
- Test handshake gesture recognition with real users
- Validate QR code scanning reliability
- Collect feedback on overall UX and flow

---

## Phase 12: Performance & Optimization

### 12.1 Camera Frame Processing
- Implement frame skipping to reduce processing load
- Optimize QR detection parameters for speed vs accuracy
- Monitor CPU/GPU usage during scanning
- Target: QR detection within 1-2 seconds

### 12.2 Memory Management
- Properly release camera stream when not in use
- Implement garbage collection for detection results
- Monitor memory usage during extended sessions
- Implement cleanup on app pause/resume

### 12.3 Network Optimization
- Cache participant profiles to reduce API calls
- Implement efficient data fetching from event database
- Minimize payload size for profile data
- Target: Profile display within 2-3 seconds of scan

---

## Phase 13: Deployment & Documentation

### 13.1 Build Configuration
- Update Vite configuration for WebXR support
- Ensure IWSDK dependencies properly bundled
- Test production build on target devices
- Verify no console errors or warnings

### 13.2 Event Database Setup
- Configure event-specific database with participant data
- Set up API endpoints for profile retrieval
- Implement data validation and sanitization
- Test with real participant data

### 13.3 QR Code Generation
- Create tool/script for generating QR codes with participant IDs
- Print QR codes on physical cards for event
- Test QR code scanning with printed cards
- Create backup digital QR codes for testing

### 13.4 Documentation
- Create user guide for event participants
- Document QR code scanning instructions
- Create troubleshooting guide for common issues
- Document handshake gesture instructions
- Create admin guide for event organizers

---

## Technical Considerations

### WebXR & Camera Access
- **Primary Concern**: Pass-through camera API may be limited to Unity on some devices
- **Mitigation**: Use Meta IWSDK's web-based camera access; test thoroughly on target devices
- **Fallback**: Implement demo mode for non-WebXR browsers
- **Timeline**: Validate camera access early in development (Phase 1-2)

### AI Matching Integration
- Coordinate with Serena's AI component for matching analysis
- Define clear API contract for matching service
- Implement efficient caching of match results
- Test with real LinkedIn profile data (if integrated)

### Gesture Recognition Limitations
- Hand tracking may not work in all lighting conditions
- Implement button-based fallback for handshake confirmation
- Test gesture recognition extensively before event
- Provide clear user instructions for gesture

### Event Database
- Ensure participant data is current and complete
- Implement data validation before display
- Handle missing or incomplete profile data gracefully
- Test with realistic participant dataset

---

## Success Criteria for Hackathon MVP

- QR codes on physical cards are scanned and decoded reliably
- Participant profiles load correctly from event database
- AI matching analysis produces meaningful scores
- Color-coded auras (green/yellow/red) display correctly based on match score
- Handshake confirmation mechanism works (gesture or button)
- Confirmed connections are saved and displayed in network list
- Directory view shows all participants with match indicators
- App works smoothly on Meta Quest devices
- User flow is intuitive and requires minimal instruction
- No critical bugs or crashes during event
- Performance targets met: QR detection <2s, profile display <3s

---

## Implementation Priority (2-Week Timeline)

### Week 1
1. Phase 1: Environment Setup & IWSDK integration
2. Phase 2: Camera & permissions
3. Phase 3: QR code detection & decoding
4. Phase 4: Participant data retrieval from event database
5. Phase 5: Matching visualization (color-coded auras)

### Week 2
6. Phase 6: Handshake confirmation mechanism
7. Phase 7: Connection management
8. Phase 8: Directory view
9. Phase 9: Social elements (emotes)
10. Phase 10: App state management
11. Phase 11-13: Testing, optimization, deployment

---

## Known Constraints & Risks

- **Camera API Limitation**: Pass-through camera may be unavailable on web; validate early
- **Timeline**: 2 weeks is tight; prioritize core scanning and matching features
- **Gesture Recognition**: May require fallback to button-based confirmation
- **Event Database**: Ensure participant data is ready before development
- **AI Integration**: Coordinate timing with Serena's matching algorithm
- **Device Testing**: Limited time for extensive device testing; focus on Meta Quest

---

## Notes for Team

- **Deepak**: Directory view prototype can be adapted from existing work
- **Marlaina**: Focus on QR scanning and aura visualization; validate camera access early
- **Serena**: Ensure AI matching API is ready by end of Week 1
- **All**: Prioritize demo experience over production robustness; focus on key interactions
- **Event Organizers**: Prepare participant database and QR code generation process
