import { COURSES, formatINR, SEEKERS } from '@/data/mockData';
import { Plus, Users, Clock, Star } from 'lucide-react';

const CoursesPage = () => {
  const getEnrolledCount = (courseId: string) => SEEKERS.filter((s) => s.course?.id === courseId && s.enrollment?.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training Programs</h1>
          <p className="text-sm text-muted-foreground">{COURSES.length} programs offered</p>
        </div>
        <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 stagger-children">
        {COURSES.map((course) => (
          <div key={course.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
            {/* Gradient Banner */}
            <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${course.gradient_colors[0]}, ${course.gradient_colors[1]})` }}>
              <div className="absolute inset-0 flex items-center justify-between p-5">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course.tier === 'chakravartin' ? 'shimmer-gold text-primary-foreground' :
                    course.tier === 'platinum' ? 'bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm' :
                    'bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm'
                  }`}>
                    {course.tier === 'chakravartin' ? '👑 By Invitation Only' : course.tier}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-foreground">{formatINR(course.price)}</p>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-foreground mb-1">{course.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{course.tagline}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> {course.duration}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Star className="w-3 h-3" /> {course.format}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" /> Max {course.max_participants}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-dharma-green font-medium">{getEnrolledCount(course.id)} enrolled</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary text-primary hover:bg-primary/5">View</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90">Edit</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
