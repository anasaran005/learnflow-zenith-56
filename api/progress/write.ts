import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_ID = '1Bt-b8zvBPZZoDUfizdMVQ5PjLMdohKQe5SGcg0Eas8A';

// Initialize Google Sheets API client
function getGoogleSheetsClient() {
  if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google Sheets credentials in environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, course_id, lesson_id = '', task_id = '', progress_type, progress_value } = req.body;

    if (!user_id || !course_id || !progress_type || progress_value === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, course_id, progress_type, progress_value' 
      });
    }

    const sheets = getGoogleSheetsClient();
    const now = new Date().toISOString();
    
    // Convert progress_value to string for storage
    let valueStr: string;
    if (typeof progress_value === 'object') {
      valueStr = JSON.stringify(progress_value);
    } else {
      valueStr = String(progress_value);
    }

    // Prepare row data
    const rowData = [
      user_id,
      course_id,
      lesson_id,
      task_id,
      progress_type,
      valueStr,
      now,
      'web'
    ];

    // Get the sheet metadata to find the first sheet
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const firstSheet = sheetInfo.data.sheets?.[0];
    if (!firstSheet?.properties?.title) {
      throw new Error('No sheets found in spreadsheet');
    }

    const sheetName = firstSheet.properties.title;

    // Check if headers exist, if not create them
    try {
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1:H1`,
      });

      if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${sheetName}!A1:H1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['user_id', 'course_id', 'lesson_id', 'task_id', 'progress_type', 'progress_value', 'updated_at', 'source']]
          },
        });
      }
    } catch (error) {
      console.warn('Error checking/setting headers:', error);
    }

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:H`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    console.log(`Progress saved: ${user_id} - ${progress_type} - ${course_id}`);
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Error saving progress:', error);
    return res.status(500).json({ 
      error: 'Failed to save progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}