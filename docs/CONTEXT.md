# Flutter Migration Development Plan - DocChat

## Executive Summary

This document outlines the comprehensive plan to migrate the **DocChat** web application (React/TypeScript/Vite) into a cross-platform **Flutter mobile application**. The current application is a PDF summarizer and document chat SaaS that allows users to upload documents (PDF, PowerPoint, Word) and interact with them through an AI-powered chat interface.

---

## Current Application Analysis

### Technology Stack (Web)
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Authentication**: Supabase Auth (Email + Google OAuth)

### Core Features
1. **User Authentication**
   - Email/password authentication
   - Google OAuth integration
   - Protected routes (Dashboard)
   - User profile management

2. **Document Management**
   - Upload documents (PDF, PPTX, PPT, DOC, DOCX) up to 100MB
   - Drag-and-drop file upload
   - Document listing with metadata (name, size, date)
   - Document deletion (storage + database)
   - File storage in Supabase Storage buckets

3. **Document Chat Interface**
   - AI-powered chat with uploaded documents
   - Mock AI responses (ready for OpenAI/Claude integration)
   - Suggested questions
   - Real-time message streaming UI
   - Document summarization capabilities

4. **Landing Pages**
   - Marketing homepage with Hero, Features, How It Works, Pricing
   - Privacy Policy
   - Terms of Service
   - Contact page

### Database Schema
```sql
-- Profiles table
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Documents table
documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  file_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Storage bucket: 'documents' (private)
```

### API Integrations
- **Supabase**: Database, Authentication, Storage
- **AI Service**: Placeholder for OpenAI/Claude API (currently mocked)

---

## Flutter Migration Architecture

### Target Technology Stack

#### Core Framework
- **Flutter SDK**: 3.24+ (latest stable)
- **Dart**: 3.5+
- **Platform Support**: iOS, Android (Web/Desktop optional)

#### State Management
- **Riverpod 2.x**: Modern, compile-safe state management
- **Freezed**: Immutable data classes and unions
- **JSON Serializable**: Type-safe JSON parsing

#### Backend & Services
- **Supabase Flutter SDK**: Database, Auth, Storage integration
- **Dio**: HTTP client for API calls
- **OpenAI Dart**: For AI chat integration (or Claude SDK)

#### UI & Design
- **Material Design 3**: Modern Flutter UI components
- **Google Fonts**: Typography matching web design
- **Cached Network Image**: Efficient image loading
- **Flutter SVG**: Vector graphics support
- **Shimmer**: Loading state animations

#### File Handling
- **File Picker**: Cross-platform file selection
- **Path Provider**: Local file system access
- **Flutter Dropzone** (Web): Drag-and-drop support
- **PDF Viewer**: In-app PDF preview

#### Authentication
- **Supabase Auth**: Email/password + OAuth
- **Google Sign-In**: Native Google authentication
- **Flutter Secure Storage**: Token storage

#### Additional Utilities
- **Go Router**: Declarative routing with deep linking
- **Intl**: Internationalization and date formatting
- **Flutter Dotenv**: Environment variable management
- **Logger**: Structured logging

---

## Project Structure

