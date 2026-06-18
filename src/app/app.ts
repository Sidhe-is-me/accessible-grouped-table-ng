import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupedTableComponent, Row, FilterState } from './grouped-table';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GroupedTableComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly build = 'Build: 2026-06-18 · Angular + CdkListbox · v6.2 — Table 6: live 3-way strategy switch + annotated comparison matrix';
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

  // ---- Option C: left drawer filter ----
  drawerOpen = true;
  dFilters: FilterState = { division: [], producer: [], status: [], year: [], projectId: '', title: '', search: '' };

  get divisions() { return [...new Set(this.data.map(r => r.division))]; }
  get statuses() { return [...new Set(this.data.map(r => r.statusName))]; }
  get years() { return [...new Set(this.data.map(r => r.releaseYear))].sort(); }

  isChecked(field: 'division' | 'status', v: string) { return this.dFilters[field].includes(v); }
  toggleCheckbox(field: 'division' | 'status', value: string) {
    const arr = this.dFilters[field];
    const next = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value];
    this.dFilters = { ...this.dFilters, [field]: next };
  }
  setYear(y: string) { this.dFilters = { ...this.dFilters, year: y ? [y] : [] }; }
  setText(field: 'search' | 'projectId', v: string) { this.dFilters = { ...this.dFilters, [field]: v }; }
  clearFilters() { this.dFilters = { division: [], producer: [], status: [], year: [], projectId: '', title: '', search: '' }; }

  // ---- Table 6: live 3-way strategy switch ----
  strategy: 'current' | 'A' | 'B' = 'B';
  get stratTitle() {
    return { current: 'Current behaviour (today)', A: 'Option A — tree-preserving', B: 'Option B — strict' }[this.strategy];
  }
  get stratNote() {
    return {
      current: 'A child can appear with no parent anywhere in view — and only a bare “C” to identify it. A screen reader hears just “C”: no project id, no parent name, and no note that the parent was filtered out. This is the confusion to fix.',
      A: 'The non-matching parent “Aurora Falls (franchise)” stays as a dimmed context row, marked “context — does not match the filter,” with its matching children under it. The hierarchy stays navigable in one result set; the tradeoff is that a row which doesn’t match the filter is still on screen.',
      B: 'Only matches are shown — the parent is dropped. Each orphaned child names its missing parent (“child of WDAS-1001”) and says “parent filtered out,” and the result count is announced. Meets the “filters show only matches” expectation; needs the extra messaging so the orphan isn’t confusing.',
    }[this.strategy];
  }
}
