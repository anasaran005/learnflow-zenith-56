# LMS with Google Sheets Integration

A Learning Management System with Firebase Authentication and Google Sheets backend for progress tracking.

## Environment Setup

### Required Environment Variables

Create these environment variables in your Vercel deployment:

```bash
GOOGLE_PROJECT_ID=omega-progress-sheet
GOOGLE_CLIENT_EMAIL=lms-progress-writer@omega-progress-sheet.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Google Sheets Setup

1. **Sheet URL**: https://docs.google.com/spreadsheets/d/1Bt-b8zvBPZZoDUfizdMVQ5PjLMdohKQe5SGcg0Eas8A/edit
2. **Permissions**: Share with `lms-progress-writer@omega-progress-sheet.iam.gserviceaccount.com` (Editor access)
3. **Schema**: The first sheet should have these headers (A1:H1):
   - A: user_id
   - B: course_id  
   - C: lesson_id
   - D: task_id
   - E: progress_type
   - F: progress_value
   - G: updated_at
   - H: source

## API Endpoints

### POST /api/progress/write
Saves progress to Google Sheets.

**Request:**
```json
{
  "user_id": "firebase_uid",
  "course_id": "course_1", 
  "lesson_id": "lesson_1",
  "task_id": "task_1",
  "progress_type": "completed_tasks",
  "progress_value": true
}
```

### GET /api/progress/read
Reads progress from Google Sheets.

**Query params:**
- `user_id` (required): Firebase UID
- `course_id` (optional): Filter by course

## Testing

1. **Verify Environment**: Check that all environment variables are set in Vercel
2. **Test Sheet Access**: Ensure service account has editor permissions on the sheet
3. **User Flow**: 
   - Login with Firebase auth
   - Complete a task/lesson
   - Verify data appears in Google Sheets
   - Reload page and verify progress persists

## Development

```bash
npm install
npm run dev
```

The app will read from Google Sheets API for all progress display and write to it on every progress event.