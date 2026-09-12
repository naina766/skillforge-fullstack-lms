import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import { Badge } from '../ui/Badge';
import { Star, Clock, Users, Calendar, Bookmark, Zap, Award, BookOpen, ArrowRight, Video } from 'lucide-react';
import { wishlistApi } from '../../api/wishlistApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { CourseImage } from './CourseImage';

interface CourseCardProps {
  course: Course;
  isWishlistedInitial?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isWishlistedInitial = false }) => {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [isWishlisted, setIsWishlisted] = React.useState(isWishlistedInitial);
  const [isWishlistLoading, setIsWishlistLoading] = React.useState(false);

  const isWorkshop = course.type === 'WORKSHOP';
  const isBootcamp = course.type === 'BOOTCAMP';
  const isWebinar = course.type === 'WEBINAR';

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
        addToast('info', 'Course removed from wishlist');
      } else {
        await wishlistApi.addToWishlist(course._id);
        setIsWishlisted(true);
        addToast('success', 'Course added to wishlist');
      }
    } catch {
      addToast('error', 'Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const originalPrice = course.price;
  const currentPrice = course.discountedPrice || course.price;
  const hasDiscount = !!course.discountedPrice && course.discountedPrice < originalPrice;
  const savings = hasDiscount ? originalPrice - currentPrice : 0;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round((savings / originalPrice) * 100)
    : 0;

  const categoryName = typeof course.category === 'object' ? course.category?.name : course.category || 'Software Engineering';

  const getCtaText = () => {
    if (isWorkshop) return 'View Workshop';
    if (isBootcamp) return 'View Bootcamp';
    if (isWebinar) return 'Join Webinar';
    return 'View Course';
  };

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col justify-between rounded-3xl glass-card border border-slate-800/80 hover:border-brand-500/50 transition-all duration-300 overflow-hidden hover:shadow-glow-blue hover:-translate-y-1 bg-slate-900/40 select-none"
      aria-label={`Course: ${course.title}`}
    >
      {/* 1. TOP MEDIA & BADGES ANCHOR */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-3xl bg-slate-900">
        <CourseImage
          course={course}
          aspectRatio="aspect-video"
          imgClassName="group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />

        {/* Top Badges Overlay (Non-crowded, clean hierarchy) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Content Type Badge */}
          <Badge
            variant={isWorkshop ? 'cyan' : isBootcamp ? 'purple' : isWebinar ? 'emerald' : 'blue'}
            size="sm"
            className="shadow-md font-bold tracking-wide text-[11px] py-0.5 px-2.5 backdrop-blur-md"
          >
            {isWorkshop ? (
              <Zap className="w-3 h-3 mr-1 text-cyan-300" />
            ) : isBootcamp ? (
              <Award className="w-3 h-3 mr-1 text-purple-300" />
            ) : isWebinar ? (
              <Video className="w-3 h-3 mr-1 text-emerald-300" />
            ) : (
              <BookOpen className="w-3 h-3 mr-1 text-brand-300" />
            )}
            <span>{course.type}</span>
          </Badge>

          {/* Right Action Stack (Discount & Bookmark) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              className="w-8 h-8 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-rose-400 transition-colors shadow-md flex items-center justify-center cursor-pointer"
              title="Save to Wishlist"
              aria-label="Save to Wishlist"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CARD CONTENT AREA */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Skill Level (Single Quiet Metadata Line) */}
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
            <span className="text-brand-400 truncate max-w-[170px]">{categoryName}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{course.level.toLowerCase().replace('_', ' ')}</span>
          </div>

          {/* Course Title (2-line clamped with minimum height for consistent grid rows) */}
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 min-h-[2.75rem] leading-snug">
            {course.title}
          </h3>

          {/* Short Description (2-line clamped) */}
          <p className="text-xs text-slate-400 line-clamp-2 min-h-[2rem] leading-relaxed">
            {course.shortDescription}
          </p>
        </div>

        {/* Quiet Statistics Block */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{course.rating ? course.rating.toFixed(1) : '5.0'}</span>
              <span className="text-slate-400 text-[11px]">({course.reviewCount || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{Math.round(course.duration / 60)}h</span>
            </div>
          </div>

          {/* Workshop Date / Enrolled Learners */}
          {isWorkshop && course.startDate ? (
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
              <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Starts {new Date(course.startDate).toLocaleDateString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Users className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{course.enrollmentCount || 0} learners</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. PRICING & CLEAN FULL-WIDTH CTA FOOTER */}
      <div className="p-5 pt-0 space-y-3 mt-auto">
        {/* Price & Savings Row */}
        <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentPrice === 0 ? <span className="text-emerald-400">Free</span> : `$${currentPrice}`}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through font-semibold">
                ${originalPrice}
              </span>
            )}
          </div>

          {hasDiscount && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              SAVE ${savings}
            </span>
          )}
        </div>

        {/* Full-width Action CTA */}
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 group-hover:bg-brand-600 group-hover:border-brand-500 group-hover:text-white transition-all text-center flex items-center justify-center gap-1.5 shadow-sm">
          <span>{getCtaText()}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