```
docchat_flutter/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   ├── env_config.dart
│   │   │   └── supabase_config.dart
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   ├── api_constants.dart
│   │   │   └── storage_keys.dart
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── app_colors.dart
│   │   │   ├── app_text_styles.dart
│   │   │   └── app_dimensions.dart
│   │   ├── router/
│   │   │   ├── app_router.dart
│   │   │   └── route_guards.dart
│   │   ├── errors/
│   │   │   ├── failures.dart
│   │   │   └── exceptions.dart
│   │   └── utils/
│   │       ├── validators.dart
│   │       ├── formatters.dart
│   │       └── logger.dart
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── user_model.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── datasources/
│   │   │   │       └── auth_remote_datasource.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_interface.dart
│   │   │   ├── presentation/
│   │   │   │   ├── providers/
│   │   │   │   │   └── auth_provider.dart
│   │   │   │   ├── screens/
│   │   │   │   │   ├── login_screen.dart
│   │   │   │   │   └── signup_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── auth_form.dart
│   │   │   │       └── social_auth_buttons.dart
│   │   │
│   │   ├── documents/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── document_model.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── document_repository.dart
│   │   │   │   └── datasources/
│   │   │   │       ├── document_remote_datasource.dart
│   │   │   │       └── document_local_datasource.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── document.dart
│   │   │   │   └── repositories/
│   │   │   │       └── document_repository_interface.dart
│   │   │   ├── presentation/
│   │   │   │   ├── providers/
│   │   │   │   │   └── documents_provider.dart
│   │   │   │   ├── screens/
│   │   │   │   │   ├── dashboard_screen.dart
│   │   │   │   │   └── document_upload_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── document_card.dart
│   │   │   │       ├── document_list.dart
│   │   │   │       └── upload_dropzone.dart
│   │   │
│   │   ├── chat/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   ├── message_model.dart
│   │   │   │   │   └── chat_session_model.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── chat_repository.dart
│   │   │   │   └── datasources/
│   │   │   │       ├── ai_service.dart
│   │   │   │       └── chat_remote_datasource.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── message.dart
│   │   │   │   │   └── chat_session.dart
│   │   │   │   └── repositories/
│   │   │   │       └── chat_repository_interface.dart
│   │   │   ├── presentation/
│   │   │   │   ├── providers/
│   │   │   │   │   └── chat_provider.dart
│   │   │   │   ├── screens/
│   │   │   │   │   └── chat_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── message_bubble.dart
│   │   │   │       ├── chat_input.dart
│   │   │   │       └── suggested_questions.dart
│   │   │
│   │   ├── home/
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       │   └── home_screen.dart
│   │   │       └── widgets/
│   │   │           ├── hero_section.dart
│   │   │           ├── features_section.dart
│   │   │           ├── how_it_works_section.dart
│   │   │           └── pricing_section.dart
│   │   │
│   │   └── profile/
│   │       ├── data/
│   │       │   ├── models/
│   │       │   │   └── profile_model.dart
│   │       │   └── repositories/
│   │       │       └── profile_repository.dart
│   │       └── presentation/
│   │           ├── providers/
│   │           │   └── profile_provider.dart
│   │           ├── screens/
│   │           │   └── profile_screen.dart
│   │           └── widgets/
│   │               └── profile_form.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── custom_button.dart
│       │   ├── custom_text_field.dart
│       │   ├── loading_indicator.dart
│       │   ├── error_widget.dart
│       │   └── empty_state.dart
│       ├── extensions/
│       │   ├── context_extensions.dart
│       │   ├── string_extensions.dart
│       │   └── datetime_extensions.dart
│       └── models/
│           └── result.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
├── android/
├── ios/
├── web/
├── .env
├── .env.example
├── pubspec.yaml
└── README.md
```

---

## Phase-by-Phase Implementation Plan

### Phase 1: Project Setup & Configuration (Week 1)

#### 1.1 Flutter Project Initialization
- [ ] Create new Flutter project: `flutter create docchat_flutter`
- [ ] Configure `pubspec.yaml` with all dependencies
- [ ] Set up folder structure following clean architecture
- [ ] Configure platform-specific settings (iOS, Android)

#### 1.2 Environment Configuration
- [ ] Create `.env` file for environment variables
- [ ] Set up Supabase configuration (URL, anon key)
- [ ] Configure build flavors (dev, staging, production)
- [ ] Set up code generation scripts

#### 1.3 Core Infrastructure
- [ ] Implement `AppConfig` and `EnvConfig`
- [ ] Set up Supabase client initialization
- [ ] Create logger utility
- [ ] Implement error handling framework (Failures, Exceptions)
- [ ] Set up dependency injection with Riverpod

#### 1.4 Theme & Design System
- [ ] Create Material 3 theme configuration
- [ ] Define color palette matching web design
- [ ] Set up typography system with Google Fonts
- [ ] Create reusable dimension constants
- [ ] Implement dark mode support

**Deliverables**: 
- Working Flutter project with proper structure
- Environment configuration
- Theme system
- Core utilities

---

### Phase 2: Authentication System (Week 2)

#### 2.1 Data Layer
- [ ] Create `User` entity and `UserModel`
- [ ] Implement `AuthRemoteDatasource` with Supabase
- [ ] Implement `AuthRepository`
- [ ] Add secure token storage with Flutter Secure Storage

