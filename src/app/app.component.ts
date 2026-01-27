import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { APIResponse, Customer } from './model/train';
import { FormsModule } from '@angular/forms';
import { TrainService } from './service/train.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environments';
import { from } from 'rxjs';
import Swal from 'sweetalert2';

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
  
  /* ======================
   RAILWAY STYLE POPUPS
   ====================== */

// ✅ Success – Center (professional)
showRailwaySuccess(message: string, delay: number = 600) {
  setTimeout(() => {
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000,              // 👈 popup visible time
      backdrop: 'rgba(0,0,0,0.5)',
      background: '#ffffff',
      color: '#111827',
      iconColor: '#16a34a',
      customClass: {
        popup: 'railway-success-popup'
      }
    });
  }, delay);                     // 👈 popup show delay
}


// ❌ Error – Toast (simple)
showRailwayError(message: string) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 2200,
    background: '#ffffff',
    color: '#111827',
    iconColor: '#dc2626'
  });
}

  selectedVoice: SpeechSynthesisVoice | null = null;

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
    
    this.showRailwaySuccess('Logged out successfully');
    // Page reload to reset state
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

//   onRegister() {

//   // 🔒 Frontend safety check (extra layer)
//   if (
//     !this.registerObj.firstName ||
//     !this.registerObj.lastName ||
//     !this.registerObj.email ||
//     !this.registerObj.phone ||
//     !this.registerObj.password
//   ) {
//     alert('Please fill all required fields');
//     return;
//   }

//   // 📞 Mobile validation (India)
//   if (!/^[6-9]\d{9}$/.test(this.registerObj.phone)) {
//     alert('Enter valid 10 digit mobile number');
//     return;
//   }

//   // 📧 Email validation
//   if (!/^\S+@\S+\.\S+$/.test(this.registerObj.email)) {
//     alert('Enter valid email address');
//     return;
//   }

//   // 🔐 Password rule
//   if (this.registerObj.password.length < 6) {
//     alert('Password must be at least 6 characters');
//     return;
//   }

//   // 🚀 API CALL (unchanged)
//   this.trainService
//     .createNewCustomer(this.registerObj)
//     .subscribe((res: APIResponse) => {
//       if (res.result) {
//       this.showRailwaySuccess('Registration Successful');
//         this.closeRegister();
//       } else {
//         this.showRailwayError(String(res.message || 'Registration failed'));

//       }
//     });
// }

// onRegister() {

//   if (
//     !this.registerObj.firstName ||
//     !this.registerObj.lastName ||
//     !this.registerObj.email ||
//     !this.registerObj.phone ||
//     !this.registerObj.password
//   ) {
//     this.showRailwayError('Please fill all required fields');
//     return;
//   }

//   if (!/^[6-9]\d{9}$/.test(this.registerObj.phone)) {
//     this.showRailwayError('Enter valid 10 digit mobile number');
//     return;
//   }

//   if (!/^\S+@\S+\.\S+$/.test(this.registerObj.email)) {
//     this.showRailwayError('Enter valid email address');
//     return;
//   }

//   if (this.registerObj.password.length < 6) {
//     this.showRailwayError('Password must be at least 6 characters');
//     return;
//   }

//   this.trainService
//     .createNewCustomer(this.registerObj)
//     .subscribe((res: APIResponse) => {
//       if (res.result) {
//         this.showRailwaySuccess('Registration successful');
//         this.closeRegister();
//       } else {
//         this.showRailwayError(String(res.message || 'Registration failed'));
//       }
//     });
// }
  
onRegister() {

  // basic validation (OK)
  if (
    !this.registerObj.firstName ||
    !this.registerObj.lastName ||
    !this.registerObj.email ||
    !this.registerObj.phone ||
    !this.registerObj.password
  ) {
    this.showRailwayError('Please fill all required fields');
    return;
  }

  if (!/^[6-9]\d{9}$/.test(this.registerObj.phone)) {
    this.showRailwayError('Enter valid 10 digit mobile number');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(this.registerObj.email)) {
    this.showRailwayError('Enter valid email address');
    return;
  }

  if (this.registerObj.password.length < 6) {
    this.showRailwayError('Password must be at least 6 characters');
    return;
  }

  this.trainService.createNewCustomer(this.registerObj).subscribe({
    next: (res: APIResponse) => {
      if (res.result) {
        this.showRailwaySuccess('Registration successful');
        this.closeRegister();
      } else {
        this.handleFreeApiError(res.message);
      }
    },
    error: (err) => {
      this.handleFreeApiError(err?.error?.message);
    }
  });
}
handleFreeApiError(message: any) {

  const msg = String(message || '');

  if (msg.includes('Sequence contains more than one element')) {
    this.showRailwayError(
      'Mobile number already registered. Please login.'
    );

    // optional auto-switch
    setTimeout(() => {
      this.closeRegister();
      this.openLogin();
    }, 3000);

    return;
  }

  this.showRailwayError('Registration failed. Please try again.');
}



