import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EMPTY, catchError, finalize, first, interval } from 'rxjs';
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
    
  }

  shortenUrl() {
    if(!this.longUrl.trim().length) {
      this.error = "Enter a valid URL";
      return;
    }

    this.api.saveUrl(this.longUrl, this.accountId).pipe(catchError((e) => {
      console.log(e);
      this.error = "Invalid URL supplied";
      return EMPTY;
    })).subscribe(() => {
      this.longUrl = "";
      this.error = "";
      
      this.urlLinkContainer?.nativeElement.scrollIntoView({ behavior: 'smooth'});
      this.showNewLink = true;

      interval(1000).pipe(first()).subscribe(() => {
        this.showNewLink = false;
      });
    });
  }

  fetchAllUrlsForAccount() {
    return this.api.getUrls(this.accountId);
  }

  getShortLink(url: UrlData) {
    return `${environment.apiUrl || window.location.host }/s/${ url.shortId }`;
  }

  copyLink(url: UrlData, copyButton: HTMLButtonElement) {
    const textHolder = document.createElement('input');
    textHolder.type = 'text';
    textHolder.value = `${environment.apiUrl || window.location.host}/s/${ url.shortId }`;
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