#### 2.2 Business Logic
- [ ] Create `AuthProvider` with Riverpod
- [ ] Implement sign-up functionality
- [ ] Implement sign-in functionality
- [ ] Implement Google OAuth flow
- [ ] Implement sign-out functionality
- [ ] Add session persistence and auto-login

#### 2.3 Presentation Layer
- [ ] Create `LoginScreen` with email/password form
- [ ] Create `SignupScreen` with validation
- [ ] Implement social auth buttons (Google)
- [ ] Add loading states and error handling
- [ ] Create auth form validation

#### 2.4 Routing & Guards
- [ ] Set up Go Router configuration
- [ ] Implement route guards for protected routes
- [ ] Add deep linking support
- [ ] Configure redirect logic based on auth state

**Deliverables**: 
- Complete authentication flow
- Login/Signup screens
- Google OAuth integration
- Protected routing

---

### Phase 3: Document Management (Week 3-4)

#### 3.1 Data Layer
- [ ] Create `Document` entity and `DocumentModel`
- [ ] Implement `DocumentRemoteDatasource` with Supabase
- [ ] Implement `DocumentLocalDatasource` for caching
- [ ] Implement `DocumentRepository`
- [ ] Set up file upload to Supabase Storage

#### 3.2 File Handling
- [ ] Integrate File Picker for document selection
- [ ] Implement file validation (type, size)
- [ ] Create upload progress tracking
- [ ] Implement drag-and-drop (web platform)
- [ ] Add file compression for large documents

#### 3.3 Business Logic
- [ ] Create `DocumentsProvider` with Riverpod
- [ ] Implement document listing with pagination
- [ ] Implement document upload functionality
- [ ] Implement document deletion
- [ ] Add real-time document updates (Supabase Realtime)

#### 3.4 Presentation Layer
- [ ] Create `DashboardScreen` with document list
- [ ] Create `DocumentCard` widget
- [ ] Create `DocumentUploadScreen` with dropzone
- [ ] Implement upload progress indicator
- [ ] Add empty state for no documents
- [ ] Create document detail view

**Deliverables**: 
- Document upload functionality
- Document listing and management
- Dashboard screen
- File storage integration

---

### Phase 4: Chat Interface (Week 5-6)

#### 4.1 Data Layer
- [ ] Create `Message` and `ChatSession` entities
- [ ] Create corresponding models
- [ ] Implement `AIService` for OpenAI/Claude integration
- [ ] Implement `ChatRemoteDatasource`
- [ ] Implement `ChatRepository`
- [ ] Set up message persistence

#### 4.2 AI Integration
- [ ] Integrate OpenAI SDK (or Claude)
- [ ] Implement document context injection
- [ ] Create streaming response handler
- [ ] Implement retry logic for failed requests
- [ ] Add rate limiting and quota management

#### 4.3 Business Logic
- [ ] Create `ChatProvider` with Riverpod
- [ ] Implement message sending
- [ ] Implement streaming message reception
- [ ] Add suggested questions logic
- [ ] Implement chat history management

#### 4.4 Presentation Layer
- [ ] Create `ChatScreen` with message list
- [ ] Create `MessageBubble` widget
- [ ] Create `ChatInput` widget with text field
- [ ] Implement `SuggestedQuestions` widget
- [ ] Add typing indicators
- [ ] Implement auto-scroll to latest message
- [ ] Add message timestamp formatting

**Deliverables**: 
- Working chat interface
- AI integration (OpenAI/Claude)
- Message streaming
- Chat history

---

### Phase 5: Landing Pages & Marketing (Week 7)

#### 5.1 Home Screen
- [ ] Create `HomeScreen` with navigation
- [ ] Implement `HeroSection` widget
- [ ] Implement `FeaturesSection` widget
- [ ] Implement `HowItWorksSection` widget
- [ ] Implement `PricingSection` widget
- [ ] Add smooth scrolling and animations

#### 5.2 Static Pages
- [ ] Create Privacy Policy screen
- [ ] Create Terms of Service screen
- [ ] Create Contact screen with form
- [ ] Add navigation between pages

#### 5.3 Animations & Polish
- [ ] Add page transition animations
- [ ] Implement scroll animations
- [ ] Add micro-interactions
- [ ] Optimize images and assets

