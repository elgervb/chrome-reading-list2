import { createAction, props } from '@ngrx/store';

export const addBookmark = createAction(
  '[Bookmarks] Add Bookmark',
  props<chrome.bookmarks.BookmarkCreateArg>()
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
  props<chrome.bookmarks.BookmarkTreeNode>()
);
