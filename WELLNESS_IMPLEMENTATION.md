# Mental Health & Wellness - Technical Implementation
## Classcheck.in MVP (6-Week Sprint)

---

## 🎯 Approved Scope

Based on stakeholder decisions:
- **Audience:** Students + Educators
- **Privacy:** Private by Default (opt-in sharing)
- **MVP Features:** Mood check-ins, Break reminders, Wellness dashboard
- **Tone:** "Student Wellness Tools"
- **Market:** India first
- **Pricing:** Freemium (basic free, premium ₹149/month)
- **Integration:** Dashboard integration
- **Data:** Research + Product improvement (anonymized)

---

## 📊 Database Schema

### New Tables

```sql
-- Core wellness tracking
CREATE TABLE wellness_checkins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    mood_score TINYINT NOT NULL, -- 1-5 (1=Very Stressed, 5=Great)
    stress_level ENUM('low', 'medium', 'high', 'very_high') NOT NULL,
    energy_level TINYINT, -- 1-5
    journal_entry TEXT NULL, -- Optional detailed entry
    checkin_type ENUM('daily', 'post_quiz', 'post_study') DEFAULT 'daily',
    is_anonymous BOOLEAN DEFAULT FALSE, -- For aggregate stats
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_date (user_id, created_at),
    INDEX idx_mood_analysis (mood_score, stress_level, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User wellness preferences and settings
CREATE TABLE wellness_settings (
    user_id BIGINT PRIMARY KEY,

    -- Break reminder settings
    break_reminders_enabled BOOLEAN DEFAULT TRUE,
    break_interval_minutes INT DEFAULT 25, -- Pomodoro default
    break_duration_minutes INT DEFAULT 5,
    reminder_sound ENUM('gentle', 'chime', 'silent') DEFAULT 'gentle',

    -- Privacy settings
    share_with_educators BOOLEAN DEFAULT FALSE,
    share_aggregate_only BOOLEAN DEFAULT TRUE, -- True = educators see trends, not details
    educator_alert_threshold ENUM('high', 'very_high', 'disabled') DEFAULT 'very_high',

    -- Notification preferences
    daily_checkin_reminder BOOLEAN DEFAULT TRUE,
    checkin_reminder_time TIME DEFAULT '20:00:00', -- 8 PM default
    wellness_insights_enabled BOOLEAN DEFAULT TRUE,

    -- Premium features
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Study session tracking (for break reminders)
CREATE TABLE study_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP NULL, -- NULL if ongoing
    subject VARCHAR(100) NULL,
    activity_type ENUM('flashcards', 'notes', 'quiz', 'general') DEFAULT 'general',
    breaks_taken INT DEFAULT 0,
    total_break_minutes INT DEFAULT 0,
    session_rating TINYINT NULL, -- 1-5, asked at end
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_sessions (user_id, session_start),
    INDEX idx_active_sessions (session_end), -- NULL sessions are active
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Break activities log
CREATE TABLE break_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    study_session_id BIGINT NULL,
    break_start TIMESTAMP NOT NULL,
    break_end TIMESTAMP NULL,
    break_type ENUM('scheduled', 'manual', 'forced') DEFAULT 'scheduled',
    activity_taken ENUM('breathing', 'walk', 'hydration', 'stretch', 'meditation', 'other', 'skipped') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_breaks (user_id, break_start),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (study_session_id) REFERENCES study_sessions(id) ON DELETE SET NULL
);

-- Wellness insights and recommendations
CREATE TABLE wellness_insights (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    insight_type ENUM('pattern', 'achievement', 'recommendation', 'alert') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    data_json JSON NULL, -- Additional context (e.g., chart data)
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL, -- Time-sensitive insights
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_unread (user_id, is_read, created_at),
    INDEX idx_priority (priority, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Educator alerts (when students opt-in)
CREATE TABLE educator_wellness_alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    educator_id BIGINT NOT NULL,
    alert_type ENUM('high_stress', 'declining_wellness', 'missed_checkins', 'burnout_risk') NOT NULL,
    severity ENUM('medium', 'high', 'critical') DEFAULT 'medium',
    message TEXT NOT NULL,
    data_summary JSON NULL, -- Aggregate data, not detailed entries
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_educator_alerts (educator_id, is_acknowledged, created_at),
    INDEX idx_student_alerts (student_id, created_at),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (educator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wellness resources library
CREATE TABLE wellness_resources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('meditation', 'breathing', 'article', 'video', 'crisis_hotline', 'tip') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    content_url VARCHAR(500) NULL, -- External link or internal path
    duration_minutes INT NULL, -- For meditations/videos
    thumbnail_url VARCHAR(500) NULL,
    tags JSON NULL, -- ["anxiety", "exam-stress", "sleep"]
    target_region VARCHAR(50) DEFAULT 'IN', -- Country code
    is_premium BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_type_region (type, target_region, is_active),
    INDEX idx_premium (is_premium, is_active),
    FULLTEXT idx_search (title, description)
);

-- User resource interactions
CREATE TABLE wellness_resource_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    action ENUM('view', 'complete', 'favorite', 'rate') NOT NULL,
    rating TINYINT NULL, -- 1-5, only for 'rate' action
    duration_seconds INT NULL, -- How long they engaged
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_usage (user_id, created_at),
    INDEX idx_resource_stats (resource_id, action),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES wellness_resources(id) ON DELETE CASCADE
);

-- Analytics snapshots (for performance optimization)
CREATE TABLE wellness_analytics_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    snapshot_date DATE NOT NULL,

    -- Mood metrics
    avg_mood_score DECIMAL(3,2),
    mood_variance DECIMAL(3,2),
    high_stress_days INT DEFAULT 0,

    -- Study patterns
    total_study_minutes INT DEFAULT 0,
    total_break_minutes INT DEFAULT 0,
    avg_session_length INT DEFAULT 0,
    breaks_taken INT DEFAULT 0,

    -- Engagement
    checkins_completed INT DEFAULT 0,
    resources_accessed INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_date (user_id, snapshot_date),
    INDEX idx_user_timeline (user_id, snapshot_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoints

### Base URL: `/api/v1/wellness`

#### 1. Mood Check-ins

```
POST /checkins
Create a new wellness check-in