**Deliverables**: 
- Complete landing page
- Static legal pages
- Polished animations

---

### Phase 6: Profile & Settings (Week 8)

#### 6.1 Profile Management
- [ ] Create `ProfileModel` and entity
- [ ] Implement `ProfileRepository`
- [ ] Create `ProfileProvider`
- [ ] Implement profile update functionality
- [ ] Add avatar upload

#### 6.2 Settings Screen
- [ ] Create settings screen
- [ ] Add theme toggle (light/dark)
- [ ] Add notification preferences
- [ ] Add account management options
- [ ] Implement account deletion

**Deliverables**: 
- Profile management
- Settings screen
- User preferences

---

### Phase 7: Testing & Quality Assurance (Week 9)

#### 7.1 Unit Tests
- [ ] Write tests for repositories
- [ ] Write tests for providers
- [ ] Write tests for utilities
- [ ] Achieve 80%+ code coverage

#### 7.2 Widget Tests
- [ ] Test authentication screens
- [ ] Test document management screens
- [ ] Test chat interface
- [ ] Test custom widgets

#### 7.3 Integration Tests
- [ ] Test complete authentication flow
- [ ] Test document upload flow
- [ ] Test chat flow
- [ ] Test navigation

#### 7.4 Performance Testing
- [ ] Profile app performance
- [ ] Optimize build size
- [ ] Test on low-end devices
- [ ] Optimize network requests

**Deliverables**: 
- Comprehensive test suite
- Performance optimizations
- Bug fixes

---

### Phase 8: Deployment & Release (Week 10)

#### 8.1 iOS Preparation
- [ ] Configure App Store Connect
- [ ] Set up certificates and provisioning profiles
- [ ] Create app icons and splash screens
- [ ] Configure Info.plist
- [ ] Submit for TestFlight

#### 8.2 Android Preparation
- [ ] Configure Google Play Console
- [ ] Set up signing keys
- [ ] Create app icons and splash screens
- [ ] Configure AndroidManifest.xml
- [ ] Submit for internal testing

#### 8.3 CI/CD Setup
- [ ] Set up GitHub Actions / Codemagic
- [ ] Configure automated builds
- [ ] Set up automated testing
- [ ] Configure deployment pipelines

#### 8.4 Documentation
- [ ] Write user documentation
- [ ] Create developer documentation
- [ ] Document API integration
- [ ] Create deployment guide

**Deliverables**: 
- Published apps on App Store and Play Store
- CI/CD pipeline
- Complete documentation

---

## Key Technical Considerations

### 1. File Upload Strategy
- **Challenge**: Mobile file uploads can be unreliable
- **Solution**: 
  - Implement chunked uploads for large files
  - Add upload resume capability
  - Show detailed progress indicators
  - Cache uploads locally before sending

### 2. Offline Support
- **Challenge**: Users may have intermittent connectivity
- **Solution**:
  - Cache document metadata locally
  - Queue uploads for when connection returns
  - Show offline indicators
  - Sync when connection restored

### 3. AI Response Streaming
- **Challenge**: Long AI responses need progressive display
- **Solution**:
  - Use Server-Sent Events (SSE) or WebSocket
  - Implement streaming text display
  - Add cancellation capability
  - Handle connection interruptions

### 4. Document Preview
- **Challenge**: Previewing PDFs/DOCX on mobile
- **Solution**:
  - Use `flutter_pdfview` for PDF preview
  - Convert DOCX/PPTX to PDF server-side for preview
  - Implement zoom and scroll
  - Add page navigation

### 5. State Management
- **Challenge**: Complex state across features
- **Solution**:
  - Use Riverpod for reactive state
  - Implement proper state persistence
  - Use Freezed for immutable models
  - Add state restoration

### 6. Security
- **Challenge**: Protecting user data and API keys
- **Solution**:
  - Use Flutter Secure Storage for tokens
  - Implement certificate pinning
  - Validate all inputs
  - Use Supabase RLS policies
  - Never expose API keys in client

---

## Migration Strategy from Web

### Data Compatibility
- **Database**: No changes needed (same Supabase backend)
- **Storage**: Same Supabase Storage buckets
- **Auth**: Same Supabase Auth system
- **Users**: Existing users can log in immediately

