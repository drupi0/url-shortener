import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApiService, UrlData } from './api.service';
import { environment } from 'src/environment';
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing'; 

describe('AppComponent', () => {
  let apiService: ApiService;
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppComponent, provideHttpClientTesting()],
      imports: [HttpClientModule]
    });

    component = TestBed.inject(AppComponent);
    apiService = jasmine.createSpyObj('ApiService', ['saveUrl', 'getUrls']);
    (component as any).api = apiService;
  });

  it('should scroll to url list and show new link', fakeAsync(() => {
    component.urlLinkContainer = new ElementRef<HTMLDivElement>(document.createElement('div'));

    const scrollIntoViewSpy = spyOn(component.urlLinkContainer.nativeElement, 'scrollIntoView');

    component.scrollToUrlList().subscribe(() => {
      expect(scrollIntoViewSpy).toHaveBeenCalled();
      expect(component.showNewLink).toBe(false);
    });

    tick(1015);
  }));

  it('should handle empty longUrl in shortenUrl', () => {
    component.longUrl = '   ';
    component.shortenUrl();

    expect(component.error).toBe('Enter a valid URL');
    expect(apiService.saveUrl).not.toHaveBeenCalled();
  });

  it('should return short link', () => {
    const urlData = { shortId: 'abc123' };
    environment.apiUrl = 'http://test';
    const shortLink = component.getShortLink(urlData as UrlData);

    expect(shortLink).toBe(`${environment.apiUrl}/s/abc123`);
  });

  it('should copy link and update button', () => {
    const urlData = { shortId: 'abc123' } as UrlData;
    const execCommandSpy = spyOn(document, 'execCommand');
    const copyButton = document.createElement('button');

    component.copyLink(urlData, copyButton);

    expect(execCommandSpy).toHaveBeenCalledWith('Copy');
    expect(copyButton.innerText).toBe('Copied!');
  });
});
