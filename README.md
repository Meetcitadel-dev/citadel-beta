# College Adjectives App

A social discovery platform where users connect through adjective-based "vibes" and messaging.

## Core Features

### 1. User Authentication & Onboarding
- **OTP-based Signup/Login**: Email verification via OTP
- **Profile Creation**: Users provide name, gender, age, college, year, skills, and a personal note (max 40 characters)
- **Profile Image Upload**: Required to make profile public and send/receive vibes
- **Profile Completion**: Users can edit profile details (email, college, year are read-only after creation)

### 2. Discover & Vibes System
- **Profile Discovery**: Swipe through profiles of other users
- **Adjective Selection**: Users select adjectives (3 positive + 1 negative) to describe others
- **Vibe Sending**: Send one vibe per user (prevents duplicates)
- **Daily Limits**: 
  - Free users: 10 vibes per day
  - Premium users: Unlimited vibes
- **Profile Visibility**: Users without profile images cannot send or receive vibes

### 3. Matching System
- **Mutual Adjective Match**: Match occurs when both users select the **same adjective** for each other
- **Match Notifications**: Instant notification when a match is created
- **Match Display**: Matches appear in Inbox with the shared adjective

### 4. Inbox & Likes
- **Likes Tab**: Shows all vibes/adjectives received from other users
- **Matches Tab**: Displays all mutual matches
- **Match Details**: Shows the adjective both users selected
- **24-Hour Expiry**: Vibes and matches disappear after 24 hours

### 5. Messaging System
- **Premium Messaging**: Only premium users can initiate conversations
- **Reply for Free**: Non-premium users can reply to messages they've received
- **Match Messaging**: Matched users can message each other directly
- **Message Requests**: Premium users can send message requests to people who liked them
- **Request Flow**: 
  - Premium user sees who liked them in Inbox
  - Can send message request with the adjective they received
  - Recipient sees request: "{Name} wants to message you, they think you're {adjective}"
  - Recipient can accept or decline
  - If accepted, creates a match and moves conversation to Matches

### 6. Message Requests
- **Sending Requests**: Only premium users can send message requests
- **Request Inbox**: Pending requests appear in Messages → Requests tab
- **Accept/Decline**: Recipients can accept (creates match) or decline (removes from inbox)
- **Auto-Match**: Accepted requests automatically create matches

### 7. Premium Features
- **Unlimited Vibes**: No daily limit on sending vibes
- **Send Messages**: Can initiate conversations with matches or via message requests
- **Send Message Requests**: Can request to message people who liked them
- **Skip Profiles**: Can skip profiles in Discover screen

### 8. Profile Features
- **Personal Note**: 40-character note that appears as popup when others view your profile
- **Profile Image**: Required for public profile and vibe sending
- **Read-Only Fields**: Email, college, and year cannot be changed after signup
- **Editable Fields**: Name, skills, note, and image can be updated anytime

### 9. User Interface
- **Discover Screen**: Main swiping interface with profile cards
- **Inbox Screen**: Matches and likes received
- **Messages Screen**: Conversations and message requests
- **Profile Screen**: View and edit user profile
- **Chat Screen**: One-on-one messaging interface

---

## Analytics Dashboard Metrics

### User Metrics
- **Total Users**: Count of all registered users
- **New Signups**: Daily/weekly/monthly new user registrations
- **Active Users**: Users who logged in within last 7/30 days
- **Profile Completion Rate**: % of users with uploaded profile images
- **Premium Conversion**: % of users who upgraded to premium
- **User Retention**: Daily/weekly/monthly active users

### Engagement Metrics
- **Vibes Sent**: Total and daily vibes sent (breakdown by free vs premium)
- **Vibes Received**: Total vibes received per user
- **Match Rate**: % of vibes that resulted in matches
- **Total Matches**: Count of all matches created
- **Average Vibes per User**: Mean vibes sent per active user
- **Vibe-to-Match Conversion**: Ratio of vibes sent to matches created

### Messaging Metrics
- **Messages Sent**: Total messages sent (breakdown by premium vs non-premium)
- **Messages Received**: Total messages received
- **Active Conversations**: Number of ongoing chat conversations
- **Average Messages per Conversation**: Mean messages per chat
- **Response Rate**: % of messages that received replies
- **Time to First Message**: Average time from match to first message

