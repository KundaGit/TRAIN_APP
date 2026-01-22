import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainService } from '../../service/train.service';
import { IsStation, Search } from '../../model/train';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OnlyNumberDirective } from '../../only-number.directive';
import { HomeComponent } from '../home/home.component';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-search',
  imports: [FormsModule, CommonModule, OnlyNumberDirective, HomeComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  trainService = inject(TrainService);

  // trainList:ITrain[]=[];
  //  selectedTrain?:ITrain

  // getTrainSearch(){
  //   this.trainService.getTrainSearch(this.searchData.fromStationId, this.searchData.toStationId, this.searchData.dateOfJourney).subscribe((res:any)=>{
  //     console.log(res);
  //   })
  // }
  getTrainSearch() {
    this.trainService
      .getTrainSearch(this.fromStationId, this.toStationId, this.dateOfJourney)
      .subscribe((res: any) => {
        console.log(res);
      });
  }

  showBooking = false;

  openBooking() {
    this.showBooking = true;
  }

  closeBooking() {
    this.showBooking = false;
  }

  // stationList: IsStation[] = [];
  // fromStationId: number = 0;
  // toStationId: number = 0;
  // dateOfJourney: string = '';
  stationList: any[] = [];
  fromStationId = 0;
  toStationId = 0;
  dateOfJourney = '';

  ngOnInit() {
    // 1) Load stations first
    this.trainService.getAllStations().subscribe((res: any) => {
      this.stationList = res.data;

      // 2) Ab route params read karo
      this.route.params.subscribe((params) => {
        console.log('Route Params:', params);

        this.fromStationId = Number(params['fromStationId']);
        this.toStationId = Number(params['toStationId']);
        this.dateOfJourney = params['dateOfJourney'];

        console.log(
          'After set:',
          this.fromStationId,
          this.toStationId,
          this.dateOfJourney
        );
      });
    });
  }

  loadAllStations() {
    this.trainService.getAllStations().subscribe((res: any) => {
      this.stationList = res.data;
    });
  }

  // Bindindg for search form

  modifySearch() {
    this.router.navigate([
      '/search',
      this.fromStationId,
      this.toStationId,
      this.dateOfJourney,
    ]);
  }

  // booking Model
  pName = '';
  pAge: number | null = null;
  passengers: any[] = [];

  addPassenger() {
    if (!this.pName || !this.pAge) {
      alert('Name and Age required');
      return;
    }

    this.passengers.push({
      name: this.pName,
      age: this.pAge,
    });

    this.pName = '';
    this.pAge = null;
  }

  removePassenger(index: number) {
    this.passengers.splice(index, 1);
  }

  pnr: string = ''; // dummy PNR for now
  fromStationName = 'DELHI (NDLS)';
  toStationName = 'MUMBAI (CSTM)';

  paymentMethod = '';
  totalAmount = 0;
  showPayment = false;
  pricePerSeat = 500; // Assuming a fixed fare of 500 per passenger

  gotToPayment() {
    this.pnr = '' + Math.floor(1000000000 + Math.random() * 9000000000);
    this.totalAmount = this.passengers.length * this.pricePerSeat; // Assuming a fixed fare of 500 per passenger
  //  Maping for from sattion and tostation
  this.fromStationName = this.getStationName(this.fromStationId);
  this.toStationName = this.getStationName(this.toStationId);
    this.showBooking = false;
    this.showPayment = true;
  }

  closePayment() {
    this.showPayment = false;
  }
  // payNow() {
  //   alert('Payment Successful! Your tickets are booked.');
  //   console.log('Payment Data:', {
  //     amount: this.totalAmount,
  //     method: this.paymentMethod,
  //     passengers: this.passengers,
  //   });
  //   setTimeout(() => {
  //     alert('Payment Successful!');
  //     this.showPayment = false;
  //     this.passengers = [];
  //     this.paymentMethod = '';
  //   }, 1200);
  // }
  // station name mapping
  getStationName(id: number) {
    const st = this.stationList.find((x) => x.stationID == id);
    return st ? st.stationName : '';
  }

  // payment methods
  upiId = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  selectedBank = '';

  canPay(): boolean {
    if (this.paymentMethod === 'UPI') {
      return this.upiId.trim().length > 5;
    }
    if (this.paymentMethod === 'CARD') {
      return (
        this.cardNumber.length >= 12 &&
        this.cardExpiry.length >= 4 &&
        this.cardCvv.length >= 3
      );
    }
    if (this.paymentMethod === 'NET') {
      return this.selectedBank !== '';
    }
    return false;
  }
  isPaying = false;
 

  allowOnlyNumber(e: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    if (allowedKeys.includes(e.key)) return;

    // Agar key number nahi hai to rok do
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }

  onCardInput(val: string) {
    let v = val.replace(/[^0-9]/g, '');
    if (v.length > 12) v = v.slice(0, 12);
    this.cardNumber = v;
  }

  onCvvInput() {
    this.cardCvv = this.cardCvv.replace(/\D/g, '');
    if (this.cardCvv.length > 3) {
      this.cardCvv = this.cardCvv.slice(0, 3);
    }
  }

  onExpiryInput() {
    // Sirf number aur slash rakho
    let v = this.cardExpiry.replace(/[^0-9/]/g, '');

    // Agar 2 digit ho gaye aur slash nahi hai to add karo
    if (v.length === 2 && !v.includes('/')) {
      v = v + '/';
    }

    // Agar slash ke baad 2 se zyada digit ho gaye to cut
    if (v.length > 5) {
      v = v.slice(0, 5);
    }

    this.cardExpiry = v;
  }

 
upiQr = '';

openUpiQr() {
  const upiData = `upi://pay?pa=merchant@upi&pn=TrainTicket&am=${this.totalAmount}`;
  const data = encodeURIComponent(upiData);

  this.upiQr =
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + data;

  console.log('QR URL:', this.upiQr);
}

// Payment success
paymentSuccess = false;
txnId = '';

payNow() {
  this.isPaying = true;

  setTimeout(() => {
    this.isPaying = false;
    this.paymentSuccess = true;
    this.txnId = 'TXN' + Math.floor(1000000000 + Math.random() * 9000000000);
  }, 1500);
}
loggedInUser: any = JSON.parse(localStorage.getItem('token') || '{}');
// download ticket as PDF


downloadTicket() {
  const doc = new jsPDF();

  const logoUrl =
    'https://5.imimg.com/data5/SELLER/Default/2021/2/GI/JR/US/4184318/irctc-agentship-provider-500x500.png';

  const from = this.fromStationName;
  const to = this.toStationName;
  const date = this.dateOfJourney;
  const name = `${this.loggedInUser.firstName} ${this.loggedInUser.lastName}`;
  const pnr = this.pnr;
  const bookingId = 'BK' + Date.now().toString().slice(-6);
  const train = 'Express';
  const passengers = this.passengers.map(p => p.name).join(', ');

  /* ===== Outer Card ===== */
  doc.setDrawColor(180);
  doc.setLineWidth(0.6);
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(10, 10, 190, 180, 14, 14, 'FD');

  /* ===== Header ===== */
  doc.setFillColor(40, 130, 230);
  doc.roundedRect(10, 10, 190, 35, 14, 14, 'F');

  doc.setFillColor(255, 255, 255);
  doc.circle(26, 28, 9, 'F');
  try { doc.addImage(logoUrl, 'PNG', 19, 21, 14, 14); } catch {}

  doc.setTextColor(255);
  doc.setFont('helvetica','bold');
  doc.setFontSize(18);
  doc.text('TRAIN TICKET', 105, 28, { align:'center' });
  doc.setFontSize(10);
  doc.text('E-Ticket', 105, 35, { align:'center' });
  doc.text(`PNR: ${pnr}`, 25, 44);
  doc.text(`Booking ID: ${bookingId}`, 145, 44);

  /* ===== Info Box ===== */
  doc.setTextColor(0);
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.setFillColor(255,255,255);
  doc.roundedRect(20, 55, 170, 60, 10, 10, 'FD');

  doc.setFont('helvetica','bold');
  doc.text('Name:', 28, 68);
  doc.text('From:', 28, 82);
  doc.text('To:', 28, 96);
  doc.text('Passengers:', 28, 110);
  doc.text('Date:', 100, 68);
  doc.text('Train:', 100, 82);

  doc.setFont('helvetica','normal');
  doc.text(name, 50, 68);
  doc.text(from, 50, 82);
  doc.text(to, 50, 96);
  doc.text(passengers, 60, 110);
  doc.text(date, 120, 68);
  doc.text(train, 120, 82);

  /* ===== QR ===== */
  const qrData = `Pessangers:${passengers},  PNR:${pnr}, From:${from}, To:${to}, Date:${date}`;
  QRCode.toDataURL(qrData).then(qrImg => {
    doc.addImage(qrImg, 'PNG', 150, 70, 30, 30);
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text('Scan for details', 165, 105, {align:'center'});

    /* ===== Fare Box ===== */
    doc.setDrawColor(180);
    doc.setLineWidth(0.6);
    doc.setFillColor(235, 255, 235);
    doc.roundedRect(20, 125, 170, 40, 12, 12, 'FD');
    doc.setFont('helvetica','bold');
    doc.setFontSize(13);
    doc.text('Fare Details', 28, 138);
    doc.setFont('helvetica','normal');
    doc.text(`Amount Paid: Rs ${this.totalAmount} Only`, 28, 155);

    /* ===== Footer ===== */
    doc.setFontSize(12);
    doc.setTextColor(40,140,40);
    doc.text('Payment Successful - Have a safe journey!', 105, 175, {align:'center'});

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      'Generated by Railway Booking System • Partner with Kundan',
      105, 200, { align:'center' }
    );

    

    doc.save('train-ticket.pdf');
  });
}










 

}
