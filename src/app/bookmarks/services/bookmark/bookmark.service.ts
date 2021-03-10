import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

import { take } from 'rxjs/operators';
import { BookmarkFolderToken } from '../bookmark-folder.token';

export const OTHER_BOOKMARKS = 'Other Bookmarks';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {

  // FIXME: remove use store
  bookmarks$: Observable<chrome.bookmarks.BookmarkTreeNode[]>;
  readingListId: string;

  // FIXME: remove use store
  private bookmarks = new BehaviorSubject<chrome.bookmarks.BookmarkTreeNode[]>([]);

  constructor(
    @Inject(BookmarkFolderToken) private bookmarkFolder: string
  ) {
    if (!this.bookmarkFolder) {
      throw new Error('No bookmark folder set. Use InjectionToken BookmarkFolderToken');
    }
    this.bookmarks$ = this.bookmarks.asObservable();
  }

  create(create: chrome.bookmarks.BookmarkCreateArg): Observable<chrome.bookmarks.BookmarkTreeNode> {
    const addSubject = new Subject<chrome.bookmarks.BookmarkTreeNode>();
    const bookmarkExists = this.exists(create.url);
    if (!bookmarkExists) {
      // always put it in the reading list
      const createBookmark: chrome.bookmarks.BookmarkCreateArg = { ...create, parentId: this.readingListId };

      chrome.bookmarks.create(createBookmark, bookmark => {
        addSubject.next(bookmark);
        addSubject.complete();
      });
    }

    return addSubject.asObservable();
  }

  exists(url: string): boolean {
    return this.bookmarks.getValue().some(bookmark => url === bookmark.url);
  }

  load(): Observable<chrome.bookmarks.BookmarkTreeNode[]> {
    this.loadChromeBookmarks(this.bookmarkFolder);

    return this.bookmarks$;
  }

  remove(remove: chrome.bookmarks.BookmarkTreeNode) {
    chrome.bookmarks.remove(remove.id, () => {
      const result = [...this.bookmarks.value].filter(bookmark => bookmark.id !== remove.id);
      this.bookmarks.next(result);
    });
  }

  select(bookmark: chrome.bookmarks.BookmarkTreeNode) {
    window.open(bookmark.url, '_blank');
    this.remove(bookmark);
  }

  /**
   * Create a root node for the reading list items
   */
  private createReadinglistRoot(parent: chrome.bookmarks.BookmarkTreeNode, title: string): Observable<void> {
    const result = new Subject<void>();
    chrome.bookmarks.create({
      title,
      parentId: parent.id
    }, () => {
      result.next();
      result.complete();
    });

    return result.asObservable();
  }

  /**
   * returns the root node for the readinglist items.
   * When it does not exits, it will be created
   */
  private loadChromeBookmarks(title: string): Observable<chrome.bookmarks.BookmarkTreeNode[]> {
    chrome.bookmarks.getTree(bookmarks => {
      const result = bookmarks[0].children
        .find(child => child.title.toLowerCase() === OTHER_BOOKMARKS.toLowerCase());
      if (result && result.children) {
        const match = result.children.find(bookmark => bookmark.title === title);
        if (match) {
          this.readingListId = match.id;

          this.bookmarks.next([...match.children]);
        } else {
          this.createReadinglistRoot(result, title)
            .pipe(take(1))
            .subscribe(() => {
              // root has been created... try again
              this.loadChromeBookmarks(title);
            });
        }
      }
    });

    return this.bookmarks$;
  }
}
