import mongoose from 'mongoose';
import https from 'https';
import http from 'http';
import { Course } from '../models/Course';
import { env } from '../config/env';

const checkUrlStatus = (urlStr: string): Promise<{ url: string; status: number; ok: boolean }> => {
  return new Promise((resolve) => {
    try {
      if (!urlStr || !urlStr.startsWith('http')) {
        return resolve({ url: urlStr, status: 0, ok: false });
      }
      const client = urlStr.startsWith('https') ? https : http;
      const req = client.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        resolve({ url: urlStr, status: res.statusCode || 0, ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400 });
      });
      req.on('error', () => {
        resolve({ url: urlStr, status: 500, ok: false });
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ url: urlStr, status: 408, ok: false });
      });
    } catch {
      resolve({ url: urlStr, status: 0, ok: false });
    }
  });
};

const verifyImages = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log('=== VERIFYING ALL COURSE IMAGE URLS ===');

  const courses = await Course.find().select('title slug thumbnail').lean();
  console.log(`Auditing ${courses.length} courses...`);

  for (const c of courses) {
    const res = await checkUrlStatus(c.thumbnail);
    console.log(`Course: "${c.title}"`);
    console.log(`  Thumbnail: ${c.thumbnail || '[EMPTY]'}`);
    console.log(`  HTTP Status: ${res.status} | Reachable: ${res.ok ? '✓ YES' : '❌ NO'}`);
    console.log('--------------------------------------------------');
  }

  await mongoose.disconnect();
};

verifyImages().catch(console.error);
