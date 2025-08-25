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

function parseProgressValue(value: string): any {
  if (!value) return value;
  
  // Try to parse as JSON first
  try {
    return JSON.parse(value);
  } catch {
    // If not JSON, try common boolean/number patterns
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    const numValue = Number(value);
    if (!isNaN(numValue) && value !== '') {
      return numValue;
    }
    
    return value; // Return as string
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, course_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing required parameter: user_id' });
    }

    const sheets = getGoogleSheetsClient();

    // Get the sheet metadata to find the first sheet
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const firstSheet = sheetInfo.data.sheets?.[0];
    if (!firstSheet?.properties?.title) {
      throw new Error('No sheets found in spreadsheet');
    }

    const sheetName = firstSheet.properties.title;

    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:H`,
    });

    const rows = response.data.values || [];
    
    if (rows.length <= 1) {
      // No data or only headers
      return res.status(200).json({ rows: [] });
    }

    // Skip header row and filter by user_id (and optionally course_id)
    const dataRows = rows.slice(1).filter(row => {
      if (row.length < 6) return false; // Ensure minimum columns
      
      const rowUserId = row[0];
      const rowCourseId = row[1];
      
      if (rowUserId !== user_id) return false;
      if (course_id && rowCourseId !== course_id) return false;
      
      return true;
    });

    // Transform rows to objects
    const result = dataRows.map(row => ({
      user_id: row[0] || '',
      course_id: row[1] || '',
      lesson_id: row[2] || '',
      task_id: row[3] || '',
      progress_type: row[4] || '',
      progress_value: parseProgressValue(row[5] || ''),
      updated_at: row[6] || '',
      source: row[7] || 'web'
    }));

    return res.status(200).json({ rows: result });

  } catch (error) {
    console.error('Error reading progress:', error);
    return res.status(500).json({ 
      error: 'Failed to read progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}