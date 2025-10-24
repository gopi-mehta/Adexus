# RewardFlow - Brand Engagement Mini-App

A modern, mobile-first mini-app that enables brands to launch campaigns where users earn cryptocurrency rewards for completing various engagement actions.

## 🎯 Features

### For Users

- **Browse Campaigns**: Explore active campaigns with different engagement types
- **Multiple Action Types**:
  - 🎥 **Video**: Watch brand videos and earn rewards
  - 📊 **Survey**: Share feedback through surveys
  - ❓ **Quiz**: Test your knowledge on various topics
  - 📢 **Share**: Share content on social media
- **Track Rewards**: Monitor your earnings and completed campaigns
- **Achievements**: Unlock achievements as you complete campaigns
- **Instant Rewards**: Receive verifiable crypto rewards upon completion

### For Brands

- **Campaign Management**: Create campaigns with different action types
- **Pay-per-Action**: Only pay for completed engagements
- **Real-time Analytics**: Track participant counts and campaign progress
- **Privacy-First**: Users engage without sharing personal data

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules + Modern CSS
- **Mini-App SDK**: Farcaster MiniKit & OnchainKit
- **State Management**: React Hooks
- **Wallet Integration**: Wagmi (ready for Web3 integration)

## 📱 Pages & Components

### Main Pages

1. **Home** (`/app/page.tsx`)

   - Campaign browsing with filters
   - Stats dashboard showing earnings and completion
   - Rewards/achievements tracking
   - Tab-based navigation

2. **Campaign Detail** (`/app/campaign/[id]/page.tsx`)
   - Campaign information
   - Interactive action completion (video, survey, quiz, share)
   - Progress tracking
   - Reward claim flow

### UI Components

- **Card**: Flexible card component with variants
- **Badge**: Status and category indicators
- **Button**: Primary, secondary, outline, and ghost variants
- **Progress**: Visual progress indicators
- **CampaignCard**: Complete campaign preview with stats
- **Navigation**: Tab navigation and filter bar

### Data Layer

- **Mock Data** (`/app/lib/mockData.ts`)
  - 8 sample campaigns across all types
  - User progress tracking
  - Survey and quiz questions
  - Ready to replace with real API calls

## 🛠️ Setup & Installation

1. **Install Dependencies**

   ```bash
   cd new-mini-app-quickstart
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_URL=http://localhost:3000
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🎨 Design Philosophy

### Mobile-First

- Optimized for mobile viewports
- Touch-friendly interactions (44px minimum touch targets)
- Smooth animations and transitions
- Safe area insets for modern devices

### Modern UI

- Clean, minimal interface
- Gradient accents for visual appeal
- Card-based layout for content organization
- Consistent spacing and typography

### User Experience

- Haptic feedback support (where available)
- Progressive disclosure of information
- Clear visual feedback for actions
- Accessible focus states

## 🔄 Next Steps for Web3 Integration

The app is currently using mock data for rapid prototyping. To integrate with blockchain:

1. **Smart Contracts**

   - Deploy campaign management contract
   - Deploy reward distribution contract
   - Implement escrow for brand payments

2. **Backend API**

   - Create campaign CRUD endpoints
   - Implement user authentication
   - Add reward claiming logic
   - Track completion proofs

3. **Blockchain Integration**

   - Connect wallet (already configured with Wagmi)
   - Implement token transfers
   - Add on-chain verification
   - Support multiple tokens (USDC, ETH, etc.)

4. **Database**
   - Replace mock data with database queries
   - Store user progress and rewards
   - Track campaign analytics
   - Implement caching for performance

## 📊 Campaign Flow

### Video Campaign

1. User views campaign details
2. Clicks "Start Campaign"
3. Video plays with progress tracking
4. Upon completion, user claims reward
5. Reward added to user balance

### Survey Campaign

1. User answers questions one by one
2. Progress shown as questions completed
3. All questions must be answered
4. Reward credited upon submission

### Quiz Campaign

1. User answers multiple-choice questions
2. Score calculated based on correct answers
3. Reward amount can be score-based
4. Results shown upon completion

### Share Campaign

1. User previews content to share
2. Selects social platform
3. Shares content (tracked via share API)
4. Instant reward upon verification

## 🎯 Mock Data Structure

### Campaign Object

```typescript
{
  id: string
  brandName: string
  brandLogo: string (emoji for now)
  title: string
  description: string
  type: 'video' | 'survey' | 'share' | 'quiz'
  reward: number (USD equivalent)
  rewardToken: string ('USDC', 'ETH', etc.)
  duration: number (minutes)
  participantsCount: number
  maxParticipants: number
  expiresAt: string
  isActive: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}
```

### User Progress

```typescript
{
  userId: string
  totalEarned: number
  campaignsCompleted: number
  completedCampaignIds: string[]
  inProgressCampaignIds: string[]
}
```

## 🎨 Color Palette

- **Primary**: `#0052ff` (Base Blue)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Background**: `#f8fafc` → `#e0f2fe` (Gradient)
- **Text**: `#0f172a` (Dark Slate)
- **Muted**: `#64748b` (Slate)

## 📦 File Structure

```
app/
├── campaign/
│   └── [id]/
│       ├── page.tsx           # Campaign detail page
│       └── page.module.css
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── Progress.tsx
│   ├── CampaignCard.tsx       # Campaign preview card
│   └── Navigation.tsx         # Tab & filter navigation
├── lib/
│   └── mockData.ts           # Mock campaign data
├── page.tsx                  # Home page
├── page.module.css
├── layout.tsx
├── globals.css
└── rootProvider.tsx
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Environment Variables for Production

- `NEXT_PUBLIC_URL`: Your production domain
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: OnchainKit API key
- Add Web3 provider endpoints when ready

## 🔐 Privacy & Security

- **No PII Collection**: Users engage anonymously
- **Wallet-Based Identity**: Authentication via wallet signature
- **Verifiable Rewards**: All rewards tracked on-chain (when integrated)
- **Brand Escrow**: Funds locked until action completion

## 📝 License

MIT License - Feel free to use for hackathons and production!

## 🤝 Contributing

This is a hackathon starter template. Feel free to:

- Add new campaign types
- Improve UI/UX
- Add animations
- Integrate real blockchain functionality
- Add analytics and tracking

## 🎉 What Makes This Special

1. **Complete End-to-End Flow**: From browsing to completion to rewards
2. **Multiple Engagement Types**: Flexible for different brand needs
3. **Beautiful Mobile UI**: Production-ready design
4. **Mock Data for Testing**: Test all features without blockchain
5. **Easy to Extend**: Clean architecture for adding features
6. **Privacy-First**: No user data collection required

---

Built with ❤️ for the Base Hackathon using MiniKit and OnchainKit
