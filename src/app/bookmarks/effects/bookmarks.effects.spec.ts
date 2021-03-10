import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { BookmarksEffects } from './bookmarks.effects';

describe('BookmarksEffects', () => {
  let actions$: Observable<any>;
  let effects: BookmarksEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BookmarksEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(BookmarksEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