### Feature Parity Checklist
- [x] User authentication (email + Google)
- [x] Document upload (PDF, PPTX, DOCX)
- [x] Document listing and management
- [x] Document deletion
- [x] Chat interface
- [x] AI-powered responses
- [x] Profile management
- [ ] Payment integration (Stripe - future phase)
- [ ] Admin panel (web-only, not needed in mobile)

### Platform-Specific Enhancements
- **Mobile-First Features**:
  - Push notifications for chat responses
  - Biometric authentication (Face ID, Touch ID)
  - Share extension (share documents from other apps)
  - Camera integration (scan documents)
  - Offline mode with sync
  - Native file picker

---

## Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  
  # Backend & API
  supabase_flutter: ^2.5.6
  dio: ^5.7.0
  dart_openai: ^5.1.0  # or anthropic_sdk_dart for Claude
  
  # Routing
  go_router: ^14.2.7
  
  # UI Components
  google_fonts: ^6.2.1
  cached_network_image: ^3.4.1
  flutter_svg: ^2.0.10+1
  shimmer: ^3.0.0
  lottie: ^3.1.2
  
  # File Handling
  file_picker: ^8.1.2
  path_provider: ^2.1.4
  flutter_pdfview: ^1.3.2
  
  # Authentication
  google_sign_in: ^6.2.1
  flutter_secure_storage: ^9.2.2
  
  # Utilities
  intl: ^0.19.0
  logger: ^2.4.0
  flutter_dotenv: ^5.1.0
  uuid: ^4.5.1
  
  # Permissions
  permission_handler: ^11.3.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Code Generation
  build_runner: ^2.4.12
  freezed: ^2.5.7
  json_serializable: ^6.8.0
  riverpod_generator: ^2.4.3
  
  # Testing
  mockito: ^5.4.4
  flutter_lints: ^4.0.0
  integration_test:
    sdk: flutter
```

---

## Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://ptvfsnkcousrzsyldlpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_ID=ptvfsnkcousrzsyldlpv

# AI Service (OpenAI or Claude)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Google OAuth (Platform-specific)
GOOGLE_CLIENT_ID_IOS=...
GOOGLE_CLIENT_ID_ANDROID=...
GOOGLE_CLIENT_ID_WEB=...

# App Configuration
APP_NAME=DocChat
APP_VERSION=1.0.0
ENVIRONMENT=production
```

---

## Risk Assessment & Mitigation

### High-Risk Items

1. **AI API Costs**
   - **Risk**: High usage could lead to expensive API bills
   - **Mitigation**: 
     - Implement usage quotas per user
     - Add freemium tier with limits
     - Cache common responses
     - Optimize prompt engineering

2. **File Upload Reliability**
   - **Risk**: Large file uploads may fail on mobile networks
   - **Mitigation**: 
     - Chunked uploads with resume capability
     - Background upload service
     - Retry logic with exponential backoff

3. **Platform Approval**
   - **Risk**: App Store/Play Store rejection
   - **Mitigation**: 
     - Follow platform guidelines strictly
     - Implement proper privacy policies
     - Add content moderation
     - Test thoroughly before submission

### Medium-Risk Items

1. **Performance on Low-End Devices**
   - **Mitigation**: Profile and optimize, test on various devices

2. **Cross-Platform Consistency**
   - **Mitigation**: Extensive testing on iOS and Android

3. **Third-Party SDK Updates**
   - **Mitigation**: Pin versions, test updates in staging

---

## Success Metrics

### Technical Metrics
- [ ] App launch time < 2 seconds
- [ ] File upload success rate > 95%
- [ ] Chat response time < 3 seconds
- [ ] Crash-free rate > 99.5%
- [ ] App size < 50MB

### Business Metrics
- [ ] User retention (Day 7) > 40%
- [ ] Daily active users (DAU)
- [ ] Document upload rate
- [ ] Chat engagement rate
- [ ] Conversion to paid tier

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Setup | Week 1 | Project structure, theme, config |
| 2. Authentication | Week 2 | Login, signup, OAuth |
| 3. Documents | Week 3-4 | Upload, list, manage documents |
| 4. Chat | Week 5-6 | AI chat interface |
| 5. Landing | Week 7 | Marketing pages |
| 6. Profile | Week 8 | User profile, settings |
| 7. Testing | Week 9 | Tests, QA, optimization |
| 8. Deployment | Week 10 | App Store, Play Store release |

