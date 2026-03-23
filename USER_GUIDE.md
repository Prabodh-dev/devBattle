# DevBattle - User Guide & Feature Access

This guide shows you how to access and use all features in the DevBattle application.

## Getting Started

### 1. Access the Application

**Start the application:**
```bash
cd frontend
npm run dev
```

**Open in browser:**
```
http://localhost:3000
```

### 2. Authentication Flow

#### Sign Up
1. Navigate to: `http://localhost:3000/register`
2. Fill in:
   - Username (e.g., "CoolCoder")
   - Email (e.g., "coder@example.com")
   - Password
   - Confirm Password
3. Check "I agree to Terms"
4. Click "Create Account"

#### Log In
1. Navigate to: `http://localhost:3000/login`
2. Enter email and password
3. Click "Sign In"
4. You'll be redirected to `/app/chats`

**Demo Mode:** For quick testing, any email/password will work (redirects to app)

---

## Main Application Features

### 📱 Navigation

Once logged in, you'll see the main app interface with:
- **Left Sidebar**: Navigation menu
- **Center Panel**: Main content
- **Top Bar**: Search, notifications, profile
- **Right Panel** (conditional): Additional info

#### Sidebar Menu:
- Chats
- Groups  
- Battles
- Contests
- Playground
- Leaderboard
- Notifications (bottom)
- Profile (bottom)
- Settings (bottom)

---

## Feature-by-Feature Guide

### 💬 1. Private Chat

**Access:** Click "Chats" in sidebar or visit `/app/chats`

**Features:**
- View all your conversations
- Click on a chat to open conversation
- See online/offline status (green dot)
- View unread message count (blue badge)
- Search chats (search bar at top)

**Chat Window:**
- Send text messages
- Share code snippets (click code icon)
- Send reactions (click emoji icon)
- Attach files (click paperclip)
- See typing indicators (animated dots)
- View read receipts (✓ or ✓✓)
- Video/voice call buttons (top right)

**How to Send a Code Snippet:**
1. Click the code bracket icon
2. Select language from dropdown
3. Type or paste your code
4. Click send button

**Demo Data Available:**
- Chat with "AlexDev"
- Chat with "SarahCodes"
- Chat with "CodeMaster"

---

### 👥 2. Groups

**Access:** Click "Groups" in sidebar or visit `/app/groups`

**Features:**
- View all groups you're in
- See member count
- View unread messages
- Filter: My Groups / Discover

**Create a Group:**
1. Click "+ Create Group" button
2. Enter group name
3. Add description
4. Select privacy (Public/Private)
5. Click "Create Group"

**Demo Groups:**
- React Developers (245 members)
- Algorithm Masters (189 members)
- Python Enthusiasts (312 members)
- DevOps Community (156 members)

---

### ⚔️ 3. Coding Battles (1v1)

**Access:** Click "Battles" in sidebar or visit `/app/battles`

**Three Tabs:**
- **Active**: Ongoing battles you can join
- **Pending**: Challenges waiting for acceptance
- **History**: Past battles with results

**Start a Battle:**
1. Click "+ New Challenge"
2. Select opponent
3. Choose problem (or random)
4. Set time limit
5. Send challenge

**Join Active Battle:**
1. Go to Active tab
2. Click "Join Battle" on any active battle
3. You'll be taken to battle screen

**Battle Screen:** `/app/battles/[battleId]`
- **Left Side**: Problem statement with examples
- **Right Side**: Code editor with Monaco
- **Right Panel**: Timer, opponent info, your progress
- **Bottom**: Test results panel

**Battle Actions:**
- Select language (dropdown above editor)
- Write your solution
- Click "Run" to test with sample cases
- Click "Submit" when ready
- First accepted solution wins!

**Demo Battle:**
- Battle against "CodeNinja"
- Problem: "Two Sum" (Easy)
- 15 minutes time limit

---

### 🏆 4. Group Contests

**Access:** Click "Contests" in sidebar or visit `/app/contests`

