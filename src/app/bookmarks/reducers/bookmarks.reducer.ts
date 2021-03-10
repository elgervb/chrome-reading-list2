import { createReducer, on } from '@ngrx/store';
import * as BookmarksActions from '../actions/bookmarks.actions';

export const bookmarksFeatureKey = 'bookmarks';

export interface State {
  bookmarks: chrome.bookmarks.BookmarkTreeNode[]
}

export const initialState: State = {
  bookmarks: []
};

export const reducer = createReducer(
  initialState,
  on(BookmarksActions.loadBookmarks, state => state),
  on(BookmarksActions.loadBookmarksFailure, state => state),
  on(BookmarksActions.loadBookmarksSuccess, (state, action) => ({ ...state, bookmarks: action.bookmarks })),

  on(BookmarksActions.addBookmark, (state, action) => ({ ...state, bookmarks: [...state.bookmarks, action.bookmark] })),

  on(BookmarksActions.removeBookmark, state => (state)),
);