Request Body:
{
  "mood_score": 3,           // 1-5 required
  "stress_level": "medium",  // required
  "energy_level": 4,         // optional
  "journal_entry": "Had a tough exam today...", // optional
  "checkin_type": "daily"    // optional
}

Response: 201 Created
{
  "id": 12345,
  "mood_score": 3,
  "stress_level": "medium",
  "created_at": "2025-11-23T14:30:00Z",
  "insight": {
    "message": "Your stress is higher than usual. Consider taking a break.",
    "suggestion": "Try a 5-minute breathing exercise"
  }
}
```

```
GET /checkins
Get user's check-in history

Query Params:
- start_date (ISO date)
- end_date (ISO date)
- limit (default: 30)
- offset (default: 0)

Response: 200 OK
{
  "checkins": [
    {
      "id": 12345,
      "mood_score": 3,
      "stress_level": "medium",
      "created_at": "2025-11-23T14:30:00Z"
    },
    ...
  ],
  "total": 45,
  "has_more": true
}
```

```
GET /checkins/stats
Get aggregated check-in statistics

Query Params:
- period (day|week|month) default: week

Response: 200 OK
{
  "period": "week",
  "avg_mood_score": 3.5,
  "avg_stress_level": "medium",
  "trend": "improving", // improving|declining|stable
  "high_stress_days": 2,
  "total_checkins": 5,
  "checkin_streak": 12, // consecutive days
  "mood_distribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 2,
    "5": 0
  }
}
```

#### 2. Break Reminders & Study Sessions

```
POST /study-sessions/start
Start a study session

Request Body:
{
  "subject": "Mathematics", // optional
  "activity_type": "flashcards" // optional
}

Response: 201 Created
{
  "session_id": 789,
  "started_at": "2025-11-23T15:00:00Z",
  "next_break_at": "2025-11-23T15:25:00Z", // Based on user settings
  "break_interval_minutes": 25
}
```

```
POST /study-sessions/:id/end
End a study session

Request Body:
{
  "session_rating": 4 // optional, 1-5
}

Response: 200 OK
{
  "session_id": 789,
  "duration_minutes": 52,
  "breaks_taken": 2,
  "productivity_score": 85 // calculated metric
}
```

```
POST /study-sessions/:id/break
Log a break during session

Request Body:
{
  "activity_taken": "breathing" // optional
}

Response: 201 Created
{
  "break_id": 456,
  "break_start": "2025-11-23T15:25:00Z",
  "recommended_duration_minutes": 5
}
```

```
POST /study-sessions/:id/break/:break_id/end
End a break

Response: 200 OK
{
  "break_duration_minutes": 5,
  "next_break_at": "2025-11-23T15:55:00Z"
}
```

#### 3. Settings

```
GET /settings
Get user's wellness settings

