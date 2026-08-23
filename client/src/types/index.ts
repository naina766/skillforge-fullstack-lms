export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type CourseType = 'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'WEBINAR';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  learningGoals?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Lesson {
  _id?: string;
  title: string;
  description?: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT';
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  resources?: string[];
}

export interface Module {
  _id?: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  type: CourseType;
  category: Category;
  instructor: User;
  level: CourseLevel;
  duration: number;
  language: string;
  price: number;
  discountedPrice?: number;
  skills: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  curriculum: Module[];
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  location?: string;
  meetingUrl?: string;
  capacity?: number;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  status: CourseStatus;
  publishedAt?: string;
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  status: EnrollmentStatus;
  progress: string[];
  completedLessons: number;
  completionPercentage: number;
  currentLesson?: string;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  certificateIssued: boolean;
}

export interface Review {
  _id: string;
  course: string;
  student: User;
  rating: number;
  comment: string;
  isModerated: boolean;
  createdAt: string;
}

export interface CareerAssessment {
  level: string;
  targetRole: string;
}

export interface LearningPathPhase {
  phase: number;
  title: string;
  skills: string[];
}

export interface AIRecommendationItem {
  course: Course;
  matchReason: string;
  priority: 'HIGH' | 'MEDIUM';
}

export interface AIProjectItem {
  title: string;
  skills: string[];
}

export interface AIMentorStructuredResponse {
  version: string;
  message: string;
  careerAssessment: CareerAssessment;
  skillGaps: string[];
  learningPath: LearningPathPhase[];
  recommendations: AIRecommendationItem[];
  projects: AIProjectItem[];
  nextAction: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'ENROLLMENT' | 'COURSE_UPDATE' | 'CERTIFICATE' | 'RECOMMENDATION' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Certificate {
  _id: string;
  certificateId: string;
  student: User;
  course: Course;
  issueDate: string;
  verificationHash: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: Pagination;
  };
}
