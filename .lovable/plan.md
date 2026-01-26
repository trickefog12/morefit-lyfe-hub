
# Auto-Publishing Reviews with Content Moderation

## Overview

Currently, when users submit reviews, they see a message that the review "will appear after approval." You want to:
1. **Remove manual approval** - Reviews should be visible to everyone immediately
2. **Add automatic content filtering** - Block reviews with profanity, offensive content, or inappropriate behavior

This plan implements a content moderation system that checks reviews before publishing. Clean reviews appear instantly; inappropriate ones are blocked with a friendly error message.

---

## How It Will Work

```text
User submits review
        ↓
  Content Filter Check
        ↓
    ┌─────┴─────┐
    ↓           ↓
  CLEAN      BLOCKED
    ↓           ↓
Published    Error shown
immediately  to user
```

- **Clean reviews**: Instantly visible to the entire community (no waiting)
- **Blocked reviews**: User gets a friendly message asking them to revise their wording
- **Admin dashboard**: Will show all reviews (can still delete inappropriate ones that slip through)

---

## Changes Summary

### 1. Backend Function (New)
Create a `moderate-review` backend function that:
- Receives the review text before it's saved
- Checks for profanity and offensive content in English and Greek
- Returns whether the review is acceptable or needs revision

### 2. Database Change
- Change the `reviews` table default so new reviews are automatically approved (`approved = true`)
- Update the RLS policy so all reviews are visible (not just approved ones)

### 3. Review Form Update
- Call the moderation function before saving
- If blocked, show a friendly message asking user to revise
- If clean, save and show immediately
- Update success message (no more "will appear after approval")

### 4. Translation Updates
- Update Greek message from "Θα εμφανιστεί μετά την έγκριση" to "Η κριτική σας δημοσιεύτηκε!"
- Update English message from "will appear after approval" to "Your review has been published!"
- Add new messages for when content is blocked

### 5. Admin Dashboard Update
- Simplify the moderation view (no more "pending" section needed)
- Keep delete functionality for any reviews that slip through the filter

---

## Content Moderation Approach

The moderation will detect:
- **Profanity** in English and Greek
- **Offensive language** targeting individuals or groups
- **Spam patterns** (excessive caps, repeated characters)
- **Personal attacks** against the creator or community

The filter is configured to be reasonable - it won't block normal criticism or negative feedback, only truly inappropriate content.

---

## Technical Details

### New Backend Function: `moderate-review`
- Uses a curated word list for English and Greek profanity
- Checks for common evasion techniques (l33t speak, spacing tricks)
- Returns `{ approved: true }` or `{ approved: false, reason: "..." }`
- No external API needed - runs entirely on the backend

### Database Migration
```sql
-- Change default for new reviews to be auto-approved
ALTER TABLE reviews ALTER COLUMN approved SET DEFAULT true;

-- Update RLS policy to show all reviews (moderation happens before insert)
```

### Files to Modify
- `supabase/functions/moderate-review/index.ts` (new)
- `src/components/ReviewForm.tsx` (add moderation check)
- `src/hooks/useReviews.ts` (simplify query - remove approved filter)
- `src/contexts/LanguageContext.tsx` (update messages)
- `src/components/admin/ReviewModeration.tsx` (simplify UI)

---

## User Experience After Implementation

**For reviewers:**
- Submit a review → Appears immediately (no waiting!)
- If inappropriate language detected → Friendly message: "Please revise your review. Some words aren't appropriate for our community."

**For the community:**
- Reviews appear in real-time
- No more "pending approval" delays

**For admins:**
- Dashboard shows all published reviews
- Can delete any problematic reviews that slip through
- Audit log still tracks all moderation actions