Response: 200 OK
{
  "break_reminders_enabled": true,
  "break_interval_minutes": 25,
  "break_duration_minutes": 5,
  "reminder_sound": "gentle",
  "share_with_educators": false,
  "share_aggregate_only": true,
  "educator_alert_threshold": "very_high",
  "daily_checkin_reminder": true,
  "checkin_reminder_time": "20:00:00",
  "wellness_insights_enabled": true,
  "is_premium": false
}
```

```
PATCH /settings
Update wellness settings

Request Body: (partial updates allowed)
{
  "break_interval_minutes": 30,
  "share_with_educators": true
}

Response: 200 OK
{
  "updated": true,
  "settings": { ...updated settings... }
}
```

#### 4. Dashboard & Analytics

```
GET /dashboard
Get wellness dashboard data

Query Params:
- period (week|month|semester) default: week

Response: 200 OK
{
  "overview": {
    "avg_mood_score": 3.8,
    "trend": "improving",
    "wellness_score": 75, // 0-100 calculated metric
    "streak_days": 12
  },
  "mood_chart": [
    { "date": "2025-11-17", "mood": 4, "stress": "low" },
    { "date": "2025-11-18", "mood": 3, "stress": "medium" },
    ...
  ],
  "study_patterns": {
    "total_study_hours": 24,
    "avg_session_length_minutes": 45,
    "break_adherence_rate": 0.85 // 85% of recommended breaks taken
  },
  "insights": [
    {
      "type": "pattern",
      "title": "Your best study time",
      "description": "You're most productive between 2-4 PM",
      "action": "Schedule tough subjects during this window"
    },
    ...
  ],
  "recommendations": [
    {
      "type": "breathing",
      "title": "Quick stress relief",
      "resource_id": 42
    }
  ]
}
```

```
GET /insights
Get personalized wellness insights

Query Params:
- unread_only (boolean) default: false
- limit (default: 10)

Response: 200 OK
{
  "insights": [
    {
      "id": 999,
      "type": "achievement",
      "title": "12-day check-in streak! 🎉",
      "description": "You've checked in daily for 12 days. Keep it up!",
      "priority": "low",
      "is_read": false,
      "created_at": "2025-11-23T08:00:00Z"
    },
    ...
  ]
}
```

```
PATCH /insights/:id/read
Mark insight as read

Response: 200 OK
{
  "id": 999,
  "is_read": true
}
```

#### 5. Resources

```
GET /resources
Get wellness resources library

Query Params:
- type (meditation|breathing|article|video|crisis_hotline|tip)
- tags (comma-separated: "anxiety,exam-stress")
- is_premium (boolean)
- limit (default: 20)
- offset (default: 0)

Response: 200 OK
{
  "resources": [
    {
      "id": 42,
      "type": "meditation",
      "title": "5-Minute Exam Calm",
      "description": "Quick guided meditation for pre-exam anxiety",
      "content_url": "/media/meditations/exam-calm.mp3",
      "duration_minutes": 5,
      "thumbnail_url": "/media/thumbnails/exam-calm.jpg",
      "tags": ["anxiety", "exam-stress"],
      "is_premium": false,
      "rating_avg": 4.5,
      "rating_count": 234
    },
    ...
  ],
  "total": 56,
  "has_more": true
}
```

```
POST /resources/:id/interact
Log resource interaction

Request Body:
{
  "action": "view", // view|complete|favorite|rate
  "rating": 5, // required if action=rate
  "duration_seconds": 300 // optional
}

Response: 201 Created
{
  "interaction_logged": true
}
```

```
GET /resources/crisis
Get crisis support resources (always free)

Response: 200 OK
{
  "hotlines": [
    {
      "name": "KIRAN Mental Health Helpline",
      "phone": "1800-599-0019",
      "available": "24/7",
      "language": ["Hindi", "English", "Regional"],
      "country": "IN"
    },
    ...
  ],
  "immediate_help": {
    "message": "If you're in crisis, please call one of these helplines immediately.",
    "resources": [ ...local counseling centers... ]
  }
}
```

#### 6. Educator APIs (Student must opt-in)

```
GET /educator/students
Get wellness overview of students (aggregate only)

Query Params:
- class_id (optional)
- alert_level (medium|high|critical)

Response: 200 OK
{
  "students": [
    {
      "student_id": 123,
      "student_name": "Anonymous Student A", // If share_aggregate_only=true
      "wellness_score": 45, // 0-100
      "trend": "declining",
      "last_checkin": "2025-11-22T20:15:00Z",
      "days_since_checkin": 1,
      "alert_level": "medium",
      "sharing_level": "aggregate_only"
    },
    ...
  ],
  "class_wellness_avg": 68,
  "students_at_risk": 3
}
```

```
GET /educator/alerts
Get wellness alerts for students

