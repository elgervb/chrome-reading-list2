import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarksComponent } from './containers';
import { BookmarkListComponent, BookmarkHeaderComponent, BookmarkFooterComponent } from './components';
import { BookmarksRoutingModule } from './bookmarks-routing.module';
import { FaviconPipe } from './pipes/favicon.pipe';
import { LazyImgDirective, DEFAULT_LAZY_IMAGE } from './directives';
import { StoreModule } from '@ngrx/store';
import * as fromBookmarks from './reducers/bookmarks.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BookmarksEffects } from './effects/bookmarks.effects';

export const DEFAULT_IMAGE = '/assets/bookmark-default.svg';

@NgModule({
  declarations: [
    BookmarksComponent,
    BookmarkListComponent,
    BookmarkHeaderComponent,
    BookmarkFooterComponent,
    FaviconPipe,
    LazyImgDirective
  ],
  imports: [
    CommonModule,
    BookmarksRoutingModule,
    StoreModule.forFeature(fromBookmarks.bookmarksFeatureKey, fromBookmarks.reducer),
    EffectsModule.forFeature([BookmarksEffects])
  ],
  providers: [
    { provide: DEFAULT_LAZY_IMAGE, useValue: DEFAULT_IMAGE }
  ]
})
export class BookmarksModule { }
