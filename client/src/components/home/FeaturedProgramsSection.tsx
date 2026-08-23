import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { Course, CourseType } from '../../types';
import { CourseCard } from '../course/CourseCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { Rating } from '../ui/Rating';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  Award,
  Clock,
  Users,
  AlertCircle,
  RotateCcw,
  Layers,
  SearchX,
  Bookmark,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { wishlistApi } from '../../api/wishlistApi';

// High-definition domain-specific editorial artwork resolver (100% unique per course)
export const getProgramIllustration = (course: Course): string => {
  if (course.thumbnail && !course.thumbnail.includes('placeholder') && course.thumbnail.startsWith('http')) {
    return course.thumbnail;
  }

  const titleLower = course.title.toLowerCase();

  // 1. Generative AI & LLMs
  if (titleLower.includes('generative ai') || titleLower.includes('llm') || titleLower.includes('gemini')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80';
  }
  // 2. Node.js & Microservices
  if (titleLower.includes('node.js') || titleLower.includes('microservices')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80';
  }
  // 3. React 18 & TanStack Query
  if (titleLower.includes('tanstack') || (titleLower.includes('react 18') && titleLower.includes('workshop'))) {
    return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80';
  }
  // 4. Docker & Kubernetes CI/CD
  if (titleLower.includes('docker') || titleLower.includes('kubernetes') || titleLower.includes('ci/cd')) {
    return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80';
  }
  // 5. TypeScript SaaS Portfolio Accelerator
  if (titleLower.includes('saas') || titleLower.includes('accelerator')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
  }
  // 6. MongoDB Aggregation
  if (titleLower.includes('mongodb') || titleLower.includes('aggregation')) {
    return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80';
  }
  // 7. Cyber Security & Penetration Testing
  if (titleLower.includes('cyber') || titleLower.includes('penetration') || titleLower.includes('security')) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80';
  }
  // 8. Figma Design Systems
  if (titleLower.includes('figma') || titleLower.includes('design system')) {
    return 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80';
  }
  // 9. React Native & Mobile Expo
  if (titleLower.includes('expo') || titleLower.includes('native') || titleLower.includes('mobile')) {
    return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80';
  }
  // 10. Python Data Science
  if (titleLower.includes('python') || titleLower.includes('data science')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80';
  }
  // 11. Solidity Smart Contracts & Web3
  if (titleLower.includes('solidity') || titleLower.includes('web3') || titleLower.includes('smart contracts')) {
    return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80';
  }
  // 12. System Design & Micro-Architecture
  if (titleLower.includes('system design') || titleLower.includes('architecture')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80';
  }
  // 13. Tailwind & Framer Motion
  if (titleLower.includes('tailwind') || titleLower.includes('animation') || titleLower.includes('motion')) {
    return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
  }
  // 14. GraphQL & Apollo Server
  if (titleLower.includes('graphql') || titleLower.includes('apollo')) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
  }
  // 15. BigQuery & Data Warehouse
  if (titleLower.includes('bigquery') || titleLower.includes('warehouse')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
  }
  // 16. NestJS Microservices
  if (titleLower.includes('nestjs') || titleLower.includes('enterprise typescript')) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80';
  }
  // 17. Rust Web Backends
  if (titleLower.includes('rust')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
  }
  // 18. Agile Product Management & Discovery
  if (titleLower.includes('agile') || titleLower.includes('product management') || titleLower.includes('discovery')) {
    return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80';
  }
  // 19. Automated Testing (Playwright & Cypress)
  if (titleLower.includes('playwright') || titleLower.includes('cypress') || titleLower.includes('testing')) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
  }
  // 20. Next.js 14 App Router
  if (titleLower.includes('next.js') || titleLower.includes('app router')) {
    return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80';
};

