import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';

import { catchError, concatMap, map } from 'rxjs/operators';

import * as BookmarksActions from '../actions/bookmarks.actions';
import { BookmarkService } from '../services/bookmark/bookmark.service';

@Injectable()
export class BookmarksEffects {

  loadBookmarks$ = createEffect(() => this.actions$
    .pipe(
      ofType(BookmarksActions.loadBookmarks),
      concatMap(
        () => this.bookmarkService.load()
          .pipe(
            map(bookmarks => BookmarksActions.loadBookmarksSuccess({ bookmarks })),
            catchError(error => of(BookmarksActions.loadBookmarksFailure({ error })))
          )
      )
    )
  );

  createBookmark$ = createEffect(() => this.actions$
    .pipe(
      ofType(BookmarksActions.createBookmark),
      concatMap(
        action => this.bookmarkService.create(action.bookmark)
          .pipe(
            map(bookmark => BookmarksActions.addBookmark({ bookmark }))
          )
      )
    )
  );

  removeBookmark$ = createEffect(() => this.actions$
    .pipe(
      ofType(BookmarksActions.removeBookmark),
      concatMap(
        action => this.bookmarkService.remove(action.bookmark)
          .pipe(
            map(bookmark => BookmarksActions.removeBookmarkSuccess({ bookmark })),
            catchError(() => of(BookmarksActions.removeBookmarkFailure()))
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private bookmarkService: BookmarkService
  ) { }

}
