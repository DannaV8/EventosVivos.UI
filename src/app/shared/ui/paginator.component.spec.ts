import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let fixture: ComponentFixture<PaginatorComponent>;
  let component: PaginatorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PaginatorComponent] });
    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 3);
  });

  it('emits the requested page when within bounds', () => {
    const emitted: number[] = [];
    component.pageChange.subscribe((p) => emitted.push(p));

    component.go(0);
    component.go(2);

    expect(emitted).toEqual([0, 2]);
  });

  it('does not emit for a page below 0', () => {
    const emitted: number[] = [];
    component.pageChange.subscribe((p) => emitted.push(p));

    component.go(-1);

    expect(emitted).toEqual([]);
  });

  it('does not emit for a page at or beyond totalPages', () => {
    const emitted: number[] = [];
    component.pageChange.subscribe((p) => emitted.push(p));

    component.go(3); // valid indices are 0..2

    expect(emitted).toEqual([]);
  });
});
