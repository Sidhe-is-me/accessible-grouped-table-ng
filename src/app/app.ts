import { Component } from '@angular/core';
import { GroupedTableComponent, Row } from './grouped-table';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GroupedTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly build = 'Build: 2026-06-17 · Angular + CdkListbox · v2 — orphan options A/B';
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
}
