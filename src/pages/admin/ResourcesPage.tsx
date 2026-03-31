import { useState } from 'react';
import { RESOURCES, COURSES } from '@/data/mockData';
import { FileText, Headphones, Video, FileSpreadsheet, Search, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';

const typeIcon: Record<string, any> = { pdf: FileText, audio: Headphones, video: Video, worksheet: FileSpreadsheet };
const categories = ['All', 'Course Materials', 'Worksheets', 'Meditation', 'Affirmations', 'Templates', 'Books'];
const langColors: Record<string, string> = { EN: 'bg-sky-blue/10 text-sky-blue', MR: 'bg-saffron/10 text-saffron', HI: 'bg-lotus-pink/10 text-lotus-pink' };

const ResourcesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = RESOURCES.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || r.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resource Library</h1>
          <p className="text-sm text-muted-foreground">{RESOURCES.length} resources for transformation</p>
        </div>
        <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90">
          + Upload Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {filtered.map((r) => {
          const Icon = typeIcon[r.type] || FileText;
          const course = r.course_id ? COURSES.find(c => c.id === r.course_id) : null;
          return (
            <div key={r.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {course && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{course.name.slice(0, 25)}</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${langColors[r.language]}`}>{r.language}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{r.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {r.view_count}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {r.download_count}</span>
                  </div>
                  <button className="text-primary hover:underline font-medium">View →</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📁</span>
          <p className="text-muted-foreground">No resources match your search.</p>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
