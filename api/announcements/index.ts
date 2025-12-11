// API route to handle announcement operations
// Note: This implementation won't work with Vercel's ephemeral filesystem
// For production with Vercel, you'll need to migrate to a database service

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data store - in reality, you'd connect to a database like Vercel Postgres, Supabase, etc.
let announcements: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Return all announcements (sorted by creation date)
      res.status(200).json(announcements.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      break;
    case 'POST':
      // Create a new announcement (requires authentication in production)
      const newAnnouncement = {
        id: Date.now().toString(), // In real app, use UUID
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      announcements.push(newAnnouncement);
      res.status(201).json(newAnnouncement);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}