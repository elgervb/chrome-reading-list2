import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarksComponent } from './bookmarks.component';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockSelector, MockStore } from '@ngrx/store/testing';
import { VersionService } from '../../services/version/version.service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { GoogleAnalyticsService } from '@core/google-analytics.service';
import { State } from '../../reducers/bookmarks.reducer';

import { transform } from '@elgervb/mock-data';
import { selectBookmarks } from '../../selectors/bookmarks.selectors';

describe('BookmarksComponent', () => {

  let fixture: ComponentFixture<BookmarksComponent>;
  let component: BookmarksComponent;
  let store: MockStore<State>;

  const defaultBookmark = transform<chrome.bookmarks.BookmarkTreeNode>({
    url: 'https://url'
  });
  const mockSelectBooks: MockSelector = { selector: selectBookmarks, value: [defaultBookmark] };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        BookmarksComponent
      ],
      imports: [
        CommonModule
      ],
      providers: [
        provideMockStore<State>({ selectors: [mockSelectBooks] }),
        VersionService,
        ChangeDetectorRef,
        {
          provide: GoogleAnalyticsService, useValue: {
            create: jest.fn(),
            sendPageView: jest.fn(),
            sendEvent: jest.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting bookmarks', () => {

    it('selects a bookmark', () => {
      const bookmark = transform<chrome.bookmarks.BookmarkTreeNode>({
        url: 'https://url2'
      });
      (chrome.tabs.query as jest.Mock).mockImplementation((_, callback) => callback([{ url: 'https://nonexisting' }]));

      store.overrideSelector(selectBookmarks, [defaultBookmark, bookmark]);

      component.selectBookmark(bookmark);

      expect(chrome.tabs.query).toHaveBeenCalled();
      expect(chrome.tabs.create).toHaveBeenCalledWith({ url: bookmark.url });
    });

    it('selects a random bookmark', () => {
      const bookmark = transform<chrome.bookmarks.BookmarkTreeNode>({
        url: 'https://url2'
      });
      (chrome.tabs.query as jest.Mock).mockImplementation((_, callback) => callback([{ url: 'https://nonexisting' }]));

      store.overrideSelector(selectBookmarks, [bookmark]);

      component.randomBookmark();

      expect(chrome.tabs.query).toHaveBeenCalled();
      expect(chrome.tabs.create).toHaveBeenCalledWith({ url: bookmark.url });
    })
  })

  describe('filtering', () => {
    let setFilterSpy: jest.SpyInstance;

    beforeEach(() => setFilterSpy = jest.spyOn(component.filter, 'next'))

    it('applies a filter', () => {
      component.applyFilter('my-filter');

      expect(setFilterSpy).toHaveBeenCalledWith('my-filter');
    });
  })

  describe('analytics', () => {

    let analyticsService: GoogleAnalyticsService;

    beforeEach(() => analyticsService = TestBed.inject(GoogleAnalyticsService));

    it('should sendEvent on addBookmark', () => {
      const queryMock: jest.Mock = chrome.tabs.query as jest.Mock;
      queryMock.mockImplementation((_, callback) => callback([{ url: 'https://url', title: 'title' }]));
      component.addBookmark();

      expect(analyticsService.sendEvent).toHaveBeenCalledWith('bookmarks', 'add', 'https://url');
    });

    it('should sendEvent on randomBookmark', () => {
      component.randomBookmark();

      expect(analyticsService.sendEvent).toHaveBeenCalledWith('bookmarks', 'random', defaultBookmark.url);
    });

    it('should sendEvent on reviewPopoverShown', () => {
      component.reviewPopoverShown(true);
      expect(analyticsService.sendEvent).toHaveBeenCalledWith('review', 'show popover');

      component.reviewPopoverShown(false);
      expect(analyticsService.sendEvent).toHaveBeenCalledWith('review', 'hide popover');
    });

    it('should sendEvent on openReview', () => {
      const queryMock: jest.Mock = chrome.tabs.query as jest.Mock;
      queryMock.mockImplementation((_, callback) => callback());

      component.openReview();
      expect(analyticsService.sendEvent).toHaveBeenCalledWith('review', 'redirect');
    });

    it('should sendEvent on setSorting', () => {
      component.setSorting('url');
      expect(analyticsService.sendEvent).toHaveBeenCalledWith('bookmarks', 'sort', 'url:desc');

      component.setSorting('url');
      expect(analyticsService.sendEvent).toHaveBeenCalledWith('bookmarks', 'sort', 'url:asc');
    });

  });
});
