// pages/api/learning.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const TOPICS_CSV_URL =
  'https://raw.githubusercontent.com/anasaran005/learnflow-zenith-56/a0d9572f1d8cb6a75180cc62ebbace2f75153ec5/coursecsv/pro-training-topics%20-%20Sheet1.csv';
const QUIZ_CSV_URL =
  'https://raw.githubusercontent.com/anasaran005/learnflow-zenith-56/a0d9572f1d8cb6a75180cc62ebbace2f75153ec5/coursecsv/pro-training-Quiz%20Tab%20%20-%20Sheet1.csv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type } = req.query; // "topics" or "quiz"
    const url = type === 'quiz' ? QUIZ_CSV_URL : TOPICS_CSV_URL;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed: ${response.status}`);
    }

    const csvText = await response.text();
    res.status(200).send(csvText); // send raw CSV back to frontend
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
