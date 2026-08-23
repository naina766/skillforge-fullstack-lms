import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { Clock, Users, Calendar, Sparkles, Bookmark, Zap, Award, BookOpen } from 'lucide-react';
import { wishlistApi } from '../../api/wishlistApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { getProgramIllustration } from '../home/FeaturedProgramsSection';

interface CourseCardProps {
  course: Course;
  isWishlistedInitial?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isWishlistedInitial = false }) => {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [isWishlisted, setIsWishlisted] = React.useState(isWishlistedInitial);
  const [isWishlistLoading, setIsWishlistLoading] = React.useState(false);

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

  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'INTERMEDIATE':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'ADVANCED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const imageSrc = getProgramIllustration(course);

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl glass-card border border-slate-800/80 hover:border-brand-500/50 transition-all duration-300 overflow-hidden hover:shadow-glow-blue hover:-translate-y-1"
      aria-label={`Course: ${course.title}`}
    >
      {/* Course Image Header with Aspect-Video Container */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden rounded-t-2xl">
        <img
          src={imageSrc}
          alt={`${course.title} program`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <Badge variant={isWorkshop ? 'cyan' : course.type === 'BOOTCAMP' ? 'purple' : 'blue'}>
              {isWorkshop ? (
                <Zap className="w-3 h-3 text-cyan-400" />
              ) : course.type === 'BOOTCAMP' ? (
                <Award className="w-3 h-3 text-purple-400" />
              ) : (
                <BookOpen className="w-3 h-3 text-brand-400" />
              )}
              <span>{course.type}</span>
            </Badge>
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/90 text-dark-950 uppercase tracking-wide shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <button
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
            className="pointer-events-auto p-2 rounded-xl bg-dark-950/80 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:text-rose-400 transition-colors shadow-sm cursor-pointer"
            title="Save to Wishlist"
            aria-label="Save to Wishlist"
          >
            <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Level Pill */}
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-semibold text-brand-400">{course.category?.name || 'Development'}</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getLevelBadge(course.level)}`}>
              {course.level.toLowerCase().replace('_', ' ')}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {course.shortDescription}
          </p>
        </div>

        {/* Meta Stats */}
        <div className="space-y-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <Rating value={course.rating} count={course.reviewCount} />
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.round(course.duration / 60)} hrs</span>
            </div>
          </div>

          {/* Workshop Date or Enrolled Students */}
          {isWorkshop && course.startDate ? (
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Starts {new Date(course.startDate).toLocaleDateString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.enrollmentCount} enrolled</span>
            </div>
          )}

          {/* Price Header & Interactive CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white">
                {currentPrice === 0 ? <span className="text-emerald-400">Free</span> : `$${currentPrice}`}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-500 line-through font-medium">${course.price}</span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 group-hover:bg-brand-600 group-hover:border-brand-500 group-hover:text-white transition-all shadow-sm">
              <span>View Details</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