**Total Duration**: 10 weeks (2.5 months)

---

## Next Steps

1. **Review & Approval**: Stakeholder review of this plan
2. **Resource Allocation**: Assign developers (1-2 Flutter developers)
3. **Environment Setup**: Provision Supabase, OpenAI/Claude accounts
4. **Kickoff**: Begin Phase 1 implementation
5. **Weekly Sync**: Progress reviews and adjustments

---

## Appendix

### A. Supabase Configuration Checklist
- [ ] Enable Email Auth
- [ ] Configure Google OAuth provider
- [ ] Set up RLS policies
- [ ] Create storage buckets
- [ ] Configure CORS for mobile
- [ ] Set up database indexes

### B. Design Assets Needed
- [ ] App icon (1024x1024)
- [ ] Splash screen
- [ ] Feature graphics
- [ ] Screenshots (iOS & Android)
- [ ] Promotional materials

### C. Legal Requirements
- [ ] Privacy Policy (mobile-specific)
- [ ] Terms of Service
- [ ] GDPR compliance
- [ ] Data retention policy
- [ ] Cookie policy (web only)

---

**Document Version**: 1.0  
**Last Updated**: December 1, 2025  
**Author**: Development Team  
**Status**: Ready for Review


Here is your **complete, polished, single-shot “App Prompt”** you can paste into ANY AI app builder (Cursor, Replit Agent, Mobbin AI, Builder.io, v0, Bolt.new, etc.) to generate your full Micro-SaaS:

---

# **APP PROMPT — PDF Summarizer Micro-SaaS**

Build a **PDF Summarizer Micro-SaaS** web application with the following requirements:

## **1. App Overview**

Create a lightweight SaaS that allows users to **upload any PDF** and instantly receive a **concise AI-generated summary** (100–300 words or bullet points). The app must be extremely simple:
**Upload → Summarize → Download/Export**.

It should support **domain-specific summarization** (legal, finance, academic), workflow integrations (Slack/Notion), and a freemium model.

---

## **2. Core Features**

### **PDF Processing**

* Upload PDFs up to **100MB**.
* Parse multi-page documents accurately.
* Support **OCR for scanned PDFs** using Tesseract.

### **AI Summary Engine**

* Use OpenAI or Claude API to produce:

  * Short summary (100 words)
  * Medium (150–200 words)
  * Detailed (300–400 words)
  * Bullet-point mode
* Optional focus selector: **Legal clauses / Financial metrics / Academic insights**.

### **Exports**

* Export summary to:

  * TXT
  * CSV
  * JSON
  * Copy to clipboard
  * Push to Slack, Notion, Google Docs (simple webhook integrations)

---

## **3. User Flow**

1. **User uploads PDF**
2. System performs parsing + OCR if needed
3. User chooses: summary length + domain focus
4. AI generates summary
5. User downloads or exports
6. For free tier: limit to **3 summaries per day**
7. Paid tier: **unlimited summaries** ($19/month)

---

## **4. UI/UX Requirements**

* Minimalistic dashboard (white/gray theme, clean buttons).
* Central upload box.
* Progress indicator (“Parsing PDF…”, “Generating Summary…”).
* Results panel showing summary + export options.
* Pricing page with:

  * Free plan (3/day)
  * Pro plan ($19/mo)
* Login/Signup via email + Google OAuth.

---

## **5. Tech Stack**

* **Frontend:** React (Next.js) or Bubble (if no-code).
* **Backend:** Flask or Node.js API running on AWS Lambda.
* **PDF Parsing:** pdfminer / PyMuPDF + Tesseract for OCR.
* **AI Engine:** OpenAI GPT-4.1 or Claude 3.5 API.
* **Database:** Supabase or Firebase (for user auth + usage tracking).
* **Hosting:** Vercel for frontend, AWS Lambda for backend.
* **Payments:** Stripe Billing.

---

## **6. Pricing Logic**

* Free plan: store daily usage count; block after 3 summaries.
* Paid plan: allow unlimited.
* Stripe webhooks to update “plan_status” in DB.
* API cost target: ~$0.02/summary.