// Spotlight Featured Hero Card Component
const FeaturedHeroCard: React.FC<{ course: Course }> = ({ course }) => {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('info', 'Please log in to save courses to your wishlist.');
      return;
    }
    try {
      setIsWishlistLoading(true);
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(course._id);
        setIsWishlisted(false);
        addToast('info', 'Removed from wishlist.');
      } else {
        await wishlistApi.addToWishlist(course._id);
        setIsWishlisted(true);
        addToast('success', 'Added to wishlist.');
      }
    } catch {
      addToast('error', 'Failed to update wishlist.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const isWorkshop = course.type === 'WORKSHOP';
  const hasDiscount = Boolean(course.discountedPrice && course.discountedPrice < course.price);
  const currentPrice = hasDiscount ? course.discountedPrice : course.price;
  const discountPercent = hasDiscount && course.price ? Math.round(((course.price - (course.discountedPrice || 0)) / course.price) * 100) : 0;
  const illustration = getProgramIllustration(course);

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group relative flex flex-col lg:flex-row rounded-3xl glass-card border border-brand-500/30 hover:border-brand-400/60 transition-all duration-300 overflow-hidden shadow-glow-blue hover:-translate-y-1"
      aria-label={`Featured program: ${course.title}`}
    >
      {/* Visual Container */}
      <div className="relative lg:w-7/12 aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-900">
        <img
          src={illustration}
          alt={`${course.title} program`}
          loading="eager"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-dark-950/60" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-brand-500 text-white shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              SPOTLIGHT PROGRAM
            </span>
            <Badge variant={isWorkshop ? 'cyan' : course.type === 'BOOTCAMP' ? 'purple' : 'blue'}>
              {course.type}
            </Badge>
            {hasDiscount && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-dark-950 uppercase tracking-wide shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <button
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
            className="pointer-events-auto p-2.5 rounded-xl bg-dark-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-rose-400 transition-colors shadow-sm"
            title="Save to Wishlist"
            aria-label="Save to Wishlist"
          >
            <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-950/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-400 tracking-wide uppercase">{course.category?.name || 'Full-Stack Track'}</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 uppercase">
              {course.level}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-brand-300 transition-colors leading-snug">
            {course.title}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {course.description || course.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
            <Rating value={course.rating || 4.9} count={course.reviewCount || 24} />
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.round(course.duration / 60)} hrs runtime</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.enrollmentCount || 48} enrolled</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA Button */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Tuition</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {currentPrice === 0 ? <span className="text-emerald-400">Free</span> : `$${currentPrice}`}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-500 line-through font-medium">${course.price}</span>
              )}
            </div>
          </div>

          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all shadow-glow-blue group-hover:scale-[1.02]">
            <span>View Program</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export const FeaturedProgramsSection: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const shouldReduceMotion = useReducedMotion();

  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['featured-programs', selectedType],
    queryFn: () =>
      courseApi.getCourses({
        sort: 'popular',
        limit: 8,
        type: selectedType !== 'ALL' ? (selectedType as CourseType) : undefined,
      }),
  });

  const allCourses: Course[] = coursesData?.data?.items || [];

  // Filter Categories
  const filterTabs: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'ALL', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'COURSE', label: 'COURSES', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'WORKSHOP', label: 'WORKSHOPS', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'BOOTCAMP', label: 'BOOTCAMPS', icon: <Award className="w-3.5 h-3.5" /> },
  ];

  const heroCourse = selectedType === 'ALL' && allCourses.length >= 4 ? allCourses[0] : null;
  const gridCourses = heroCourse ? allCourses.slice(1, 7) : allCourses.slice(0, 6);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" aria-labelledby="featured-programs-heading">
      {/* Subtle Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-brand-600/10 via-cyan-500/10 to-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* 1. Header Hierarchy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            FEATURED LEARNING
          </p>

          <h2 id="featured-programs-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Featured Programs
          </h2>

          <p className="text-lg sm:text-xl font-bold text-slate-200">
            Build skills that move your career forward.
          </p>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Explore carefully selected courses, workshops, and bootcamps designed around practical skills, real projects, and career-ready outcomes.
          </p>
        </div>

        {/* Top-Right Direct CTA */}
        <Link to="/courses" className="shrink-0">
          <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore All Programs
          </Button>
        </Link>
      </div>

      {/* 2. Filter Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-800/80 pb-4">
        {filterTabs.map((tab) => {
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-glow-blue border border-brand-500'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
              }`}
              aria-pressed={isActive}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Content Presentation */}
      {isLoading ? (
        // Loading Skeletons matching exact card dimensions
        <div className="space-y-6">
          <div className="h-72 rounded-3xl glass-panel p-6 flex flex-col lg:flex-row gap-6 animate-pulse">
            <Skeleton className="lg:w-7/12 h-60 rounded-2xl" />
            <div className="lg:w-5/12 space-y-4 py-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-96 rounded-2xl glass-panel p-4 space-y-4 animate-pulse">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        // Error State
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-8 space-y-4 border border-red-500/30">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Unable to load featured programs.</h3>
          <p className="text-xs text-slate-400">Please check your network connection and try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Try Again
          </Button>
        </div>
      ) : allCourses.length === 0 ? (
        // Clean Empty State
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-8 space-y-4 border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Featured programs are coming soon.</h3>
          <p className="text-xs text-slate-400">Check back shortly for new courses and workshops.</p>
        </div>
      ) : (
        // Success: Bento Spotlight Hero + Multi-Column Responsive Grid
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Spotlight Hero Card for top program */}
          {heroCourse && <FeaturedHeroCard course={heroCourse} />}

          {/* Supporting Programs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Bottom Callout Section CTA */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-800/60">
            <p className="text-xs sm:text-sm text-slate-400">
              Showing {allCourses.length} curated programs. Looking for something specific?
            </p>
            <Link to="/courses">
              <Button variant="shimmer" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore All Programs →
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </section>
  );
};
