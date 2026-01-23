import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { APIResponse, Customer } from './model/train';
import { FormsModule } from '@angular/forms';
import { TrainService } from './service/train.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environments';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLinkWithHref],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  registerObj: Customer = new Customer();
  trainService = inject(TrainService);
  loginObj: any = {
    phone: '',
    password: '',
  };
  departureStation: string = '';
  arrivalStation: string = '';

  loggedInUser: Customer = new Customer();
  constructor(private http: HttpClient) {
    const localData = localStorage.getItem('token');
    if (localData !== null) {
      this.loggedInUser = JSON.parse(localData);
    }
  }

  trainList: string[] = [
    'Vande Bharat',
    'Rajdhani',
    'Shatabdi',
    'Duronto',
    'Garib Rath',
    'Tejas',
    'Intercity',
    'Amrit Bharat',
    'Jan Shatabdi',
    'Humsafar',
    'Antyodaya',
    'Sampark Kranti',
    'Double Decker',
    'Mahamana',
    'Yuva',
  ];

  // onTrainSelect(train: string) {
  //   console.log(train);
  // }
  onTrainSelect(train: string) {
    this.selectedTrain = train;
    this.showTrainPanel = false; // click ke baad panel band
    console.log('Selected Train:', train);
  }
  toggleTrainPanel() {
    this.showTrainPanel = !this.showTrainPanel;
  }

  showTrainPanel = false;
  selectedTrain: string = '';

  onLogout() {
    localStorage.removeItem('token');
    this.loggedInUser = new Customer();
  }

  onRegister() {
    this.trainService
      .createNewCustomer(this.registerObj)
      .subscribe((res: APIResponse) => {
        if (res.result) {
          alert('Registration Successful');
          this.closeRegister();
        } else {
          alert(res.message);
        }
      });
  }

  onLogin() {
    this.trainService.onLogin(this.loginObj).subscribe((res: APIResponse) => {
      if (res.result) {
        alert('Login Successful');
        localStorage.setItem('token', JSON.stringify(res.data));
        this.loggedInUser = res.data;
        this.closeLogin();
        this.loginObj = null;
      } else {
        alert(res.message);
      }
    });
  }
  // date and time
  language: 'en' | 'hi' = 'en';
  currentDateTime = '';

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    const savedImg = localStorage.getItem('profileImage');
    if (savedImg) {
      this.profileImage = savedImg;
    }
  }

  setLanguage(lang: 'en' | 'hi') {
    this.language = lang;
    this.updateTime();
  }

  updateTime() {
    const now = new Date();

    this.currentDateTime =
      this.language === 'en'
        ? now.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : now.toLocaleString('hi-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
  }

  showLogin = false;
  showRegister = false;

  openLogin() {
    this.showLogin = true;
    this.showRegister = false;
  }

  closeLogin() {
    this.showLogin = false;
  }

  openRegister() {
    this.showRegister = true;
    this.showLogin = false;
  }

  closeRegister() {
    this.showRegister = false;
  }

  switchToRegister() {
    this.openRegister();
  }

  switchToLogin() {
    this.openLogin();
  }

  isChatOpen = false;
  userText = '';
  messages: any[] = [];

  // OPENAI_KEY = environment.OPENAI_KEY;

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  // chatbot function
sendMessage() {
  if (!this.userText.trim()) return;

  // user message UI me
  this.messages.push({ from: 'user', text: this.userText });

  // backend ko call
  this.http.post<any>(
    // 'http://localhost:3000/api/chat',   // 🔹 local test
    'https://train-backend.onrender.com/api/chat', 
    { message: this.userText }
  ).subscribe({
    next: (res) => {
      this.messages.push({
        from: 'bot',
        text: res.choices[0].message.content
      });
    },
    error: () => {
      this.messages.push({
        from: 'bot',
        text: 'Sorry, server error.'
      });
    }
  });

  this.userText = '';
}


  // User user Details
  showUserCard = false;

  toggleUserCard() {
    this.showUserCard = !this.showUserCard;
  }
  // Password Hide and show in card deatials
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  maskPassword(pwd: string): string {
    if (!pwd) return '***';
    return '*'.repeat(pwd.length);
  }

  // Uplaod Profile photo
  profileImage: string | null = null;

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = reader.result as string;
      localStorage.setItem('profileImage', this.profileImage);
    };
    reader.readAsDataURL(file);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event:MouseEvent){
    const target=event.target as HTMLElement;
    if(!target.closest('.user-card') && !target.closest('.user-btn')){
      this.showUserCard=false
    }
  }
}