---

## **7. SEO / Growth**

Implement SEO-optimized landing pages targeting:

* “legal PDF summarizer”
* “financial report summarizer”
* “contract summarizer online”
* “academic PDF summarizer”

Include sections for testimonials, sample summaries, and a blog.

---

## **8. Admin Panel**

Basic admin dashboard to view:

* Total users
* Daily summaries
* Failed summaries
* API cost usage
* Stripe subscriptions

---

## **9. Constraints**

* Build in **2–3 weeks MVP**.
* Keep infrastructure lightweight and inexpensive (<$100/month scaling to 1k users).
* Aim for **85%+ margins**.
* System must handle at least **1,000 concurrent summarizations** using serverless scaling.

---

## **10. Output Requirements**

When generating project code, include:

* Full frontend files
* Backend API endpoints
* Environment variables template
* Deployment instructions
* API integration code
* Stripe code
* Database schema for users + summaries
* OCR pipeline
* SEO-optimized landing page
* Admin dashboard
* Notion/Slack export integrations

---

**End of Prompt. Build the complete application accordingly.**

---

If you want, I can also generate:

✅ the **database schema**
✅ **GitHub-ready folder structure**
✅ **full React + Flask source code**
✅ **Stripe billing integration**
✅ **landing page copywriting**


Here is a **clean, production-ready database schema** for your **PDF Summarizer SaaS**, built for Supabase / Postgres.
It includes authentication, usage limits, summaries, subscriptions, storage, logs, and admin metrics.

---

# ✅ **DATABASE SCHEMA (PostgreSQL / Supabase)**

---

## **1. users**

(extends `auth.users` — only store app-specific fields)

```sql
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text unique,
    avatar_url text,
    plan text not null default 'free',          -- free | pro
    daily_usage int not null default 0,         -- summaries used today
    usage_reset_at timestamptz,                -- next reset (midnight UTC)
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

## **2. summaries**

Stores each summary generated for analytics & usage limits.

```sql
create table public.summaries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    pdf_name text,
    pdf_size_mb numeric(10,2),
    summary_text text,
    summary_length text,                      -- short | medium | detailed | bullets
    domain text,                              -- legal | finance | academic | general
    tokens_used int,
    cost_usd numeric(10,4),
    created_at timestamptz default now()
);
```

---

## **3. subscriptions**

Tracks Stripe plans and billing status.

```sql
create table public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text,                                -- free | pro
    status text,                              -- active | past_due | canceled | incomplete
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

## **4. credits (optional)**

If you want a **$0.50/summary credit system**.

```sql
create table public.credits (
    user_id uuid primary key references public.users(id) on delete cascade,
    credits int not null default 0,
    updated_at timestamptz default now()
);
```

---

## **5. files (parsed PDFs)**

Optional if you want to store extracted text for debugging.

```sql
create table public.files (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    pdf_url text,
    extracted_text text,
    ocr_used boolean default false,
    created_at timestamptz default now()
);
```

---

## **6. audit_logs**

Tracks failures, errors, OCR issues, etc.

```sql
create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    event_type text,                          -- summary_failed | ocr_failed | api_error | webhook_error
    message text,
    metadata jsonb,
    created_at timestamptz default now()
);
```

---

## **7. admin_metrics**

Rolling analytics for dashboard.

```sql
create table public.admin_metrics (
    id uuid primary key default gen_random_uuid(),
    total_users int,
    total_summaries int,
    api_cost_usd numeric(10,4),
    total_revenue_usd numeric(10,2),
    captured_at timestamptz default now()
);
```

---

# 🔐 **RLS Policies (recommended)**

### **users**

```sql
-- user can read/update themselves
create policy "Users can view own data"
on public.users for select
using (auth.uid() = id);

create policy "Users can update own data"
on public.users for update
using (auth.uid() = id);
```

### **summaries**

```sql
create policy "Users read own summaries"
on public.summaries for select
using (auth.uid() = user_id);

create policy "Users insert their summaries"
on public.summaries for insert
with check (auth.uid() = user_id);
```

---

# 🎯 **Summary of Tables**

