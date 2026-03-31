import { useState } from 'react';
import { RESOURCES, COURSES } from '@/data/mockData';
import { STORY_LIBRARY } from '@/data/storyLibrary';
import { FileText, Headphones, Video, FileSpreadsheet, Search, Download, Eye, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';

const typeIcon: Record<string, any> = { pdf: FileText, audio: Headphones, video: Video, worksheet: FileSpreadsheet };
const categories = ['All', 'Course Materials', 'Worksheets', 'Meditation', 'Affirmations', 'Templates', 'Books'];
const langColors: Record<string, string> = { EN: 'bg-sky-blue/10 text-sky-blue', MR: 'bg-saffron/10 text-saffron', HI: 'bg-lotus-pink/10 text-lotus-pink' };

const ResourcesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'resources' | 'stories'>('resources');
  const [storySource, setStorySource] = useState('all');

  const filtered = RESOURCES.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || r.category === category;
    return matchSearch && matchCat;
  });

  const filteredStories = STORY_LIBRARY.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.theme.toLowerCase().includes(search.toLowerCase());
    const matchSource = storySource === 'all' || s.source === storySource;
    return matchSearch && matchSource;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resource Library</h1>
          <p className="text-sm text-muted-foreground">{RESOURCES.length} resources • {STORY_LIBRARY.length} stories</p>
        </div>
        <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90">
          + Upload Resource
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📁 Resources
        </button>
        <button onClick={() => setActiveTab('stories')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stories' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📖 Story Library
        </button>
      </div>

      {activeTab === 'resources' ? (
        <>
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
        </>
      ) : (
        <>
          {/* Story Library */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search stories by title or theme..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['all', 'ramayana', 'mahabharata', 'other'].map(src => (
                <button key={src} onClick={() => setStorySource(src)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${storySource === src ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {src === 'all' ? 'All' : src.charAt(0).toUpperCase() + src.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {filteredStories.map(story => (
              <div key={story.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{story.title}</h3>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {story.theme.split(', ').map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Source</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        story.source === 'ramayana' ? 'bg-saffron/10 text-saffron' :
                        story.source === 'mahabharata' ? 'bg-chakra-indigo/10 text-chakra-indigo' :
                        'bg-muted text-muted-foreground'
                      }`}>{story.source}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Times Used</span>
                      <span className="font-medium text-foreground">{story.times_used}</span>
                    </div>
                    {story.effective_with && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Most effective with: </span>
                        <span className="text-foreground">{story.effective_with}</span>
                      </div>
                    )}
                    {story.last_used_seeker && (
                      <div className="text-xs text-muted-foreground">
                        Last used: {story.last_used_seeker}, {story.last_used_session}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {((activeTab === 'resources' && filtered.length === 0) || (activeTab === 'stories' && filteredStories.length === 0)) && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📁</span>
          <p className="text-muted-foreground">No results match your search.</p>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