// password toggle (login)
showLoginPassword: boolean = false;

toggleLoginPassword() {
  this.showLoginPassword = !this.showLoginPassword;
}

// allow only numbers (reuse register wala bhi chalega)



  onLogin() {
    this.trainService.onLogin(this.loginObj).subscribe((res: APIResponse) => {
      if (res.result) {
      this.showRailwaySuccess('Login Successful');
        localStorage.setItem('token', JSON.stringify(res.data));
        this.loggedInUser = res.data;
        this.closeLogin();
        // this.loginObj = null;
        this.loginObj = { phone: '', password: '' };
      } else {
        this.showRailwayError(String(res.message || 'Login failed'));
      }
    });
     

  
  }
  
  // date and time
  language: 'en' | 'hi' = 'en';
  currentDateTime = '';

  ngOnInit() {
    window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();

    // 🔥 Priority order (Chrome best)
    this.selectedVoice =
      voices.find(v => v.lang === 'en-IN') ||   // stable
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] || null;

    console.log('🔊 Locked voice:', this.selectedVoice?.name);
  };
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

  if (this.isChatOpen && this.messages.length === 0) {
    this.messages.push({
      from: 'bot',
      text: "Hi 👋 I’m AskRail AI, your railway assistant, created by Kundan Rajak. I can help you with train booking, PNR status, Tatkal rules, fares, and travel guidance."
    });
  }
}



  // chatbot function
sendMessage() {
  if (!this.userText.trim()) return;

  const userMessage = this.userText;

  // ✅ user ka message sirf text me dikhao (no voice)
  this.messages.push({
    from: 'user',
    text: userMessage
  });

  this.userText = '';

  // ✅ backend ko call
  this.http.post<any>(
    // 'http://localhost:3000/api/chat',
     'https://train-backend.onrender.com/api/chat', 
    { message: userMessage }
  ).subscribe({
    next: (res: any) => {
      const botReply =
        res?.choices?.[0]?.message?.content || 'Sorry, no response';

      // ✅ AI reply = type + speak
      this.typeAndSpeak(botReply);
    },
    error: () => {
      this.messages.push({
        from: 'bot',
        text: 'Sorry, your internet is slow.'
      });
    }
  });
}


// Voice Recognition
isListening=false;
recognition: any;
startVoice() {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice recognition not supported in this browser.");
    return;
  }

  this.recognition = new SpeechRecognition();
  this.recognition.lang = 'en-IN'; // hi-IN if Hindi
  this.recognition.interimResults = false;
  this.recognition.continuous = false;

  this.isListening = true; // 🔥 overlay ON
  this.recognition.start();

  // ✅ RESULT
  this.recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    this.userText = transcript;
    this.isListening = false; // overlay OFF
    this.recognition.stop();
    this.sendMessage();
  };

  // ✅ ERROR HANDLER (IMPORTANT)
  this.recognition.onerror = (event: any) => {
    console.error('Voice error:', event);
    this.isListening = false;
    this.recognition.stop();
  };

  // ✅ END HANDLER (MOST IMPORTANT)
  this.recognition.onend = () => {
    this.isListening = false;
  };
}


// chatbot voice for desktop 
typeAndSpeak(text: string) {
  let index = 0;
  const botMsg = { from: 'bot', text: '' };
  this.messages.push(botMsg);

  // ⌨️ typing effect
  const interval = setInterval(() => {
    if (index < text.length) {
      botMsg.text += text[index++];
    } else {
      clearInterval(interval);
    }
  }, 20);

  // 🔊 FORCE SPEAK (NO CONDITIONS)
  if (this.selectedVoice) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.selectedVoice;
    utterance.lang = this.selectedVoice.lang;
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }
}
// chat voiice for Mobile 
speakMobile(text: string) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[अ-ह]/.test(text) ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.95;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
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