**Contest Types:**
- **Upcoming**: Future contests you can register for
- **Active**: Currently running contests
- **Completed**: Past contests with final leaderboards

**Join a Contest:**
1. Find an upcoming or active contest
2. Click "Register" or "Join Now"
3. You'll see the contest detail page

**Contest Screen:** `/app/contests/[contestId]`

**Two Tabs:**
- **Problems**: List of all contest problems
- **Leaderboard**: Real-time rankings

**Solve Contest Problems:**
1. Click on any problem
2. You'll see problem statement
3. Write solution in editor
4. Submit your code
5. Your rank updates automatically

**Right Panel Shows:**
- Time remaining (countdown)
- Your score
- Problems solved (2/5)
- Your current rank

**Demo Contest:**
- "Algorithm Sprint" (Active)
- 5 problems
- 90 minutes duration
- 189 participants

---

### 💻 5. Code Playground

**Access:** Click "Playground" in sidebar or visit `/app/playground`

**Features:**
- Write code without any contest/battle
- Test algorithms and ideas
- Learn new languages
- Share code snippets

**How to Use:**
1. Select language from dropdown (top right)
2. Write your code in Monaco editor
3. Click "Run Code" to execute
4. View output in right panel
5. Click "Save" to save snippet
6. Click "Share" to get shareable link

**Supported Languages:**
- Python
- JavaScript
- Java
- C++
- C

**Output Panel Shows:**
- Console output
- Execution time
- Memory used
- Status (Success/Error)

**Starter Code:**
- Each language has helpful starter template
- Includes basic structure and comments

---

### 🏅 6. Leaderboard

**Access:** Click "Leaderboard" in sidebar or visit `/app/leaderboard`

**Features:**
- Global rankings of all developers
- Top 3 podium display
- Full rankings table
- Filter by: Global / Battles / Contests

**What You See:**
- Rank (with trophy icons for top 3)
- Username and avatar
- Tier (Beginner → Grandmaster)
- Rating score
- Problems solved
- Battles won
- Contests won

**Tier System:**
- 🥇 **Grandmaster**: 2400+ rating (Red)
- 💜 **Master**: 2000-2399 (Purple)
- 💙 **Expert**: 1600-1999 (Blue)
- 💚 **Coder**: 1200-1599 (Green)
- ⚪ **Beginner**: < 1200 (Gray)

---

### 🔔 7. Notifications

**Access:** Click bell icon in sidebar or visit `/app/notifications`

**Notification Types:**
1. **Battle Challenges** (⚔️)
   - Accept or Decline buttons
   - See who challenged you
   
2. **Friend Requests** (👤)
   - Accept or Decline
   - View requester profile
   
3. **Contest Reminders** (🚩)
   - Click to join contest
   - See start time
   
4. **Battle Results** (🏆)
   - See if you won/lost
   - View rating change
   
5. **New Messages** (💬)
   - Click to open chat

**Actions:**
- Click notification to mark as read
- "Accept" or "Decline" actionable items
- "Mark all as read" button (top right)
- Unread count shown in badge

---

### 👤 8. Developer Profile

**Access:** Click profile icon in sidebar or visit `/app/profile`

**Profile Sections:**

**Header:**
- Large avatar with initials
- Username and email
- Tier badge (colored)
- Rating with trophy icon
- Join date

**Stats Cards (4 blocks):**
- 💻 Problems Solved: 156
- 🏆 Battles Won: 45
- 📊 Contests Participated: 23
- 🔥 Day Streak: 7

**Languages:**
- Display of your preferred languages
- JavaScript, Python, Java, C++

**Recent Activity:**
- Latest battles won
- Recent problems solved
- Contest participations
- Timestamped activities

**Edit Profile:**
1. Click "Edit Profile" button
2. Update username
3. Update bio
4. Change preferred languages
5. Click "Save Changes"

---

## 🎮 Complete User Journey Example

### Scenario: New User First Day