Query Params:
- unacknowledged_only (boolean) default: true
- limit (default: 20)

Response: 200 OK
{
  "alerts": [
    {
      "id": 555,
      "student_id": 123,
      "student_name": "Rahul Kumar", // If student opted in
      "alert_type": "high_stress",
      "severity": "high",
      "message": "Student has reported high stress for 5 consecutive days",
      "data_summary": {
        "avg_stress_level": "high",
        "checkins_last_week": 7,
        "trend": "worsening"
      },
      "is_acknowledged": false,
      "created_at": "2025-11-23T09:00:00Z"
    },
    ...
  ]
}
```

```
POST /educator/alerts/:id/acknowledge
Acknowledge an alert

Request Body:
{
  "action_taken": "Spoke with student, referred to counselor" // optional
}

Response: 200 OK
{
  "alert_id": 555,
  "acknowledged": true,
  "acknowledged_at": "2025-11-23T10:30:00Z"
}
```

---

## 🎨 UI/UX Specifications

### 1. Daily Mood Check-in Modal

**Trigger:**
- Popup at user-set time (default 8 PM)
- After completing a quiz
- Manual via "Check-in" button in dashboard

**Design:**
```
┌─────────────────────────────────────┐
│   How are you feeling today? 🌟     │
├─────────────────────────────────────┤
│                                     │
│  Tap your mood:                     │
│                                     │
│   😰    😟    😐    🙂    😊       │
│  Very  Low   Okay  Good  Great     │
│ Stressed              Mood         │
│                                     │
│  Your stress level:                 │
│  ◉ Low  ○ Medium  ○ High           │
│                                     │
│  [Optional: Add a note...]          │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│    [Skip]        [Submit ✓]        │
└─────────────────────────────────────┘

After submission:
┌─────────────────────────────────────┐
│  Thanks for checking in! 💙         │
├─────────────────────────────────────┤
│  Insight: Your stress is higher     │
│  than usual this week.              │
│                                     │
│  💡 Try: 5-min breathing exercise   │
│  [Start Now]  [View Dashboard]      │
└─────────────────────────────────────┘
```

### 2. Break Reminder Notification

**Desktop (Browser notification):**
```
╔══════════════════════════════════╗
║ Classcheck.in                    ║
║ ⏰ Time for a break!             ║
║ You've been studying for 25 min  ║
║                                  ║
║ [Take 5-min break]  [10 min more]║
╚══════════════════════════════════╝
```

**In-app Banner:**
```
┌────────────────────────────────────────┐
│ ⏰ Break Time! You've been focused for │
│ 25 minutes. Take a 5-minute break?    │
│                                        │
│ [🧘 Breathing] [🚶 Walk] [Skip] [⏸️ Snooze] │
└────────────────────────────────────────┘
```

### 3. Wellness Dashboard (Integrated)

**Location:** Main dashboard, new "Wellness" section

```
┌──────────────────────────────────────────────────────────┐
│  Student Dashboard                                        │
│  [Attendance] [Flashcards] [Quizzes] [Wellness] ← new    │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Your Wellness This Week                       🌱 75/100│
│                                                          │
│  😊 Mood Trend: ↗️ Improving    🔥 12-day streak        │
│                                                          │
│  Mood Over Time:                                        │
│  😊 5 │     ○                                           │
│  🙂 4 │   ○   ○     ○                                   │
│  😐 3 │ ○       ○                                       │
│  😟 2 │                                                  │
│  😰 1 │                                                  │
│      └──────────────────────────────                    │
│        Mon Tue Wed Thu Fri Sat Sun                      │
│                                                          │
│  ✨ Insights for You:                                   │
│  ┌─────────────────────────────────────────────┐        │
│  │ 🎯 You're most productive 2-4 PM             │        │
│  │ 📚 Best focus after 15-min breaks            │        │
│  │ ⚠️  Stress spiked on quiz days - try prep earlier│   │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  Study Balance:                                         │
│  📖 24 hrs study  |  ☕ 2 hrs breaks (85% adherence)   │
│                                                          │
│  Quick Actions:                                         │
│  [Daily Check-in] [Start Focus Session] [Resources]    │
└─────────────────────────────────────────────────────────┘
```

### 4. Study Session Timer (Side Panel)

**During Active Session:**
```
┌───────────────────────┐
│ 🎯 Focus Session      │
│                       │
│      18:24            │
│   Time until break    │
│                       │
│ Subject: Math         │
│ Activity: Flashcards  │
│                       │
│ [Take Break Now]      │
│ [End Session]         │
└───────────────────────┘
```

**Break Mode:**
```
┌───────────────────────┐
│ ☕ Break Time         │
│                       │
│      03:12            │
│   Remaining           │
│                       │
│ Try:                  │
│ [🧘 Breathing (2min)] │
│ [🚶 Stretch (3min)]   │
│ [💧 Hydrate]          │
│                       │
│ [Resume Studying]     │
└───────────────────────┘
```

### 5. Wellness Resources Library

```
┌────────────────────────────────────────────────────┐
│  Wellness Resources                      [Search 🔍]│
│                                                     │
│  Filters: [All] [Meditation] [Breathing] [Crisis]  │
│           [Articles] [Tips]                        │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🧘 5-Minute Exam Calm                        │  │
│  │ Quick guided meditation for test anxiety    │  │
│  │ ⏱️ 5 min  |  ⭐ 4.5 (234)  |  🆓 Free        │  │
│  │ [▶️ Play]                                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 💨 Box Breathing Technique             [PRO]│  │
│  │ 4-4-4-4 breathing for instant calm          │  │
│  │ ⏱️ 3 min  |  ⭐ 4.8 (567)                    │  │
│  │ [🔒 Upgrade to Access]                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ⚠️  Crisis Support                                │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📞 KIRAN Helpline: 1800-599-0019            │  │
│  │ 24/7 Mental Health Support (Free)           │  │
│  │ [Call Now]  [Chat]                          │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 6. Educator Wellness Dashboard

