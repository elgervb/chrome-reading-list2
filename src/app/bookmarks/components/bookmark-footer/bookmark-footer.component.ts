import { Component, OnInit, EventEmitter, Output, Input, ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-bookmark-footer',
  templateUrl: './bookmark-footer.component.html',
  styleUrls: ['./bookmark-footer.component.css']
})
export class BookmarkFooterComponent implements OnInit {

  @Input() filter?: string;
  @Input() bookmarks: chrome.bookmarks.BookmarkTreeNode[];

  @Output() readonly filterEvent = new EventEmitter<string>();
  @Output() readonly randomBookmarkEvent = new EventEmitter<void>();
  @Output() readonly openReviewEvent = new EventEmitter<void>();

  @ViewChild('popoverTemplate') popoverRef: TemplateRef<HTMLElement>;

  displayPopover = false;

  constructor() { }

  ngOnInit() { }
}