#### 1. Sign Up (2 min)
```
http://localhost:3000/register
→ Create account
→ Auto redirect to /app/chats
```

#### 2. Explore App (5 min)
- Click through sidebar items
- See demo data in each section
- Get familiar with layout

#### 3. Try Playground (10 min)
```
/app/playground
→ Select Python
→ Write: print("Hello DevBattle!")
→ Click Run
→ See output
```

#### 4. Solve a Problem (15 min)
```
/app/contests
→ Join "Algorithm Sprint"
→ Click "Two Sum" problem
→ Write solution
→ Run tests
→ Submit code
```

#### 5. Challenge Friend (5 min)
```
/app/battles
→ Click New Challenge
→ Select opponent
→ Wait for acceptance
→ Battle begins!
```

#### 6. Check Progress (2 min)
```
/app/profile
→ View updated stats
→ See recent activities
→ Check rating change
```

---

## 📋 Quick Access URLs

| Feature | URL Path |
|---------|----------|
| **Auth** |
| Login | `/login` |
| Register | `/register` |
| **App** |
| Chats | `/app/chats` |
| Specific Chat | `/app/chats/[chatId]` |
| Groups | `/app/groups` |
| Battles List | `/app/battles` |
| Battle Room | `/app/battles/[battleId]` |
| Contests | `/app/contests` |
| Contest Detail | `/app/contests/[contestId]` |
| Playground | `/app/playground` |
| Leaderboard | `/app/leaderboard` |
| Notifications | `/app/notifications` |
| Profile | `/app/profile` |

---

## 🎨 UI Elements Guide

### Understanding the Interface

**Color Coding:**
- 🟢 **Green**: Success, online, easy difficulty
- 🟡 **Yellow**: Warning, medium difficulty  
- 🔴 **Red**: Error, hard difficulty, opponent
- 🔵 **Blue**: Primary actions, notifications
- 🟣 **Purple**: Premium features, master tier

**Interactive Elements:**
- All buttons have hover effects
- Cards have border color change on hover
- Links underline on hover
- Active tab highlighted in indigo
- Disabled buttons grayed out

**Status Indicators:**
- 🟢 Green dot = User online
- ⚪ No dot = User offline
- 🔵 Blue badge = Unread count
- 🔴 Red dot = New notification
- ⏱️ Timer = Time-sensitive action

---

## 🚀 Power User Tips

### Keyboard Shortcuts (Can be implemented)
- `Enter` to send message (in chat)
- `Shift+Enter` for new line
- `Ctrl+/` for code comment

### Best Practices
1. **Battles**: Run code before submitting
2. **Contests**: Start with easy problems
3. **Chat**: Use code snippets for sharing solutions
4. **Profile**: Keep languages updated for matching

### Hidden Features
- Click user avatars to view profiles (ready for implementation)
- Long-press on messages for reactions (ready for implementation)
- Drag-and-drop files in chat (ready for implementation)

---

## 🐛 Troubleshooting

### Page won't load
- Check if dev server is running
- Clear browser cache
- Check console for errors

### Features not working
- Some features need backend integration
- Real-time features need Socket.io connection
- Judge execution needs judge service running

### Styling issues
- Run `npm install` in frontend
- Check Tailwind config
- Restart dev server

---

## 📱 Mobile Responsiveness

The app is designed to be responsive:
- Sidebar collapses on mobile
- Chat panels stack vertically
- Editor adapts to screen size
- Tables scroll horizontally

---

## 🎯 Success Metrics

Track your progress:
- ⭐ Rating: Increases with wins
- 🔥 Streak: Consecutive active days
- 📈 Problems: Total solved count
- 🏆 Battles: Win/loss ratio
- 🎖️ Contests: Participation and rankings

---

**Need Help?**
- Check QUICKSTART.md for setup
- Review FEATURES_CHECKLIST.md for completeness
- See README.md for technical details
- Check console logs for errors

---

**Happy Coding! 🚀**