```
┌──────────────────────────────────────────────────────┐
│  Class Wellness Overview                             │
│  Class: Math 101-A                         🌱 68/100 │
│                                                       │
│  🔴 3 students need attention                        │
│  🟡 5 students showing declining wellness            │
│  🟢 22 students doing well                           │
│                                                       │
│  Recent Alerts:                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ ⚠️  Anonymous Student A - High stress (5 days) │  │
│  │ Avg mood: 2/5  |  Last check-in: 1 day ago    │  │
│  │ [Acknowledge]  [View Trends]                   │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ ⚠️  Rahul Kumar - Declining wellness           │  │
│  │ (Student opted in to share name)               │  │
│  │ Trend: ↘️ Worsening | Missed 3 check-ins      │  │
│  │ [Contact Student]  [Acknowledge]               │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  Class Wellness Trend:                               │
│  📊 [Chart showing aggregate mood over time]         │
│                                                       │
│  High-Stress Periods Detected:                       │
│  • Nov 15-17: Midterm exam week (avg stress: high)  │
│  • Nov 22: Assignment deadline (avg mood: 2.8/5)    │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Frontend Components (React)

### Component Structure

```
src/
├── components/
│   ├── wellness/
│   │   ├── MoodCheckinModal.tsx
│   │   ├── BreakReminderBanner.tsx
│   │   ├── StudySessionTimer.tsx
│   │   ├── WellnessDashboard.tsx
│   │   ├── WellnessChart.tsx (mood over time)
│   │   ├── InsightCard.tsx
│   │   ├── ResourceCard.tsx
│   │   ├── ResourceLibrary.tsx
│   │   ├── WellnessSettings.tsx
│   │   ├── EducatorWellnessOverview.tsx
│   │   └── EducatorAlertCard.tsx
│   └── ...
├── hooks/
│   ├── useWellness.ts
│   ├── useStudySession.ts
│   ├── useBreakReminder.ts
│   └── ...
├── services/
│   ├── wellnessApi.ts
│   └── ...
├── store/
│   ├── wellnessSlice.ts (Redux/Zustand)
│   └── ...
└── ...
```

### Key React Hooks

```typescript
// hooks/useWellness.ts
export function useWellness() {
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodScore | null>(null);

  const submitCheckin = async (data: CheckinData) => {
    // API call
  };

  const getStats = async (period: 'week' | 'month') => {
    // API call
  };

  return {
    isCheckinOpen,
    setIsCheckinOpen,
    submitCheckin,
    getStats,
    currentMood
  };
}

