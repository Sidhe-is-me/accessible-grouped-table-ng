import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessibleMultiSelect } from './accessible-multi-select';
import { LiveAnnouncer } from '@angular/cdk/a11y';

interface Row {
  id: string; parent: string | null;
  division: string; producer: string; statusName: string; releaseYear: string; title: string;
}
interface RenderRow {
  row: Row; level: number; kind: 'parent' | 'child' | 'solo';
  pos?: number; setsize?: number; parentId?: string; orphan?: boolean; contextOnly?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, AccessibleMultiSelect],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  cols = [
    { id: 'group', label: 'Group' },
    { id: 'division', label: 'Division' },
    { id: 'projectId', label: 'Project ID' },
    { id: 'producer', label: 'Producer' },
    { id: 'statusName', label: 'Status' },
    { id: 'releaseYear', label: 'Release Year' },
    { id: 'title', label: 'Title' },
  ];

  data: Row[] = [
    { id: 'WDAS-1001', parent: null, division: 'Walt Disney Animation', producer: 'A. Rivera', statusName: 'In Production', releaseYear: '2027', title: 'Aurora Falls (franchise)' },
    { id: 'WDAS-1001-01', parent: 'WDAS-1001', division: 'Walt Disney Animation', producer: 'A. Rivera', statusName: 'Released', releaseYear: '2014', title: 'Aurora Falls' },
    { id: 'WDAS-1001-02', parent: 'WDAS-1001', division: 'Walt Disney Animation', producer: 'A. Rivera', statusName: 'Released', releaseYear: '2019', title: 'Aurora Falls II' },
    { id: 'WDAS-1001-03', parent: 'WDAS-1001', division: 'Walt Disney Animation', producer: 'A. Rivera', statusName: 'In Production', releaseYear: '2027', title: 'Aurora Falls III' },
    { id: 'MARVEL-2002', parent: null, division: 'Marvel Studios', producer: 'M. Chen', statusName: 'In Production', releaseYear: '2026', title: 'Sentinels (initiative)' },
    { id: 'MARVEL-2002-01', parent: 'MARVEL-2002', division: 'Marvel Studios', producer: 'M. Chen', statusName: 'Post-Production', releaseYear: '2025', title: 'Sentinels: Rising' },
    { id: 'MARVEL-2002-02', parent: 'MARVEL-2002', division: 'Marvel Studios', producer: 'M. Chen', statusName: 'In Development', releaseYear: '2027', title: 'Sentinels: Eclipse' },
    { id: 'PIXAR-3003', parent: null, division: 'Pixar', producer: 'J. Okafor', statusName: 'In Development', releaseYear: '2026', title: 'Tidepool' },
    { id: 'LUCAS-4004', parent: null, division: 'Lucasfilm', producer: 'A. Rivera', statusName: 'Post-Production', releaseYear: '2026', title: 'Outer Rim Chronicles' },
    { id: 'DPLUS-5005', parent: null, division: 'Disney+', producer: 'L. Park', statusName: 'Released', releaseYear: '2024', title: 'Harbor Lights' },
    { id: 'NATGEO-6006', parent: null, division: 'National Geographic', producer: 'R. Singh', statusName: 'In Production', releaseYear: '2026', title: 'Deep Current' },
  ];

  expanded = new Set<string>(['WDAS-1001', 'MARVEL-2002']);
  fDivision: string[] = [];
  fProducer: string[] = [];
  fStatus: string[] = [];
  fYear: string[] = [];
  fProjectId = '';
  fTitle = '';
  sortCol: string | null = null;
  sortDir: 'ascending' | 'descending' | null = null;

  constructor(private live: LiveAnnouncer) {}

  childrenOf(id: string) { return this.data.filter(r => r.parent === id); }
  isParent(r: Row) { return this.childrenOf(r.id).length > 0; }
  options(col: keyof Row) { return [...new Set(this.data.map(r => r[col] as string))].filter(Boolean); }

  private anyActive() {
    return !!(this.fDivision.length || this.fProducer.length || this.fStatus.length || this.fYear.length || this.fProjectId || this.fTitle);
  }
  private matches(r: Row): boolean {
    if (this.fDivision.length && !this.fDivision.includes(r.division)) return false;
    if (this.fProducer.length && !this.fProducer.includes(r.producer)) return false;
    if (this.fStatus.length && !this.fStatus.includes(r.statusName)) return false;
    if (this.fYear.length && !this.fYear.includes(r.releaseYear)) return false;
    if (this.fProjectId && !r.id.toLowerCase().includes(this.fProjectId.toLowerCase())) return false;
    if (this.fTitle && !r.title.toLowerCase().includes(this.fTitle.toLowerCase())) return false;
    return true;
  }
  private descMatch(r: Row): boolean { return this.childrenOf(r.id).some(c => this.matches(c) || this.descMatch(c)); }
  private visible(r: Row): boolean { return !this.anyActive() ? true : (this.matches(r) || this.descMatch(r)); }

  private sortVal(r: Row) { return this.sortCol === 'group' ? r.id : (r as any)[this.sortCol!] ?? ''; }
  private sortRows(arr: Row[]): Row[] {
    if (!this.sortCol || !this.sortDir) return arr;
    const out = [...arr].sort((a, b) => String(this.sortVal(a)).localeCompare(String(this.sortVal(b)), undefined, { numeric: true, sensitivity: 'base' }));
    return this.sortDir === 'descending' ? out.reverse() : out;
  }

  get renderRows(): RenderRow[] {
    const out: RenderRow[] = [];
    const roots = this.sortRows(this.data.filter(r => r.parent === null && this.visible(r)));
    for (const root of roots) {
      const parent = this.isParent(root);
      const contextOnly = parent && !this.matches(root) && this.anyActive();
      out.push({ row: root, level: 1, kind: parent ? 'parent' : 'solo', contextOnly });
      if (parent && this.expanded.has(root.id)) {
        const kids = this.sortRows(this.childrenOf(root.id).filter(r => this.visible(r)));
        kids.forEach((kid, i) => out.push({
          row: kid, level: 2, kind: 'child', pos: i + 1, setsize: kids.length,
          parentId: root.id, orphan: !this.matches(root) && this.anyActive(),
        }));
      }
    }
    return out;
  }

  childIds(r: Row) { return this.childrenOf(r.id).map(c => 'row-' + c.id).join(' '); }
  parentLabel(r: Row) {
    const n = this.childrenOf(r.id).length;
    return `Project ${r.id}: parent of ${n} projects, ${this.expanded.has(r.id) ? 'expanded — activate to collapse' : 'collapsed — activate to expand'}`;
  }
  cellValue(r: Row, col: string) { return col === 'group' || col === 'projectId' ? r.id : (r as any)[col]; }

  toggle(id: string) { this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id); }
  expandAll() { this.data.forEach(r => { if (this.isParent(r)) this.expanded.add(r.id); }); }
  collapseAll() { this.expanded.clear(); }

  ariaSort(col: string) { return this.sortCol === col && this.sortDir ? this.sortDir : 'none'; }
  sortArrow(col: string) { return this.sortCol === col && this.sortDir ? (this.sortDir === 'ascending' ? '▲' : '▼') : ''; }
  sortBy(col: string) {
    if (this.sortCol !== col) { this.sortCol = col; this.sortDir = 'ascending'; }
    else if (this.sortDir === 'ascending') { this.sortDir = 'descending'; }
    else { this.sortCol = null; this.sortDir = null; }
    const label = this.cols.find(c => c.id === col)?.label;
    this.live.announce(this.sortDir ? `Sorted by ${label}, ${this.sortDir}` : 'Sorting cleared');
  }

  onFilterChange() {
    const shown = this.renderRows.length;
    this.live.announce(this.anyActive() ? `Showing ${shown} of ${this.data.length} projects` : `${this.data.length} projects shown`);
  }
}
