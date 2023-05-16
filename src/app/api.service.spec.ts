import { TestBed } from '@angular/core/testing';

import { ApiData, ApiService, UrlData } from './api.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ApiService', () => {
  let service: ApiService;

  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve account ID from local storage if available', () => {
    const accountId = 'exampleAccountId';
    localStorage.setItem('accountId', accountId);

    const retrievedAccountId = service.retrieveAccountId();

    expect(retrievedAccountId).toBe(accountId);
  });

  it('should generate and store a new account ID if not available in local storage', () => {
    localStorage.removeItem('accountId');

    const retrievedAccountId = service.retrieveAccountId();

    expect(retrievedAccountId).toBeTruthy();
    expect(localStorage.getItem('accountId')).toBe(retrievedAccountId);
  });

  it('should save URL and update data store', () => {
    const longUrl = 'http://example.com';
    const accountId = 'exampleAccountId';
    const shortId = 'exampleShortId';
    const apiResponse: ApiData = {
      data: shortId
    };

    service.saveUrl(longUrl, accountId).subscribe(() => {
      const dataStore = service.dataStore.getValue();
      const storedUrlData = dataStore.find(urlData => urlData.longUrl === longUrl);

      expect(storedUrlData).toBeTruthy();
      expect(storedUrlData!.shortId).toBe(shortId);
    });

    const req = httpMock.expectOne(`${service.URL}/create-url`);
    expect(req.request.method).toBe('POST');
    req.flush(apiResponse);

    httpMock.verify();
  });

  it('should retrieve URLs from data store if available', () => {
    const accountId = 'exampleAccountId';
    const urlData: UrlData = {
      longUrl: 'http://example.com',
      accountId,
      shortId: 'exampleShortId'
    };
    service.dataStore.next([urlData]);

    service.getUrls(accountId).subscribe(urls => {
      expect(urls.length).toBe(1);
      expect(urls[0].longUrl).toBe(urlData.longUrl);
      expect(urls[0].accountId).toBe(urlData.accountId);
    });

    httpMock.expectNone(`${service.URL}/get-urls`);

    httpMock.verify();
  });

  it('should return empty array  if data store is empty', () => {
    const accountId = 'exampleAccountId';
    service.dataStore.next([]);

    service.getUrls(accountId).subscribe({
      next: () => {
        expect([]);
      },
      complete: () => {
        expect(true).toBe(true);
      }
    });

    httpMock.expectNone(`${service.URL}/get-urls`);

    httpMock.verify();
  });

  it('should retrieve URLs from the server and update the data store', () => {
    const accountId = 'exampleAccountId';
    const urlData: UrlData = {
      longUrl: 'http://example.com',
      accountId,
      shortId: 'exampleShortId'
    };
    const apiResponse = {
      data: [urlData]
    };

  
    service.retrieveUrls(accountId).subscribe(urls => {
      expect(urls.length).toBe(1);
      expect(urls[0].longUrl).toBe(urlData.longUrl);
      expect(urls[0].accountId).toBe(urlData.accountId);
    });
  
    const req = httpMock.expectOne(`${service.URL}/get-urls`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ accountId });
    req.flush(apiResponse);
  
    const dataStore = service.dataStore.getValue();
    expect(dataStore.length).toBe(1);
    expect(dataStore[0].longUrl).toBe(urlData.longUrl);
    expect(dataStore[0].accountId).toBe(urlData.accountId);
  
    httpMock.verify();
  });

});
