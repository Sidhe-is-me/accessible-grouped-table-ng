import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessibleMultiSelect } from './accessible-multi-select';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export interface Row {
  id: string; parent: string | null;
  division: string; producer: string; statusName: string; releaseYear: string; title: string;
}
interface RenderRow {
  row: Row; level: number; kind: 'parent' | 'child' | 'solo';
  pos?: number; setsize?: number; parentId?: string; parentTitle?: string; orphan?: boolean; contextOnly?: boolean;
}

@Component({
  selector: 'app-grouped-table',
  standalone: true,
  imports: [FormsModule, AccessibleMultiSelect],
  template: `
<div class="table-wrap">
  <table class="grid" [attr.aria-label]="tableLabel">
    <caption class="sr-only">{{ tableLabel }} — grouped parent and child, with column filters</caption>
    <thead class="dark">
      <tr>
        @for (c of cols; track c.id) {
          <th scope="col" [id]="uid + '-' + c.id" [attr.aria-sort]="ariaSort(c.id)">
            <button type="button" class="sort-btn" (click)="sortBy(c.id)">
              {{ c.label }} <span class="sort-ind" aria-hidden="true">{{ sortArrow(c.id) }}</span>
            </button>
          </th>
        }
      </tr>
      <tr class="filter">
        <td>
          <button type="button" class="btn" aria-label="Expand all groups" (click)="expandAll()">Expand all</button>
          <button type="button" class="btn" aria-label="Collapse all groups" (click)="collapseAll()">Collapse all</button>
        </td>
        <td>
          <app-multi-select label="Division" [options]="options('division')"
                            (selectionChange)="fDivision = $event; onFilterChange()"></app-multi-select>
        </td>
        <td>
          <label class="sr-only" [for]="uid + '-f-projectId'">Project ID filter</label>
          <input [id]="uid + '-f-projectId'" type="text" [(ngModel)]="fProjectId" (ngModelChange)="onFilterChange()">
        </td>
        <td>
          <app-multi-select label="Producer" [options]="options('producer')"
                            (selectionChange)="fProducer = $event; onFilterChange()"></app-multi-select>
        </td>
        <td>
          <app-multi-select label="Status" [options]="options('statusName')"
                            (selectionChange)="fStatus = $event; onFilterChange()"></app-multi-select>
        </td>
        <td>
          <app-multi-select label="Release Year" [options]="options('releaseYear')"
                            (selectionChange)="fYear = $event; onFilterChange()"></app-multi-select>
        </td>
        <td>
          <label class="sr-only" [for]="uid + '-f-title'">Title filter</label>
          <input [id]="uid + '-f-title'" type="text" [(ngModel)]="fTitle" (ngModelChange)="onFilterChange()">
        </td>
      </tr>
    </thead>

    <tbody>
      @for (rr of renderRows; track rr.row.id) {
        <tr [class.parent-row]="rr.kind === 'parent'" [class.context-only]="rr.contextOnly"
            [id]="rr.kind === 'child' ? rowId(rr.row) : null">
          <td class="group-cell" [attr.headers]="uid + '-group'">
            @if (rr.kind === 'parent') {
              <button type="button" class="btn-link" [attr.aria-expanded]="expanded.has(rr.row.id)"
                      [attr.aria-controls]="childIds(rr.row)" [attr.aria-label]="parentLabel(rr.row)"
                      (click)="toggle(rr.row.id)">
                <span class="twisty" aria-hidden="true">{{ expanded.has(rr.row.id) ? '▾' : '▸' }}</span>
                <span class="group-root">{{ rr.row.id }}</span>
              </button>
              @if (rr.contextOnly) {
                <span class="badge badge-context">context</span>
                <span class="sr-only"> — shown for context; does not match the filter</span>
              }
            } @else if (rr.kind === 'child') {
              <span class="group-child">{{ rr.row.id }}</span>
              @if (rr.orphan && orphanMode === 'inline') {
                <span class="orphan-line">↳ child of {{ rr.parentId }} · parent filtered out</span>
                <span class="sr-only"> Child {{ rr.pos }} of {{ rr.setsize }}, child of project {{ rr.parentId }} ({{ rr.parentTitle }}) — parent filtered out, not shown</span>
                <span class="badge badge-orphan">orphan</span>
              } @else {
                <span class="sr-only"> Child {{ rr.pos }} of {{ rr.setsize }}, under project {{ rr.parentId }}@if (rr.orphan) { — parent {{ rr.parentId }} hidden by current filter }</span>
                @if (rr.orphan) { <span class="badge badge-orphan">orphan</span> }
              }
            } @else {
              <span class="twisty" aria-hidden="true"></span>
              <span class="group-none">{{ rr.row.id }}</span>
              <span class="sr-only"> standalone project — not part of a group</span>
              <span class="badge badge-solo">ungrouped</span>
            }
          </td>
          @for (c of cols.slice(1); track c.id) {
            <td [attr.headers]="uid + '-' + c.id">{{ cellValue(rr.row, c.id) }}</td>
          }
        </tr>
      }
    </tbody>
  </table>
</div>`,
  styles: [`
.table-wrap { border: 1px solid #e5e7eb; overflow: visible; margin-top: .5rem; }
table.grid { border-collapse: collapse; width: 100%; font-size: .85rem; white-space: nowrap; }
caption { text-align: left; }
table.grid th, table.grid td { padding: .4rem .6rem; border-bottom: 1px solid #e5e7eb; text-align: center; }
thead.dark th { background: #212529; color: #fff; position: sticky; top: 0; z-index: 2; }
tr.filter td { background: #343a40; padding: .3rem .4rem; vertical-align: top; min-width: 9rem; }
tbody tr:nth-child(odd) td { background: #f8f9fa; }
tr.parent-row td { border-top: 2px solid #0d6efd; }
tr.context-only td { color: #6b7280; font-style: italic; }
.group-cell { text-align: left; min-width: 14rem; }
.group-root { font-weight: 700; color: #1d4ed8; }
.group-child { color: #6b7280; padding-left: 1.5rem; }
.group-none { color: #374151; }
.twisty { display: inline-block; width: 1.1rem; }
.orphan-line { display: block; padding-left: 1.5rem; font-size: .72rem; color: #3730a3; }
.badge { font-size: .7rem; font-weight: 600; padding: .05rem .35rem; border-radius: 4px; margin-left: .35rem; }
.badge-context { background: #fef3c7; color: #92400e; }
.badge-orphan { background: #e0e7ff; color: #3730a3; }
.badge-solo { background: #f3f4f6; color: #374151; }
.btn { font: inherit; border: 1px solid #adb5bd; background: #fff; border-radius: 4px; padding: .1rem .4rem; cursor: pointer; margin: 0 .15rem .15rem 0; }
.btn-link { border: 0; background: none; color: #1d4ed8; cursor: pointer; font: inherit; }
.sort-btn { font: inherit; font-weight: 600; color: inherit; background: none; border: 0; padding: .1rem .2rem; cursor: pointer; display: inline-flex; align-items: center; gap: .25rem; }
.sort-btn:focus { outline: 2px solid #fff; outline-offset: 1px; }
.sort-ind { font-size: .7rem; }
tr.filter input[type=text] { width: 100%; font: inherit; padding: .2rem; box-sizing: border-box; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); border: 0; }
`],
})
export class GroupedTableComponent implements OnInit {
  @Input() data: Row[] = [];
  @Input() cols: { id: string; label: string }[] = [];
  @Input() orphanMode: 'context' | 'inline' = 'context';
  @Input() tableLabel = 'Projects Table';

