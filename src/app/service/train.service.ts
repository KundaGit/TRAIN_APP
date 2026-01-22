

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIResponse, Customer } from '../model/train';

@Injectable({
  providedIn: 'root'
})
export class TrainService {
 

  // apiUrl = "/api/TrainApp/";
  // apiUrl = "https://train-backend.onrender.com/api/TrainApp/";
  apiUrl = "https://train-backend-hh0n.onrender.com/api/TrainApp/";



  constructor(private http: HttpClient) { }

  getAllStations() {
    return this.http.get(`${this.apiUrl}GetAllStations`);

  }

  getTrainSearch(from: number, to: number, date: string) {
  return this.http.get(`${this.apiUrl}GetTrainSearch?from=${from}&to=${to}&date=${date}`);
}
createNewCustomer(obj:Customer){{
  return this.http.post<APIResponse>(`${this.apiUrl}AddUpdatePassengers`,obj);
}
}
onLogin(obj:any){{
  return this.http.post<APIResponse>(`${this.apiUrl}login`,obj);
}
}

}