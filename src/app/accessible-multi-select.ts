import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

/**
 * Accessible multi-select — a port of the static demo's hand-built listbox.
 * button (aria-haspopup=listbox, aria-expanded, named w/ count) + role=listbox
 * (aria-multiselectable, aria-activedescendant, full keyboard) + removable chips.
 * Replaces ng-select, which shipped with no accessible name / no listbox role.
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  template: `
<div class="ms">
  <button #trigger type="button" class="ms-btn" aria-haspopup="listbox"
          [attr.aria-expanded]="open" [attr.aria-controls]="id" [attr.aria-label]="triggerLabel"
          (click)="toggleOpen()" (keydown)="onTriggerKeydown($event)">
    {{ summary }} <span aria-hidden="true">▾</span>
  </button>

  @if (selected.size) {
    <ul class="chips" [attr.aria-label]="label + ' — selected, removable'">
      @for (o of shownChips; track o) {
        <li><button type="button" class="chip"
                    [attr.aria-label]="'Remove ' + o + ' from ' + label + ' filter'"
                    (click)="removeChip(o)">{{ o }} <span aria-hidden="true">×</span></button></li>
      }
      @if (overflow > 0) {
        <li><button type="button" class="chip chip-more" [attr.aria-expanded]="showAll"
                    [attr.aria-label]="(showAll ? 'Show fewer' : 'Show ' + overflow + ' more') + ' selected ' + label + ' items'"
                    (click)="showAll = !showAll">{{ showAll ? 'Show fewer' : '+' + overflow + ' more' }}</button></li>
      }
    </ul>
  }

  <ul #listbox class="ms-listbox" role="listbox" aria-multiselectable="true"
      [attr.aria-label]="label" [hidden]="!open" tabindex="0"
      [attr.aria-activedescendant]="activeId" (keydown)="onListKeydown($event)">
    @for (o of options; track o; let i = $index) {
      <li [id]="optId(i)" role="option" [attr.aria-selected]="isSelected(o)"
          [class.active]="i === active" (click)="toggleOption(o); setActive(i)">{{ o }}</li>
    }
  </ul>
</div>`,
  styles: [`
.ms { position: relative; }
.ms-btn { width: 100%; text-align: left; font: inherit; background: #fff; border: 1px solid #adb5bd; border-radius: 4px; padding: .2rem .4rem; cursor: pointer; }
.ms-btn:focus { outline: 2px solid #2563eb; outline-offset: 1px; }
.chips { list-style: none; margin: .4rem 0 0; padding: .4rem 0 0; display: flex; flex-wrap: wrap; gap: .25rem; max-height: 8rem; overflow-y: auto; border-top: 1px solid rgba(255,255,255,.3); }
.chip { font: inherit; font-size: .72rem; border: 1px solid #6b7280; background: #eef2ff; color: #1a1a1a; border-radius: 10px; padding: .05rem .45rem; cursor: pointer; }
.chip:focus { outline: 2px solid #2563eb; outline-offset: 1px; }
.chip-more { background: #e5e7eb; border-color: #9ca3af; font-weight: 600; }
.ms-listbox { position: absolute; z-index: 20; left: 0; min-width: 12rem; margin: .15rem 0 0; padding: .2rem 0; list-style: none; background: #fff; color: #1a1a1a; border: 1px solid #6b7280; border-radius: 4px; max-height: 12rem; overflow: auto; box-shadow: 0 4px 12px rgba(0,0,0,.25); }
.ms-listbox:focus { outline: 2px solid #2563eb; }
.ms-listbox li { padding: .25rem .8rem .25rem 1.4rem; cursor: pointer; position: relative; }
.ms-listbox li[aria-selected="true"]::before { content: "✓"; position: absolute; left: .45rem; }
.ms-listbox li.active { background: #dbeafe; outline: 2px solid #2563eb; outline-offset: -2px; }
`],
})
export class AccessibleMultiSelect {
  @Input() label = '';
  @Input() options: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();
  @ViewChild('listbox') listbox?: ElementRef<HTMLElement>;
  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;

  selected = new Set<string>();
  open = false;
  active = 0;
  showAll = false;
  readonly MAX = 5;

  constructor(private host: ElementRef) {}

  private slug(s: string) { return s.replace(/[^a-zA-Z0-9_-]/g, '-'); }
  get id() { return 'ms-' + this.slug(this.label); }
  optId(i: number) { return this.id + '-o' + i; }
  get activeId() { return this.open ? this.optId(this.active) : null; }
  get summary() { const n = this.selected.size; return `${this.label}: ${n ? n + ' selected' : 'all'}`; }
  get triggerLabel() { const n = this.selected.size; return `${this.label} filter, ${n ? n + ' selected' : 'all'}`; }
  isSelected(o: string) { return this.selected.has(o); }
  get shownChips() { const v = [...this.selected]; return this.showAll ? v : v.slice(0, this.MAX); }
  get overflow() { return Math.max(0, this.selected.size - this.MAX); }

  private defer(fn: () => void) { setTimeout(fn, 0); }

  toggleOpen() { this.open ? this.close(false) : this.openList(); }
  openList() {
    this.open = true;
    const sel = this.options.findIndex(o => this.selected.has(o));
    this.active = sel < 0 ? 0 : sel;
    this.defer(() => this.listbox?.nativeElement.focus());
  }
  close(focusTrigger: boolean) { this.open = false; if (focusTrigger) this.defer(() => this.trigger?.nativeElement.focus()); }
  setActive(i: number) {
    this.active = Math.max(0, Math.min(i, this.options.length - 1));
    this.defer(() => document.getElementById(this.optId(this.active))?.scrollIntoView({ block: 'nearest' }));
  }
  toggleOption(o: string) { this.selected.has(o) ? this.selected.delete(o) : this.selected.add(o); this.emit(); }
  removeChip(o: string) { this.selected.delete(o); this.emit(); this.defer(() => this.trigger?.nativeElement.focus()); }
  private emit() { this.selectionChange.emit([...this.selected]); }

  onTriggerKeydown(e: KeyboardEvent) { if (['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); this.openList(); } }
  onListKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.setActive(this.active + 1); break;
      case 'ArrowUp': e.preventDefault(); this.setActive(this.active - 1); break;
      case 'Home': e.preventDefault(); this.setActive(0); break;
      case 'End': e.preventDefault(); this.setActive(this.options.length - 1); break;
      case ' ': case 'Enter': e.preventDefault(); this.toggleOption(this.options[this.active]); break;
      case 'Escape': e.preventDefault(); this.close(true); break;
      case 'Tab': this.close(false); break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) { if (this.open && !this.host.nativeElement.contains(e.target)) this.close(false); }
}