  private static seq = 0;
  readonly uid = 'gt' + (GroupedTableComponent.seq++);

  expanded = new Set<string>();
  fDivision: string[] = []; fProducer: string[] = []; fStatus: string[] = []; fYear: string[] = [];
  fProjectId = ''; fTitle = '';
  sortCol: string | null = null;
  sortDir: 'ascending' | 'descending' | null = null;

  constructor(private live: LiveAnnouncer) {}
  ngOnInit() { this.data.forEach(r => { if (this.isParent(r)) this.expanded.add(r.id); }); }

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

  get renderRows(): RenderRow[] { return this.orphanMode === 'inline' ? this.renderInline() : this.renderContext(); }

  // current behavior: parent without a match is kept as a dimmed "context" row
  private renderContext(): RenderRow[] {
    const out: RenderRow[] = [];
    const roots = this.sortRows(this.data.filter(r => r.parent === null && this.visible(r)));
    for (const root of roots) {
      const parent = this.isParent(root);
      const contextOnly = parent && !this.matches(root) && this.anyActive();
      out.push({ row: root, level: 1, kind: parent ? 'parent' : 'solo', contextOnly });
      if (parent && this.expanded.has(root.id)) {
        const kids = this.sortRows(this.childrenOf(root.id).filter(r => this.visible(r)));
        kids.forEach((kid, i) => out.push({ row: kid, level: 2, kind: 'child', pos: i + 1, setsize: kids.length, parentId: root.id, parentTitle: root.title, orphan: !this.matches(root) && this.anyActive() }));
      }
    }
    return out;
  }

  // option (a): a non-matching parent is DROPPED; its matching children show as orphans that name the missing parent
  private renderInline(): RenderRow[] {
    const out: RenderRow[] = [];
    const active = this.anyActive();
    const roots = this.sortRows(this.data.filter(r => r.parent === null));
    for (const root of roots) {
      const parent = this.isParent(root);
      if (!active || this.matches(root)) {
        out.push({ row: root, level: 1, kind: parent ? 'parent' : 'solo' });
        if (parent && this.expanded.has(root.id)) {
          const kids = this.sortRows(this.childrenOf(root.id).filter(r => this.visible(r)));
          kids.forEach((kid, i) => out.push({ row: kid, level: 2, kind: 'child', pos: i + 1, setsize: kids.length, parentId: root.id, parentTitle: root.title, orphan: false }));
        }
      } else if (parent) {
        const orphans = this.sortRows(this.childrenOf(root.id).filter(r => this.matches(r)));
        orphans.forEach((kid, i) => out.push({ row: kid, level: 2, kind: 'child', pos: i + 1, setsize: orphans.length, parentId: root.id, parentTitle: root.title, orphan: true }));
      }
    }
    return out;
  }

  rowId(r: Row) { return this.uid + '-row-' + r.id; }
  childIds(r: Row) { return this.childrenOf(r.id).map(c => this.rowId(c)).join(' '); }
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
    const rows = this.renderRows;
    const orphans = rows.filter(r => r.orphan).length;
    let msg = this.anyActive() ? `Showing ${rows.length} of ${this.data.length} projects` : `${this.data.length} projects shown`;
    if (this.orphanMode === 'inline' && orphans) msg += ` — ${orphans} ${orphans === 1 ? 'is a child project whose' : 'are child projects whose'} parent is filtered out`;
    this.live.announce(msg);
  }
}