| Table             | Purpose                                      |
| ----------------- | -------------------------------------------- |
| **users**         | App-specific user data, plan, usage counters |
| **summaries**     | Every summary generated                      |
| **subscriptions** | Stripe billing & plan control                |
| **credits**       | In-app credit system (optional)              |
| **files**         | PDF files + extracted text                   |
| **audit_logs**    | Errors & debugging                           |
| **admin_metrics** | Analytics snapshots                          |

---

If you want, I can also generate:

✅ **Supabase SQL migrations**
✅ **Full RLS policies**
✅ **API endpoints for this schema**
✅ **Folder structure + backend code**

Just tell me: **“Generate the backend API”** or **“Give me the full migrations.”**


No worries — I’ll walk you through **exactly what to do step-by-step** in Supabase, even if you're a complete beginner.
This will set up **secure storage buckets** for your PDF Summarizer SaaS.

---

# ✅ **What We Are Setting Up**

You need **3 buckets**:

1. **pdf-uploads** → where user PDF files go
2. **extracted-text** → (optional) store extracted PDF text or OCR output
3. **public-assets** → logos, landing page images (public access)

We will create each bucket and then apply proper **RLS rules** so only the owner can access their files.

---

# 🚀 **STEP 1 — Go to Supabase Storage**

1. Open **Supabase dashboard**
2. On the left sidebar, click **Storage**
3. Click **+ New bucket**

---

# 🚀 **STEP 2 — Create the Buckets**

## **Bucket 1: pdf-uploads**

* Bucket Name: **pdf-uploads**
* Visibility: **Private (VERY IMPORTANT!)**
* Click **Create**

## **Bucket 2: extracted-text** (optional but useful)

* Name: **extracted-text**
* Visibility: **Private**
* Create

## **Bucket 3: public-assets**

* Name: **public-assets**
* Visibility: **Public**
* Create

---

# 🚀 **STEP 3 — Enable RLS for the Private Buckets**

### Go to:

Storage → pdf-uploads → **Policies tab** → **Enable RLS**

Repeat for **extracted-text**.

---

# 🚀 **STEP 4 — Add RLS Policies**

You want policies that allow:

### ✅ **Users to upload their own files**

### ✅ **Users to read only their own files**

### ❌ No one else should access them

Here are the policies:

---

# 🔐 **Policy 1 — Allow users to upload their own files**

Go to:

**Storage → pdf-uploads → Policies → New Policy**

Name: **Users can upload their own PDFs**
Action: **Insert**
Target: **Object**
Check:

```sql
auth.uid() = request.auth.uid()
```

---

# 🔐 **Policy 2 — Allow users to read only their own files**

Create another policy:

Name: **Users can read their PDFs**
Action: **Select**
Check:

```sql
auth.uid() = owner
```

---

# 🔐 **Policy 3 — Allow users to delete THEIR files**

Action: **Delete**
Check:

```sql
auth.uid() = owner
```

---

# 🎯 Your Bucket Is Now Secure

Supabase will automatically set **owner = auth.uid()** for each uploaded object, so the policies above secure everything perfectly.

---

# 🚀 **STEP 5 — Code Snippet for Uploading a File (for your app)**

Here is the example code (JavaScript/Next.js):

```js
const { data, error } = await supabase.storage
  .from("pdf-uploads")
  .upload(`${user.id}/${file.name}`, file, {
    cacheControl: "3600",
    upsert: false,
  });
```

---

# 🚀 **STEP 6 — Code Snippet for Downloading**

```js
const { data, error } = await supabase.storage
  .from("pdf-uploads")
  .download(`${user.id}/${fileName}`);
```

---

# 🚀 **STEP 7 — Listing User Files**

```js
const { data, error } = await supabase.storage
  .from("pdf-uploads")
  .list(user.id + "/", {
    limit: 100
  });
```

---

# 🎉 **YOU ARE DONE!**

Your Supabase Storage is now set up for:

✔ Secure PDF uploads
✔ Per-user file protection
✔ Ready for OCR + summarization backend
✔ Integration with your SaaS logic

---

If you want, I can also generate:
🔥 **The entire Supabase SQL file to import**
🔥 **Full RLS policies with “bucket-level & object-level” rules**
🔥 **Backend code to process the uploaded PDFs**

Just tell me: **“Give me the full SQL file”** or **“Generate the backend upload endpoint.”**