### Message Request Metrics
- **Requests Sent**: Total message requests sent (premium only)
- **Requests Received**: Total message requests received
- **Acceptance Rate**: % of requests that were accepted
- **Decline Rate**: % of requests that were declined
- **Request-to-Match Conversion**: % of accepted requests that created matches

### Premium Metrics
- **Premium Users**: Total count of premium subscribers
- **Premium Conversion Rate**: % of free users who upgraded
- **Premium Revenue**: Total revenue from premium subscriptions
- **Premium Engagement**: Average vibes/messages sent by premium vs free users
- **Premium Retention**: % of premium users who remain active

### Feature Usage Metrics
- **Profile Image Uploads**: Count of users with uploaded images
- **Note Usage**: % of users who added a personal note
- **Skip Feature Usage**: Number of profiles skipped by premium users
- **Daily Vibe Limits Hit**: Count of free users who hit 10-vibe limit

### Time-Based Analytics
- **Peak Usage Times**: Hours/days with highest activity
- **Daily Active Users (DAU)**: Users active per day
- **Weekly Active Users (WAU)**: Users active per week
- **Monthly Active Users (MAU)**: Users active per month
- **Growth Trends**: Week-over-week and month-over-month growth

### User Journey Metrics
- **Signup to First Vibe**: Average time from signup to first vibe sent
- **Vibe to Match**: Average time from sending vibe to getting matched
- **Match to Message**: Average time from match to first message
- **Onboarding Completion**: % of users who complete profile setup
- **Drop-off Points**: Where users abandon the app (signup, profile, first vibe, etc.)

### Engagement Funnels
1. **Signup → Profile Complete → First Vibe → Match → Message**
2. **Vibe Sent → Vibe Received → Match → Message Request → Accepted → Message**
3. **Free User → Premium User → Message Request Sent → Accepted → Match**

### Cohort Analysis
- **Signup Cohorts**: Track behavior of users by signup date
- **Premium Cohorts**: Track behavior of users by premium upgrade date
- **Engagement Cohorts**: Compare engagement levels across different user groups

### Geographic & Demographic Metrics
- **College Distribution**: Users by college
- **Year Distribution**: Users by academic year
- **Gender Distribution**: User gender breakdown
- **Most Active Colleges**: Colleges with highest user engagement

### Content Metrics
- **Most Popular Adjectives**: Which adjectives are selected most often
- **Match Adjectives**: Which adjectives result in most matches
- **Negative Adjective Usage**: How often negative adjectives are selected

---

## Key Business Metrics to Track

1. **User Acquisition Cost (CAC)**: Cost to acquire each new user
2. **Lifetime Value (LTV)**: Average revenue per user over their lifetime
3. **LTV:CAC Ratio**: Should be > 3:1 for healthy business
4. **Churn Rate**: % of users who stop using the app
5. **Premium Churn**: % of premium users who cancel
6. **Viral Coefficient**: Number of new users each existing user brings
7. **Engagement Score**: Composite metric combining vibes, matches, messages
8. **Feature Adoption Rate**: % of users using each feature

---

## Recommended Dashboard Views

### Executive Dashboard
- Total users, active users, premium users
- Revenue metrics
- Key conversion rates (signup → premium, vibe → match)
- Growth trends

### Product Dashboard
- Feature usage statistics
- User journey funnels
- Engagement metrics
- Drop-off analysis

### Marketing Dashboard
- User acquisition channels
- Cohort performance
- Geographic distribution
- Growth trends

### Operations Dashboard
- Daily active users
- Peak usage times
- System health metrics
- Error rates

---

## Data Collection Points

All user actions should be tracked with timestamps:
- User signup/login
- Profile creation/updates
- Vibe sent/received
- Match created
- Message sent/received
- Message request sent/accepted/declined
- Premium upgrade
- Profile image upload
- Feature usage (skip, etc.)

---

## Notes

- All matches and vibes expire after 24 hours
- Users can only send one vibe per person
- Profile images are required for public profiles
- Premium is required to send messages (but free users can reply)
- Premium is required to send message requests
- Message requests automatically create matches when accepted
