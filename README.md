# Adexus

### Empowering users, amplifying brands, revolutionizing attention

A modern, mobile-first mini-app that enables brands to launch campaigns where users earn cryptocurrency rewards for completing various engagement actions.

### Checkout the deplyed contract details here

```
https://sepolia.basescan.org/address/0x507580db0085514e174515a8c9798ef6c1a5d939
```

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
   npm install
   ```

2. **Environment Variables**

   Check the `.example.env` file rename it to `.env.local`, add the relevant keys

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🔄 Web3 Integration

The app uses mock data for rapid prototyping. Ready for blockchain integration with:

- Smart contracts for campaign management and rewards
- Wallet connection (Wagmi configured)
- Token transfers and on-chain verification

## 📊 User Flow

1. **Browse** campaigns by type (video, survey, quiz, share)
2. **Complete** engagement actions with progress tracking
3. **Claim** crypto rewards upon completion
4. **Track** earnings and achievements

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

### Vercel

```bash
npm run build
# Deploy to Vercel and update the env variable accordingly
```

## 🎉 What Makes This Special

1. **Complete End-to-End Flow**: From browsing to completion to rewards
2. **Multiple Engagement Types**: Flexible for different brand needs
3. **Beautiful Mobile UI**: Production-ready design
4. **Mock Data for Testing**: Test all features without blockchain
5. **Easy to Extend**: Clean architecture for adding features
6. **Privacy-First**: No user data collection required

---

Built with 💙 for the Base Batches 002 Hackathon
