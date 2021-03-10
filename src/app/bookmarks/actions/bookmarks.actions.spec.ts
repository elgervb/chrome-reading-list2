import * as fromBookmarks from './bookmarks.actions';

describe('loadBookmarkss', () => {
  it('should return an action', () => {
    expect(fromBookmarks.loadBookmarkss().type).toBe('[Bookmarks] Load Bookmarkss');
  });
});
