import {Component, ElementRef, ViewChild} from '@angular/core';
import { first } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { User } from '../_models';
import { UserService } from '../_services';
import { Fournisseur } from '../_models/fournisseur';
import { Lot } from '../_models/lot';
import { LotService } from '../_services/lot.service';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  loading = false;
  // Objet modèle user
  users: User;
  // Objet modèle fourisseur
  fournisseur: Fournisseur;
  // Objet modèle tableau
  lots: Lot[];

  // début export Excel
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Liste des lots');
    XLSX.writeFile(wb, 'Liste_des_lots.xlsx');
  }
  // fin export Excel
  constructor(private userService: UserService, private lotService: LotService) { }

  ngOnInit() {
    this.loading = true;
    if (window.localStorage.getItem('utilisateur')) {
      this.loading = false;
      const objLinea = localStorage.getItem('utilisateur');
      this.users = JSON.parse(objLinea) ;
      this.fournisseur = this.users.fournisseurs;
      this.findLots();
    }else{
      this.userService.getMy(window.localStorage.getItem('email')).pipe(first()).subscribe(users => {
        this.loading = false;
        users['hydra:member'].forEach(elements => {
          const objLinea = JSON.stringify(elements);
          this.users = elements;
          window.localStorage.setItem('utilisateur', objLinea);
          this.fournisseur = this.users.fournisseurs;
          this.findLots();
        });
      });
    }
    // console.log(this.users);
  }
  // Fonction pour récuperer les lots
  findLots()
  {
    if (window.localStorage.getItem('lots')) {
      this.lots = JSON.parse(window.localStorage.getItem('lots'));
    } else {
      this.lotService.getLots(this.users.fournisseurs.id).pipe(first()).subscribe(lotsData => {
        this.lots = lotsData['hydra:member'];
        const objLots = JSON.stringify(lotsData['hydra:member']);
        window.localStorage.setItem('lots', objLots);
      });
    }
  }
}
