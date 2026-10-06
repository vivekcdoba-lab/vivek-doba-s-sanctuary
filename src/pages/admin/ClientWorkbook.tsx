import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientWorkbook() {
  return <div>
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">Client Workbook V2.1</h1>
      <Button asChild variant="outline">
        <a href="/workbooks/vdbm-client-workbook.html" target="_blank" rel="noopener noreferrer">
          Open in new tab <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </header>
    <iframe src="/workbooks/vdbm-client-workbook.html" title="VDBM Client Workbook" className="h-[calc(100vh-120px)] w-full rounded-lg border-0" />
  </div>;
}