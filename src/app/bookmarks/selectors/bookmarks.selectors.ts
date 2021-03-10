import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromBookmarks from '../reducers/bookmarks.reducer';

export const selectBookmarksState = createFeatureSelector<fromBookmarks.State>(
  fromBookmarks.bookmarksFeatureKey
);

export const selectBookmarks = createSelector(
  selectBookmarksState,
  (state: fromBookmarks.State) => state.bookmarks
);
