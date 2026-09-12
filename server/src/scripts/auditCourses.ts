import mongoose from 'mongoose';
import { Course } from '../models/Course';
import { Review } from '../models/Review';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { env } from '../config/env';

const runAudit = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log('--- SKILLFORGE GLOBAL COURSE AUDIT ---');

  const courses = await Course.find()
    .populate('category', 'name slug')
    .populate('instructor', 'name')
    .lean();

  console.log(`Total Courses in Database: ${courses.length}\n`);

  for (const c of courses) {
    const reviews = await Review.find({ course: c._id });
    const modulesCount = c.curriculum?.length || 0;
    const lessonsCount = c.curriculum?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
    const totalLessonDurationSec = c.curriculum?.reduce(
      (acc: number, m: any) => acc + (m.lessons?.reduce((lAcc: number, l: any) => lAcc + (l.duration || 0), 0) || 0),
      0
    ) || 0;

    const discountInfo = c.discountedPrice && c.discountedPrice < c.price
      ? `$${c.discountedPrice} (orig: $${c.price}, SAVE $${c.price - c.discountedPrice})`
      : `$${c.price} (No discount)`;

    console.log(`Course: "${c.title}"`);
    console.log(`  Slug: ${c.slug}`);
    console.log(`  Category: ${(c.category as any)?.name || 'NONE'}`);
    console.log(`  Price: ${discountInfo}`);
    console.log(`  Modules: ${modulesCount} | Lessons: ${lessonsCount} | Lesson Duration: ${Math.round(totalLessonDurationSec / 60)} min (Canonical: ${c.duration} min)`);
    console.log(`  Stored Rating: ${c.rating} (${c.reviewCount} reviews) | Actual Review Docs: ${reviews.length}`);
    console.log(`  Thumbnail: ${c.thumbnail ? 'VALID URL' : 'MISSING'}`);
    console.log('----------------------------------------------------');
  }

  await mongoose.disconnect();
};

runAudit().catch(console.error);
