import { Component, ElementRef, OnInit } from '@angular/core';
import { ApiService, UrlData } from './api.service';
import { EMPTY, catchError, first, interval, map } from 'rxjs';
import { environment } from 'src/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  longUrl: string = "";
  accountId: string = "";
  error: string = "";

  ngOnInit(): void {
    this.accountId = this.api.retrieveAccountId();
  }

  shortenUrl() {
    if(!this.longUrl.trim().length) {
      this.error = "Enter a valid URL";
      return;
    }

    this.api.saveUrl(this.longUrl, this.accountId).pipe(catchError(() => {
      this.error = "Invalid URL supplied";
      return EMPTY;
    })).subscribe(() => {
      this.longUrl = "";
      this.error = "";
    });
  }

  fetchAllUrlsForAccount() {
    return this.api.getUrls(this.accountId);
  }

  getShortLink(url: UrlData) {
    return `${environment.apiUrl}/s/${ url.shortId }`;
  }

  copyLink(url: UrlData, copyButton: HTMLButtonElement) {
    const textHolder = document.createElement('input');
    textHolder.type = 'text';
    textHolder.value = `${environment.apiUrl}/s/${ url.shortId }`;
    document.body.append(textHolder);
    textHolder.select();
    document.execCommand("Copy");
    document.body.removeChild(textHolder);

    copyButton.innerText = "Copied!";

    interval(1000).pipe(first()).subscribe(() => {
      copyButton.innerText = "Copy Link";
    });
  }

  constructor(private api: ApiService){}
}
