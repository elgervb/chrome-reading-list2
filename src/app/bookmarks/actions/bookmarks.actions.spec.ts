import * as fromBookmarks from './bookmarks.actions';

describe('loadBookmarks', () => {
  it('should return an action', () => {
    expect(fromBookmarks.loadBookmarks().type).toBe('[Bookmarks] Load Bookmarks');
  });
});
