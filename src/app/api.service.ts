import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, from, map, tap } from 'rxjs';
import { environment } from 'src/environment';

export interface ApiData {
  data: {}[] | string
}

export interface UrlData {
  shortId: string,
  longUrl: string,
  accountId: string
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  URL: string = environment.apiUrl;
  dataStore: BehaviorSubject<UrlData[]> = new BehaviorSubject([] as UrlData[]);

  constructor(private client: HttpClient) {
  }

  retrieveAccountId() {
    let accountId = localStorage.getItem("accountId");

    if(!accountId) {
      accountId = (+new Date).toString(36);
      localStorage.setItem("accountId", accountId); 
      return accountId;
    }

    return accountId;
  }

  saveUrl(longUrl: string, accountId: string) {
    const payload = {
      longUrl,
      accountId
    }

    return this.client.post<ApiData>(`${this.URL}/create-url`, payload).pipe(tap(apiResponse => {
      const { data } = apiResponse;

      if(!data) {
        return;
      }

      if(!this.dataStore.getValue().some(urlData => urlData.longUrl === longUrl)) {
        this.dataStore.next([...this.dataStore.getValue(), { longUrl, accountId, shortId: data as string }]);
      }

    }));

  }

  getUrls(accountId: string) {
    if(this.dataStore.getValue().length) {
      return this.dataStore.pipe(map(urlList => urlList.filter(urlData => urlData.accountId === accountId).reverse()));
    }

    const payload = { accountId };

    return this.client.post<{ data: UrlData[] }>(`${this.URL}/get-urls`, payload).pipe(tap(urlList => {
      this.dataStore.next(urlList.data);
    }), map(apiResponse => apiResponse.data));
  }

}
