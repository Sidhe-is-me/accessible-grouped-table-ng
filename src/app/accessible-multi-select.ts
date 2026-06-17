import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';

/**
 * Accessible multi-select built on @angular/cdk/listbox.
 * CDK provides the listbox core: role=listbox, aria-multiselectable, keyboard
 * navigation, aria-activedescendant, and type-ahead — maintained by the Angular team.
 * This component adds the disclosure trigger (aria-haspopup/expanded + accessible
 * name with count) and the removable chips around it.
 */
@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CdkListbox, CdkOption],
  template: `
<div class="ms">
  <button #trigger type="button" class="ms-btn" aria-haspopup="listbox"
          [attr.aria-expanded]="open" [attr.aria-controls]="id" [attr.aria-label]="triggerLabel"
          (click)="toggleOpen()" (keydown)="onTriggerKeydown($event)">
    {{ summary }} <span aria-hidden="true">▾</span>
  </button>

  @if (selected.length) {
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

  <ul #listbox [id]="id" class="ms-listbox" [hidden]="!open"
      cdkListbox cdkListboxMultiple cdkListboxUseActiveDescendant
      [attr.aria-label]="label" [cdkListboxValue]="selected"
      (cdkListboxValueChange)="onValueChange($event)" (keydown)="onListKeydown($event)">
    @for (o of options; track o) {
      <li [cdkOption]="o" class="ms-option">{{ o }}</li>
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
.ms-option { padding: .25rem .8rem .25rem 1.4rem; cursor: pointer; position: relative; }
.ms-option[aria-selected="true"]::before { content: "✓"; position: absolute; left: .45rem; }
.ms-option.cdk-option-active, .ms-option:hover { background: #dbeafe; outline: 2px solid #2563eb; outline-offset: -2px; }
`],
})
export class AccessibleMultiSelect {
  @Input() label = '';
  @Input() options: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();
  @ViewChild('listbox') listbox?: ElementRef<HTMLElement>;
  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;

  selected: string[] = [];
  open = false;
  showAll = false;
  readonly MAX = 5;

  // unique per instance so two tables on one page don't collide on the listbox id
  private static seq = 0;
  private readonly uid = 'ms' + (AccessibleMultiSelect.seq++);

  constructor(private host: ElementRef) {}

  get id() { return this.uid + '-' + this.label.replace(/[^a-zA-Z0-9_-]/g, '-'); }
  get summary() { const n = this.selected.length; return `${this.label}: ${n ? n + ' selected' : 'all'}`; }
  get triggerLabel() { const n = this.selected.length; return `${this.label} filter, ${n ? n + ' selected' : 'all'}`; }
  get shownChips() { return this.showAll ? this.selected : this.selected.slice(0, this.MAX); }
  get overflow() { return Math.max(0, this.selected.length - this.MAX); }

  private defer(fn: () => void) { setTimeout(fn, 0); }

  toggleOpen() { this.open ? this.close(false) : this.openList(); }
  openList() { this.open = true; this.defer(() => this.listbox?.nativeElement.focus()); }
  close(focusTrigger: boolean) { this.open = false; if (focusTrigger) this.defer(() => this.trigger?.nativeElement.focus()); }

  onValueChange(e: { value: readonly string[] }) { this.selected = [...e.value]; this.selectionChange.emit(this.selected); }
  removeChip(o: string) { this.selected = this.selected.filter(x => x !== o); this.selectionChange.emit(this.selected); this.defer(() => this.trigger?.nativeElement.focus()); }

  onTriggerKeydown(e: KeyboardEvent) { if (['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); this.openList(); } }
  onListKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); this.close(true); }
    else if (e.key === 'Tab') { this.close(false); }
    // arrows / Home / End / Space / Enter / type-ahead are handled by cdkListbox
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) { if (this.open && !this.host.nativeElement.contains(e.target)) this.close(false); }
  @HostListener('focusout', ['$event'])
  onFocusOut(e: FocusEvent) { if (this.open && !this.host.nativeElement.contains(e.relatedTarget as Node)) this.close(false); }
}
