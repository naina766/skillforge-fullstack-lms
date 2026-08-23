import { Category } from '../models/Category';
import { AppError } from '../utils/appError';
import { createSlug } from '../utils/slugify';

export class CategoryService {
  static async getAllCategories() {
    let categories = await Category.find().sort({ name: 1 });

    // Auto-seed default categories if database is empty
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Web Development', slug: 'web-development', description: 'Frontend, backend, and full-stack software development.', icon: 'Code' },
        { name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Cloud infrastructure, Docker, Kubernetes, and CI/CD pipelines.', icon: 'Cloud' },
        { name: 'AI & Data Science', slug: 'ai-data-science', description: 'Machine learning, generative AI, and data engineering.', icon: 'Cpu' },
        { name: 'Mobile Development', slug: 'mobile-development', description: 'iOS, Android, React Native, and Flutter development.', icon: 'Smartphone' },
        { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Application security, penetration testing, and cloud security.', icon: 'Shield' },
        { name: 'System Design', slug: 'system-design', description: 'Distributed systems, microservices, and system architecture.', icon: 'Server' },
      ];

      await Category.insertMany(defaultCategories);
      categories = await Category.find().sort({ name: 1 });
    }

    return categories;
  }

  static async createCategory(name: string, description?: string, icon?: string) {
    const slug = createSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new AppError('Category with this name already exists.', 409, 'CATEGORY_EXISTS');
    }

    return Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || '',
    });
  }
}
