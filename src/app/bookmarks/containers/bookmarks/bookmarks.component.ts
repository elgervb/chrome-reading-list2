import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, Observable } from 'rxjs';
import { debounceTime, map, tap, takeUntil, take, share, filter } from 'rxjs/operators';
import { VersionService } from '../../services/version/version.service';
import { Sorting } from '../../models/sorting';
import { environment } from 'src/environments/environment';
import { GoogleAnalyticsService } from '@core/google-analytics.service';

import { Store } from '@ngrx/store';
import * as BookmarksActions from '../../actions/bookmarks.actions';
import * as BookmarksSelectors from '../../selectors/bookmarks.selectors';

const initialSorting: Sorting = {
  field: 'dateAdded',
  asc: true
};

const chromeReviewUrl = 'https://chrome.google.com/webstore/detail/chrome-reading-list-2-%E2%9D%A4/kdapifmgfmpofpeoehdelijjcdpmgdja';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarksComponent implements OnInit, OnDestroy {

  bookmarks$: Observable<chrome.bookmarks.BookmarkTreeNode[]>;
  sorting$ = new BehaviorSubject<Sorting>(initialSorting);
  currentUrlExists = true;
  /** the number of total (unfiltered) bookmarks */
  countBookmarks: number;
  /** filter the list of bookmarks with a search string */
  filter = new Subject<string>();

  get version() {
    return this.versionService.getVersion();
  }

  get devMode() {
    return !environment.production;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: GoogleAnalyticsService,
    private changeDetector: ChangeDetectorRef,
    private versionService: VersionService,
    private store: Store
  ) { }

  ngOnInit() {
    chrome.storage.sync.get('filter', data => data?.filter ? this.filter.next(data.filter) : undefined);

    const filter$ = this.filter.asObservable().pipe(debounceTime(200));
    const bookmarks$ = this.store.select(BookmarksSelectors.selectBookmarks);

    this.bookmarks$ = combineLatest([bookmarks$, filter$, this.sorting$])
      .pipe(
        filter(([allBookmarks, _, __]) => !!allBookmarks),
        map(([allBookmarks, searchTerm, sort]) => {
          const bookmarks = searchTerm ? this.filterBookmarks(searchTerm, allBookmarks) : [...allBookmarks];

          return [...bookmarks].sort((a, b) => this.compareBookmarks(a, b, sort));
        }),
        share()
      );

    this.changeDetector.detectChanges();

    this.store.dispatch(BookmarksActions.loadBookmarks());
    this.filter.next();

    bookmarks$
      .pipe(
        // can current page be added?
        tap(bookmarks => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            this.currentUrlExists = bookmarks?.some(bookmark => tab.url === bookmark.url);
            this.changeDetector.detectChanges();
          });
        }),
        tap(allBookmarks => this.countBookmarks = allBookmarks ? allBookmarks.length : 0),
        tap(bookmarks => chrome.browserAction.setBadgeText({ text: `${bookmarks.length}` })),
        takeUntil(this.destroy$)
      ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addBookmark() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      this.store.dispatch(BookmarksActions.createBookmark({
        bookmark: {
          url: tab.url,
          title: tab.title,
        }
      }))

      this.analyticsService.sendEvent('bookmarks', 'add', tab.url);
    });
  }

  applyFilter(searchTerm: string) {
    chrome.storage.sync.set({ filter: searchTerm });
    this.filter.next(searchTerm);
  }

  randomBookmark() {
    this.store.select(BookmarksSelectors.selectBookmarks)
      .pipe(
        take(1),
        map(bookmarks => {
          const randomIndex = Math.floor(Math.random() * bookmarks.length);
          return bookmarks[randomIndex];
        }),
        tap(bookmark => this.analyticsService.sendEvent('bookmarks', 'random', bookmark.url)),
        tap(bookmark => this.selectBookmark(bookmark))
      ).subscribe()
  }

  reviewPopoverShown(show: boolean) {
    this.analyticsService.sendEvent('review', show ? 'show popover' : 'hide popover');
  }

  openReview() {
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      this.analyticsService.sendEvent('review', 'redirect');
      chrome.tabs.create({ url: chromeReviewUrl });
    });
  }

  selectBookmark(bookmark: chrome.bookmarks.BookmarkTreeNode) {
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      this.store.dispatch(BookmarksActions.removeBookmark({ bookmark }));
      this.analyticsService.sendEvent('bookmarks', 'select', bookmark.url);
      chrome.tabs.create({ url: bookmark.url });
    });
  }

  setSorting(field?: 'dateAdded' | 'title' | 'url') {
    const currentSorting = this.sorting$.getValue();

    const sorting: Sorting = {
      field: field || currentSorting.field,
      asc: !currentSorting.asc
    };

    this.sorting$.next(sorting);

    this.analyticsService.sendEvent('bookmarks', 'sort', `${sorting.field}:${sorting.asc ? 'asc' : 'desc'}`);
  }

  private filterBookmarks(searchTerm: string, bookmarks: chrome.bookmarks.BookmarkTreeNode[]) {
    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(searchTerm)
      || bookmark.url.toLowerCase().includes(searchTerm));
  }

  private compareBookmarks(a: chrome.bookmarks.BookmarkTreeNode, b: chrome.bookmarks.BookmarkTreeNode, sort: Sorting) {
    const right = sort.asc ? a : b;
    const left = sort.asc ? b : a;
    return ('' + right[sort.field]).localeCompare('' + left[sort.field]);
  }
}
