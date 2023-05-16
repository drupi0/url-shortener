import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, first, forkJoin, interval, map, switchMap, tap } from 'rxjs';
import { environment } from 'src/environment';
import { ApiService, UrlData } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  longUrl: string = "";
  accountId: string = "";
  error: string = "";
  showNewLink: boolean = false;

  @ViewChild("UrlLinks")
  urlLinkContainer: ElementRef | undefined;

  ngOnInit(): void {
    this.accountId = this.api.retrieveAccountId();
    this.api.retrieveUrls(this.accountId).subscribe();
  }

  scrollToUrlList(): Observable<[number, number]> {
    return forkJoin([interval(10).pipe(first(), tap(() => {
      this.urlLinkContainer?.nativeElement.scrollIntoView({ behavior: 'smooth'});
      this.showNewLink = true;
    })), interval(1000).pipe(first(), tap(() => { this.showNewLink = false; }))])
  }

  shortenUrl(): void {
    if(!this.longUrl.trim().length) {
      this.error = "Enter a valid URL";
      return;
    }

    this.api.saveUrl(this.longUrl, this.accountId).pipe(catchError((e) => {
      this.error = "Invalid URL supplied";
      return EMPTY;
    }), switchMap(() => this.scrollToUrlList())).subscribe(() => {
      this.longUrl = "";
      this.error = "";
    });
  }

  fetchAllUrlsForAccount(): Observable<UrlData[]> {
    return this.api.getUrls(this.accountId);
  }

  getShortLink(url: UrlData): string {
    return `${environment.apiUrl || window.location.host }/s/${ url.shortId }`;
  }

  copyLink(url: UrlData, copyButton: HTMLButtonElement): void {
    const textHolder = document.createElement('input');
    textHolder.type = 'text';
    textHolder.value = `${environment.apiUrl || window.location.protocol + "//" +  window.location.host}/s/${ url.shortId }`;
    document.body.append(textHolder);
    textHolder.select();
    document.execCommand("Copy");
    document.body.removeChild(textHolder);

    copyButton.innerText = "Copied!";
    copyButton.classList.add("text-orange-500", "border-orange-500");

    interval(1000).pipe(first()).subscribe(() => {
      copyButton.innerText = "Copy Link";
      copyButton.classList.remove("text-orange-500", "border-orange-500");
    });
  }

  constructor(private api: ApiService){}
}