// hooks/useStudySession.ts
export function useStudySession() {
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [timeUntilBreak, setTimeUntilBreak] = useState<number>(0);
  const [isOnBreak, setIsOnBreak] = useState(false);

  useEffect(() => {
    // Timer logic
  }, [activeSession]);

  const startSession = async () => { /* ... */ };
  const endSession = async () => { /* ... */ };
  const takeBreak = async () => { /* ... */ };
  const resumeStudying = async () => { /* ... */ };

  return {
    activeSession,
    timeUntilBreak,
    isOnBreak,
    startSession,
    endSession,
    takeBreak,
    resumeStudying
  };
}

// hooks/useBreakReminder.ts
export function useBreakReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [settings, setSettings] = useState<WellnessSettings | null>(null);

  useEffect(() => {
    // Browser notification logic
    // Check permissions, schedule notifications
  }, [settings]);

  return {
    showReminder,
    dismissReminder: () => setShowReminder(false),
    snoozeReminder: (minutes: number) => { /* ... */ }
  };
}
```

---

## 🔐 Security & Privacy Implementation

### 1. Data Encryption

```javascript
// Encrypt sensitive journal entries at rest
const encryptJournalEntry = (plaintext, userKey) => {
  // Use AES-256-GCM
  return encrypt(plaintext, userKey);
};

// Backend: Only decrypt when user requests their own data
```

### 2. Access Control

```javascript
// Middleware for wellness data access
function ensureWellnessAccess(req, res, next) {
  const { userId } = req.params;
  const { user } = req.session;

  // Students can only access their own data
  if (user.role === 'student' && user.id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Educators can only access students who opted in
  if (user.role === 'educator') {
    const student = await getStudentSharingSettings(userId);
    if (!student.share_with_educators || !isTeacherOfStudent(user.id, userId)) {
      return res.status(403).json({ error: 'Student has not shared data' });
    }
  }

  next();
}
```

### 3. Anonymization for Aggregates

```sql
-- Educator queries always use aggregate functions
SELECT
  'Anonymous Student ' || ROW_NUMBER() OVER (ORDER BY user_id) as student_name,
  AVG(mood_score) as avg_mood,
  COUNT(*) as checkin_count
FROM wellness_checkins
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND user_id IN (SELECT student_id FROM enrollments WHERE educator_id = ?)
  AND user_id IN (SELECT user_id FROM wellness_settings WHERE share_aggregate_only = TRUE)
GROUP BY user_id;
```

### 4. Audit Logging

```sql
CREATE TABLE wellness_access_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  accessor_id BIGINT NOT NULL, -- Who accessed
  accessed_user_id BIGINT NOT NULL, -- Whose data
  access_type ENUM('view_dashboard', 'view_alert', 'view_detail') NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_accessed_user (accessed_user_id, created_at),
  FOREIGN KEY (accessor_id) REFERENCES users(id),
  FOREIGN KEY (accessed_user_id) REFERENCES users(id)
);
```

---

## 🤖 ML/AI Components

### 1. Burnout Risk Prediction (Phase 2)

```python
# burnout_detection.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

class BurnoutDetector:
    def __init__(self):
        self.model = RandomForestClassifier()

    def extract_features(self, user_id):
        """
        Features:
        - Avg mood score (last 7 days)
        - Mood variance (volatility)
        - Study hours (last 7 days)
        - Performance trend (quiz scores)
        - Break adherence rate
        - High stress days count
        - Checkin completion rate
        """
        features = {
            'avg_mood_7d': get_avg_mood(user_id, days=7),
            'mood_variance': get_mood_variance(user_id, days=7),
            'study_hours': get_study_hours(user_id, days=7),
            'performance_trend': get_performance_slope(user_id, days=14),
            'break_adherence': get_break_adherence(user_id, days=7),
            'high_stress_days': get_high_stress_count(user_id, days=7),
            'checkin_rate': get_checkin_rate(user_id, days=7)
        }
        return features

    def predict_risk(self, user_id):
        features = self.extract_features(user_id)
        risk_score = self.model.predict_proba([features])[0][1]  # Probability of burnout

        if risk_score > 0.7:
            return {'level': 'high', 'score': risk_score}
        elif risk_score > 0.4:
            return {'level': 'medium', 'score': risk_score}
        else:
            return {'level': 'low', 'score': risk_score}
```

### 2. Personalized Insights Generator

```python
# insights_generator.py

