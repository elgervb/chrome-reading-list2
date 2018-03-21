import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { take, takeUntil, debounceTime } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { BookmarksService } from './bookmarks.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


const READINGLIST_BOOKMARK_NAME = 'My ReadingList';
export const DEFAULT_IMAGE = '/assets/bookmark-default.svg';

@Component({
  selector: 'app-root',
  template: `
    <header class="reading-list__header">
      <h1 class="reading-list__title">
        <span>My Reading list
          <span class="reading-list__title--small">({{ bookmarks?.length || 0 }})</span>
        </span>
        <span>
          <span class="reading-list__version">0.0.1</span>
          <svg class="icon icon--sort" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
            [ngClass]="{'icon--sort__asc':!(isSorted| async), 'icon--sort__desc': isSorted| async}"
            (click)="sort()">
            <g>
              <g>
                <g>
                  <path class="icon--sort__up"
                    d="m496.1,138.3l-120.4-120.4c-7.9-7.9-20.6-7.9-28.5-7.10543e-15l-120.3,
                    120.4c-7.9,7.9-7.9,20.6 0,28.5 7.9,7.9 20.6,7.9 28.5,0l85.7-85.7v352.8c0,
                    11.3 9.1,20.4 20.4,20.4 11.3,0 20.4-9.1 20.4-20.4v-352.8l85.7,85.7c7.9,
                    7.9 20.6,7.9 28.5,0 7.9-7.8 7.9-20.6 5.68434e-14-28.5z"/>
                  <path class="icon--sort__down"
                    d="m287.1,347.2c-7.9-7.9-20.6-7.9-28.5,0l-85.7,85.7v-352.8c0-11.3-9.1-20.4-20.4-20.4-11.3,
                    0-20.4,9.1-20.4,20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5,0-7.9,7.9-7.9,20.6 0,
                    28.5l120.4,120.4c7.9,7.9 20.6,7.9 28.5,0l120.4-120.4c7.8-7.9 7.8-20.7-0.1-28.5l0,0z"/>
                </g>
              </g>
            </g>
          </svg>
        </span>
      </h1>
      <button class="readinglist__btn-add" title="Add current page"
        (click)="addCurrentPage()">
          <svg class="icon icon--plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g><g>
              <line class="st1" x1="257" x2="257" y1="53" y2="461"/>
              <line class="st1" x1="461" x2="53" y1="257" y2="257"/>
            </g></g>
            <g id="cross_copy">
              <path d="M461,249H265V53c0-4.418-3.582-8-8-8c-4.418,0-8,3.582-8,8v196H53c-4.418,0-8,3.582-8,8c0,4.418,3.582,8,8,8h196v196
                c0,4.418,3.582,8,8,8c4.418,0,8-3.582,8-8V265h196c4.418,0,8-3.582,8-8C469,252.582,465.418,249,461,249z"/>
            </g>
          </svg>
        </button>
    </header>
    <main class="reading-list__body">
      <ul>
        <li *ngFor="let bookmark of bookmarks" class="bookmark">
          <a [href]="getSafeLink(bookmark)" (click)="onClick(bookmark, $event)" class="bookmark__link" [title]="getHover(bookmark)">
            <img [appLazyImg]="getFavicon(bookmark)" alt="Site's favicon" class="bookmark__favicon">
            <div class="bookmark__text">
              <div class="bookmark__title">{{ bookmark.title }}</div>
              <div class="bookmark__url">{{ bookmark.url }}</div>
            </div>
          </a>
        </li>
      </ul>
    </main>
    <footer class="reading-list__footer">
      <input type="text" class="reading-list__filter" placeholder="filter" autofocus (input)="applyFilter($event.target.value)">
      <button class="readinglist__btn-random" title="Pick a random item"
        (click)="randomBookmark()"
        [disabled]="!bookmarks?.length">↻</button>
    </footer>
  `,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  bookmarks: chrome.bookmarks.BookmarkTreeNode[];
  isSorted = new BehaviorSubject<boolean>(false);
  private filter = new Subject<string>();
  private unsubscribe = new Subject<void>();

  constructor(private bookmarksService: BookmarksService, private sanitizer: DomSanitizer, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    const filter$ = this.filter.asObservable().pipe(debounceTime(200));

    combineLatest(this.bookmarksService.bookmarks$, filter$, this.isSorted, (allBookmarks, filter, sort) => {
      if (!allBookmarks) {
        return undefined;
      }
      let bookmarks = [...allBookmarks];
      if (filter) {
        bookmarks = allBookmarks.filter(bookmark =>
          !filter
          || bookmark.title.toLowerCase().includes(filter)
          || bookmark.url.toLowerCase().includes(filter));
      }

      if (sort) {
        return bookmarks.sort((a, b) => b.dateAdded - a.dateAdded);
      }

      return bookmarks;

    })
    .pipe(takeUntil(this.unsubscribe))
    .subscribe((bookmarks) => {
      this.bookmarks = bookmarks;
      this.changeDetector.detectChanges();
    });

    this.bookmarksService.get(READINGLIST_BOOKMARK_NAME);
    this.filter.next(undefined);
    this.isSorted.next(false);
  }

  ngOnDestroy() {
    this.unsubscribe.next(undefined);
    this.unsubscribe.complete();
  }

  getHover(bookmark: chrome.bookmarks.BookmarkTreeNode) {
    const addDate = new Date(bookmark.dateAdded).toLocaleDateString();
    return `${bookmark.title}\nAdded on ${addDate}`;
  }

  getSafeLink(bookmark: chrome.bookmarks.BookmarkTreeNode): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(bookmark.url);
  }

  onClick(bookmark: chrome.bookmarks.BookmarkTreeNode, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.create({url: bookmark.url});
      this.removeBookmark(bookmark);
    });
  }

  applyFilter(filter: string) {
    this.filter.next(filter);
  }

  getFavicon(bookmark: chrome.bookmarks.BookmarkTreeNode) {
    const parsed = this.parse(bookmark.url);
    return `${this.getBase(parsed)}/favicon.ico`;
  }

  addCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      this.bookmarksService.add({
        parentId: this.bookmarksService.readingListId,
        url: tab.url,
        title: tab.title,
      });
    });
  }

  randomBookmark() {
    const randomIndex = Math.floor(Math.random() * this.bookmarks.length);
    this.onClick(this.bookmarks[randomIndex]);
  }

  removeBookmark(bookmark: chrome.bookmarks.BookmarkTreeNode) {
    this.bookmarksService.remove(bookmark);
  }

  sort() {
    this.isSorted.next(!this.isSorted.getValue());
  }

  private parse(url): ParsedUrl {
    const parser = document.createElement('a');
    parser.href = url;

    return {
        protocol: parser.protocol, // => "http:"
        hostname: parser.hostname, // => "example.com"
        port: parseInt(parser.port, 10),     // => "3000"
        pathname: parser.pathname, // => "/pathname/"
        search: parser.search,   // => "?search=test"
        hash: parser.hash,     // => "#hash"
        host: parser.host     // => "example.com:3000"
    };
  }

  private getBase(parsed: ParsedUrl): string {
    let base = `${parsed.protocol}//${parsed.hostname}`;
    if (parsed.port) {
        base = `${base}:${parsed.port}`;
    }

    return base;
  }
}

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: number;
  pathname: string;
  search: string;
  hash: string;
  host: string;
}
