import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkFooterComponent } from './bookmark-footer.component';
import { By } from '@angular/platform-browser';

describe('BookmarkFooterComponent', () => {
  let component: BookmarkFooterComponent;
  let fixture: ComponentFixture<BookmarkFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BookmarkFooterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit random bookmark event', () => {
    let emit = false;
    component.randomBookmarkEvent.subscribe(() => emit = true);

    const button = fixture.debugElement.query(By.css('.btn-random'));
    expect(button).toBeTruthy();
    button.triggerEventHandler('click', void 0);

    expect(emit).toBe(true);
  });

  it('should emit filter event', () => {
    let emit = '';
    component.filterEvent.subscribe((val: string) => emit = val);

    const input = fixture.debugElement.query(By.css('.filter'));
    expect(input).toBeTruthy();
    input.triggerEventHandler('input', {
      target: {
        value: 'abc'
      }
    });

    expect(emit).toBe('abc');
  });

  it('should show popover', () => {
    const emitSpy = jest.spyOn(component.reviewPopoverShowEvent, 'emit');

    expect(fixture.debugElement.query(By.css('.popover'))).toBeFalsy()

    component.showPopover();

    expect(component.displayPopover).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.popover'))).toBeTruthy();
  })
});