def generate_insights(user_id):
    insights = []

    # Pattern: Best study time
    hourly_performance = get_performance_by_hour(user_id)
    best_hour = max(hourly_performance, key=hourly_performance.get)
    insights.append({
        'type': 'pattern',
        'title': 'Your peak productivity time',
        'description': f'You perform best between {best_hour}:00-{best_hour+2}:00',
        'action': 'Schedule difficult subjects during this window'
    })

    # Achievement: Streak
    streak = get_checkin_streak(user_id)
    if streak >= 7:
        insights.append({
            'type': 'achievement',
            'title': f'{streak}-day check-in streak! 🎉',
            'description': 'Consistency builds resilience. Keep it up!',
            'priority': 'low'
        })

    # Alert: High stress correlation
    stress_quiz_correlation = analyze_stress_performance(user_id)
    if stress_quiz_correlation > 0.6:
        insights.append({
            'type': 'alert',
            'title': 'Stress impacting performance',
            'description': 'Your quiz scores drop 15% on high-stress days',
            'action': 'Try stress management before exams',
            'priority': 'high'
        })

    return insights
```

---

## 🚀 6-Week Sprint Plan

### Week 1: Foundation
- [ ] Database schema implementation
- [ ] API endpoint scaffolding (all routes)
- [ ] Basic authentication & authorization
- [ ] Set up React components structure

### Week 2: Mood Check-ins
- [ ] Implement check-in API (POST, GET, stats)
- [ ] Build MoodCheckinModal component
- [ ] Add check-in history view
- [ ] Basic insights (streak tracking)

### Week 3: Break Reminders
- [ ] Study session tracking API
- [ ] Break reminder logic (timers)
- [ ] Browser notification setup
- [ ] StudySessionTimer component
- [ ] Break logging

### Week 4: Wellness Dashboard
- [ ] Dashboard API with aggregations
- [ ] WellnessChart component (Chart.js)
- [ ] InsightCard components
- [ ] Integration with main dashboard

### Week 5: Resources & Settings
- [ ] Wellness resources API & database
- [ ] Seed initial resources (10 meditations, crisis hotlines)
- [ ] ResourceLibrary component
- [ ] Settings page & API
- [ ] Privacy controls UI

### Week 6: Educator Features & Testing
- [ ] Educator wellness overview API
- [ ] Alert system implementation
- [ ] EducatorWellnessOverview component
- [ ] End-to-end testing
- [ ] Bug fixes & polish
- [ ] Beta deployment

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// MoodCheckinModal.test.tsx
describe('MoodCheckinModal', () => {
  it('submits mood data correctly', async () => {
    const { getByRole } = render(<MoodCheckinModal />);
    // Click mood 4
    fireEvent.click(getByRole('button', { name: /good mood/i }));
    // Select medium stress
    fireEvent.click(getByRole('radio', { name: /medium/i }));
    // Submit
    fireEvent.click(getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith({
        mood_score: 4,
        stress_level: 'medium'
      });
    });
  });
});
```

### Integration Tests
```javascript
// wellness-flow.test.ts
describe('Wellness Flow', () => {
  it('completes full check-in to dashboard flow', async () => {
    // 1. Submit check-in
    await submitCheckin({ mood_score: 3, stress_level: 'high' });

    // 2. Verify dashboard updated
    const stats = await getDashboardStats();
    expect(stats.avg_mood_score).toBe(3);

    // 3. Verify insight generated
    const insights = await getInsights();
    expect(insights).toContainEqual(
      expect.objectContaining({ type: 'alert' })
    );
  });
});
```

### E2E Tests (Playwright)
```javascript
// e2e/wellness.spec.ts
test('student can complete daily check-in', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for check-in modal (if scheduled)
  await page.click('text=Check-in');

  // Select mood
  await page.click('[data-mood="4"]');

  // Select stress
  await page.click('input[value="medium"]');

  // Submit
  await page.click('button:has-text("Submit")');

  // Verify success message
  await expect(page.locator('text=Thanks for checking in')).toBeVisible();
});
```

---

## 📊 Analytics & Monitoring

### Key Metrics to Track

```javascript
// Analytics events
analytics.track('wellness_checkin_completed', {
  user_id: userId,
  mood_score: moodScore,
  stress_level: stressLevel,
  checkin_type: 'daily',
  time_taken_seconds: 12
});

analytics.track('break_reminder_shown', {
  user_id: userId,
  study_duration_minutes: 25,
  response: 'taken' | 'snoozed' | 'dismissed'
});

analytics.track('wellness_resource_accessed', {
  user_id: userId,
  resource_id: resourceId,
  resource_type: 'meditation',
  is_premium: false
});

analytics.track('educator_alert_triggered', {
  student_id: studentId,
  educator_id: educatorId,
  alert_type: 'high_stress',
  severity: 'high'
});
```

