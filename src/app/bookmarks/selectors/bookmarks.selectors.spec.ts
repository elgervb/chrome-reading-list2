import * as fromBookmarks from '../reducers/bookmarks.reducer';
import { selectBookmarksState } from './bookmarks.selectors';

describe('Bookmarks Selectors', () => {
  it('should select the feature state', () => {
    const result = selectBookmarksState({
      [fromBookmarks.bookmarksFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
