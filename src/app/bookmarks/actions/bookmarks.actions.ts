import { createAction, props } from '@ngrx/store';

export const createBookmark = createAction(
  '[Bookmarks] Create Bookmark',
  props<{ bookmark: chrome.bookmarks.BookmarkCreateArg }>()
);
export const addBookmark = createAction(
  '[Bookmarks] Add Bookmark',
  props<{ bookmark: chrome.bookmarks.BookmarkTreeNode }>()
);

export const loadBookmarks = createAction(
  '[Bookmarks] Load Bookmarks'
);
export const loadBookmarksSuccess = createAction(
  '[Bookmarks] Load Bookmarks Success',
  props<{ bookmarks: chrome.bookmarks.BookmarkTreeNode[] }>()
);
export const loadBookmarksFailure = createAction(
  '[Bookmarks] Load Bookmarks Failure',
  props<{ error: string }>()
);

export const removeBookmark = createAction(
  '[Bookmarks] Remove Bookmark',
  props<{ bookmark: chrome.bookmarks.BookmarkTreeNode }>()
);
export const removeBookmarkFailure = createAction(
  '[Bookmarks] Remove Bookmark Failure'
);
export const removeBookmarkSuccess = createAction(
  '[Bookmarks] Remove Bookmark Success',
  props<{ bookmark: chrome.bookmarks.BookmarkTreeNode }>()
);