### Dashboard Metrics
- Daily Active Users (using wellness features)
- Check-in completion rate
- Break adherence rate
- Average wellness score
- Alert response time (educators)
- Premium conversion rate
- Resource engagement

---

## 💰 Pricing & Monetization

### Free Tier (Student Basic)
- ✅ Daily mood check-ins (unlimited)
- ✅ Basic break reminders
- ✅ 7-day wellness dashboard
- ✅ 3 free meditation tracks
- ✅ Crisis resources (always free)
- ✅ Basic insights

### Premium Wellness (₹149/month or ₹1,499/year)
- ✅ All free features
- ✅ **Full meditation library** (50+ tracks)
- ✅ **Advanced analytics** (30-day trends, correlations)
- ✅ **Personalized insights** (AI-powered recommendations)
- ✅ **Customizable break intervals**
- ✅ **Export wellness reports** (PDF)
- ✅ **Ad-free experience**

### Educator Pro (₹79/month - existing plan)
**Added wellness features:**
- ✅ Class wellness overview
- ✅ At-risk student alerts
- ✅ Aggregate analytics
- ✅ Intervention tracking

### Institutional Plan (Custom pricing)
- ✅ Unlimited student wellness access
- ✅ Full educator dashboard
- ✅ Dedicated counselor portal (Phase 3)
- ✅ Custom wellness programs
- ✅ White-label resources
- ✅ Compliance reporting
- ✅ Priority support

---

## 🎯 Success Criteria (MVP)

By end of 6 weeks, we should have:

### Functionality
- [ ] Students can complete daily mood check-ins
- [ ] Break reminders work during study sessions
- [ ] Wellness dashboard shows mood trends
- [ ] Basic insights are generated
- [ ] Educators can see aggregate class wellness (opt-in)
- [ ] Crisis resources are accessible

### Performance
- [ ] Check-in completion <3 seconds
- [ ] Dashboard loads <2 seconds
- [ ] 99.5% API uptime

### Adoption (Beta)
- [ ] 100 student beta testers
- [ ] 60%+ daily check-in rate
- [ ] 70%+ break adherence rate
- [ ] 20+ educator accounts testing
- [ ] <5% opt-out rate (privacy concerns)

### Business
- [ ] 10% premium upgrade interest (survey)
- [ ] 3+ institutional partnership discussions
- [ ] Media coverage secured (EdTech blogs)

---

## 📚 Documentation & Training

### For Students
- Quick start guide: "How to use Wellness Tools"
- FAQ: Privacy, data sharing, opting out
- Video tutorial: Daily check-ins and breaks

### For Educators
- Guide: "Interpreting Wellness Alerts"
- Best practices: "Supporting Student Wellness"
- Training webinar recording

### For Developers
- API documentation (Swagger/OpenAPI)
- Component documentation (Storybook)
- Database schema diagrams
- Deployment guide

---

## 🔄 Post-MVP Roadmap

### Phase 2 (Weeks 7-14): Intelligence
- Burnout detection ML model
- AI wellness coach (A.Xel integration)
- Advanced personalized insights
- Wearable integration (Fitbit)

### Phase 3 (Weeks 15-26): Scale
- Parent portal
- Community features (forums)
- Counselor appointment booking
- Multi-language support (Hindi, Tamil, etc.)

### Phase 4 (6+ months): Innovation
- AR/VR wellness experiences
- Peer support matching
- Research partnerships
- White-label for institutions

---

## 📞 Support & Resources

### Crisis Support Integration (India)
```javascript
const CRISIS_RESOURCES = {
  IN: [
    {
      name: 'KIRAN Mental Health Helpline',
      phone: '1800-599-0019',
      available: '24/7',
      languages: ['Hindi', 'English', 'Regional']
    },
    {
      name: 'Vandrevala Foundation',
      phone: '1860-2662-345',
      available: '24/7',
      languages: ['Hindi', 'English']
    },
    {
      name: 'iCall (TISS)',
      phone: '9152987821',
      email: 'icall@tiss.edu',
      available: 'Mon-Sat, 8 AM - 10 PM'
    }
  ]
};
```

---

## ✅ Next Steps

1. **Review & Approve** this implementation plan
2. **Set up development environment**
3. **Create GitHub project** with issues for each task
4. **Begin Week 1 sprint** (Database + API scaffolding)
5. **Daily standups** to track progress
6. **Weekly demos** to stakeholders

**Ready to start building?** 🚀

Let me know if you'd like me to:
- Start implementing the database schema
- Create the API routes
- Build the React components
- Set up the project structure
- Or make any adjustments to this plan!
