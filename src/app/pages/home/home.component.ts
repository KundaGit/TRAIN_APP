import { NgSelectModule } from '@ng-select/ng-select';
import { IsStation } from '../../model/train';
import { TrainService } from './../../service/train.service';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';


@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, NgSelectModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  trainService = inject(TrainService);
  router = inject(Router);
  stationList: IsStation[] = [];
  fromStationId: number = 0;
  toStationId: number = 0;
  dateOfJourney: string = '';
  loading: boolean = false;
  journeyDate: string = '';
  selectedDay: 'today' | 'tomorrow' | 'dayAfter' = 'today';
  showError = false;
  errorMessage = '';
  selectedSeat!: string;
  selectedTrain!: string;

  ngOnInit(): void {
    this.loadAllStations();
    const today = new Date();
    this.dateOfJourney = today.toISOString().split('T')[0];
  }
  loadAllStations() {
    debugger;
    this.trainService.getAllStations().subscribe((res: any) => {
      this.stationList = res.data;
       this.trainService.getAllStations().subscribe((res: any) => {
    this.stationList = res.data.map((st: any) => ({
      ...st,
      stationNameUpper: st.stationName.toUpperCase()
    }));
  });
    });
  }

  onSearch() {
    this.showError = false;
    this.errorMessage = '';
    // validation
    if (
      this.fromStationId === 0 ||
      this.toStationId === 0 ||
      !this.dateOfJourney
    ) {
      this.showError = true;
      this.errorMessage = 'Please select all fields';
      return;
    }
    if (this.fromStationId === this.toStationId) {
      this.showError = true;
      this.errorMessage = 'From and To station cannot be same';
      return;
    }
    //Loader ON
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      // Simulate API call
      this.router.navigate([
        '/search',
        this.fromStationId,
        this.toStationId,
        this.dateOfJourney,
      ]);
    }, 2000);
    console.log(
      'search completed for',
      this.fromStationId,
      this.toStationId,
      this.dateOfJourney
    );
  }
  // Search train
  

  // Hide the error whill input filled
  clearError() {
    this.showError = false;
    this.errorMessage = '';
  }

  // Pnr check

  pnrNumber: string = '';

  checkPnr() {
    if (this.pnrNumber.length !== 10) {
      alert('Please enter the valid 10-digit PNR number');
      return;
    }
    window.open(
      'https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en',
      '_blank'
    );
  }
  onPnrInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.pnrNumber = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = this.pnrNumber;
  }

  // swap train
 swapStations() {
  const temp = this.fromStationId;
  this.fromStationId = this.toStationId;
  this.toStationId = temp;
}

  // Date Modification like modern

  selectQuickDate(addDays: number, day: 'today' | 'tomorrow' | 'dayAfter') {
    this.selectedDay = day;

    const date = new Date();
    if (day === 'tomorrow') date.setDate(date.getDate() + 1);
    if (day === 'dayAfter') date.setDate(date.getDate() + 2);

    this.journeyDate = date.toISOString().split('T')[0];
    this.dateOfJourney = this.journeyDate;
  }
  // Seat Explainer Logic
  seatType: string = '3A';
  seatInfo: any = null;

  showSeatInfo() {
    const seatData: any = {
      SL: {
        title: 'Sleeper Class (SL)',
        bed: '3-tier sleeping beds',
        ac: 'No AC coach',
        bestFor: 'Budget travellers',
        price: 'Low price',
      },
      '3A': {
        title: 'AC 3 Tier (3A)',
        bed: '3-tier sleeping beds',
        ac: 'AC coach',
        bestFor: 'Family & night travel',
        price: 'Medium price',
      },
      '2A': {
        title: 'AC 2 Tier (2A)',
        bed: '2-tier sleeping beds',
        ac: 'AC coach',
        bestFor: 'Comfort travellers',
        price: 'High price',
      },
      '1A': {
        title: 'First AC (1A)',
        bed: 'Private cabin',
        ac: 'AC coach',
        bestFor: 'Luxury travel',
        price: 'Very high price',
      },
      CC: {
        title: 'Chair Car (CC)',
        bed: 'Sitting seats',
        ac: 'AC coach',
        bestFor: 'Short daytime travel',
        price: 'Medium price',
      },
      EC: {
        title: 'Executive Chair (EC)',
        bed: 'Premium sitting seats',
        ac: 'AC coach',
        bestFor: 'Business class travel',
        price: 'High price',
      },
    };

    this.seatInfo = seatData[this.seatType];
  }

  distanceKm = 0;
  estimatedFare: any = null;

  calculateFare() {
    this.distanceKm = Math.floor(Math.random() * 800) + 100;

    const rate = {
      SL: 1.2,
      A3: 2.5,
      A2: 3.5,
      A1: 5,
    };

    this.estimatedFare = {
      SL: Math.round(this.distanceKm * rate.SL),
      A3: Math.round(this.distanceKm * rate.A3),
      A2: Math.round(this.distanceKm * rate.A2),
      A1: Math.round(this.distanceKm * rate.A1),
    };
  }
  loggedInUser: any = JSON.parse(localStorage.getItem('token') || '{}');


  getStationNameById(id: number) {
    const station = this.stationList.find((s) => s.stationID == id);
    return station ? station.stationName : 'Unknown';
  }

  downloadTicket() {
    const doc = new jsPDF();

    const logoUrl =
      'https://5.imimg.com/data5/SELLER/Default/2021/2/GI/JR/US/4184318/irctc-agentship-provider-500x500.png';

    const from = this.getStationNameById(this.fromStationId);
    const to = this.getStationNameById(this.toStationId);
    const date = this.dateOfJourney;
    const seat = this.selectedSeat || '3A';
    const train = this.selectedTrain || 'Express';
    const name = `${this.loggedInUser.firstName} ${this.loggedInUser.lastName}`;
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const bookingId = 'BK' + Date.now().toString().slice(-6);

    // ===== OUTER CARD =====
    doc.setDrawColor(180);
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(10, 12, 190, 170, 14, 14, 'FD');

    // ===== HEADER BAR =====
    doc.setFillColor(30, 136, 229);
    doc.roundedRect(10, 12, 190, 32, 14, 14, 'F');

    // Logo circle
    doc.setFillColor(255, 255, 255);
    doc.circle(26, 28, 9, 'F');
    try {
      doc.addImage(logoUrl, 'PNG', 19, 21, 14, 14);
    } catch {}

    // Header Text
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TRAIN TICKET', 105, 28, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Sample Ticket – Not for travel', 105, 35, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text(`PNR: ${pnr}`, 25, 42);
    doc.text(`Booking ID: ${bookingId}`, 145, 42);

    // Reset
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    doc.setFontSize(40);
    doc.setTextColor(230, 230, 230);
    doc.setFont('helvetica', 'bold');
    doc.text('SAMPLE TICKET', 105, 110, {
      align: 'center',
      angle: 30,
    });
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // ===== INFO SECTION =====
    doc.setDrawColor(220);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, 50, 170, 55, 10, 10, 'FD');

    // Labels bold, values normal
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', 28, 62);
    doc.text('To:', 28, 80);
    doc.text('Seat:', 28, 98);
    doc.text('From:', 90, 62);
    doc.text('Date:', 90, 80);
    doc.text('Train:', 90, 98);
    doc.setFont('helvetica', 'normal');
    doc.text(name, 45, 62);
    doc.text(to, 45, 80);
    doc.text(seat, 50, 98);
    doc.text(from, 110, 62);
    doc.text(date, 110, 80);
    doc.text(train, 110, 98);
    // Divider
    doc.setDrawColor(220);
    doc.line(28, 118, 182, 118);

    // ===== QR CODE =====
    const qrData = `
Name: ${name}
From: ${from}
To: ${to}
Date: ${date}
Seat: ${seat}
Train: ${train}
`;

    QRCode.toDataURL(qrData).then((qrImg: string) => {
      // QR background box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(150, 55, 32, 32, 6, 6, 'F');

      // QR image
      doc.addImage(qrImg, 'PNG', 152, 57, 28, 28);

      // QR label
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text('Scan for details', 166, 92, { align: 'center' });

      // ===== FARE SECTION =====
      doc.setFillColor(230, 255, 230);
      doc.roundedRect(20, 108, 170, 40, 10, 10, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Fare Details', 28, 114);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      if (this.estimatedFare) {
        doc.text(`Sleeper: Rs ${this.estimatedFare.SL}`, 28, 126);
        doc.text(`3A: Rs ${this.estimatedFare.A3}`, 110, 126);
        doc.text(`2A: Rs ${this.estimatedFare.A2}`, 28, 138);
        doc.text(`1A: Rs ${this.estimatedFare.A1}`, 110, 138);
      }

      // ===== FOOTER =====
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
      doc.text('Have a safe journey!', 105, 178, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        'Generated by Railway Booking System • Partner with Kundan',
        105,
        186,
        { align: 'center' }
      );

      doc.save('train-ticket.pdf');
    });
  }
}
