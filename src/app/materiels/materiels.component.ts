import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {first} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../_models';
import { Materiel } from '../_models/materiel';
import {Lot} from '../_models/lot';
import {UserService} from '../_services';
import {LotService} from '../_services/lot.service';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import {Fournisseur} from '../_models/fournisseur';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({ templateUrl: 'materiels.component.html' })
export class MaterielsComponent implements OnInit {
  constructor(private userService: UserService, private lotService: LotService, private route: ActivatedRoute, private router: Router) { }
  loading = false;
  // Objet modèle user
  users: User;
  // Objet modèle fourisseur
  fournisseur: Fournisseur;
  // Objet modèle tableau
  lots: Lot[];
  // id lot
  id: number;
  // Matériel ayant du stockage de données
  certificatmateriels: Materiel[] = [];
  // Fake Materiel en attendant le backend TODO Matériel
  materiels = [
    {
      id: 1,
      type: 'Ordinateur',
      marque: 'Asus',
      modele: 'N55S',
      nSerieFab: 'BAN0BC235477435',
      nInterne: '208280',
      closeAt: '',
      etat: 'Reconditionné',
      donnees: true
    },
    {
      id: 1,
      type: 'Imprimante Lazer',
      marque: 'Epson',
      modele: 'M2400',
      nSerieFab: '123456789',
      nInterne: '208204',
      closeAt: '',
      etat: 'Reconditionné',
      donnees: false
    },
    {
      id: 1,
      type: 'Ordinateur Portable',
      marque: 'Toshiba',
      modele: 'Satelite 75W',
      nSerieFab: '123454589',
      nInterne: '219504',
      closeAt: '',
      etat: 'Reconditionné',
      donnees: true
    },
    {
      id: 1,
      type: 'Imprimante Lazer',
      marque: 'Epson',
      modele: 'M2400',
      nSerieFab: '123456789',
      nInterne: '208204',
      closeAt: '',
      etat: 'Reconditionné',
      donnees: false
    },
    {
      id: 1,
      type: 'Imprimante Lazer',
      marque: 'Epson',
      modele: 'M2400',
      nSerieFab: '123456789',
      nInterne: '208204',
      closeAt: '',
      etat: 'Reconditionné',
      donnees: false
    }
  ];
  private routeSub: any;
  private idLien: number;
  // Debut Export
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lot N°' + this.id);
    XLSX.writeFile(wb, 'liste_matereil_lot_' + this.id + '.xlsx');
  }
  // fin Export
  ngOnInit() {
    // console.log(this.materiels);
    // console.log(this.certificatmateriels);
    const certificatmateriels = this.certificatmateriels
    this.materiels.forEach( function ( value) {
      if ( value.donnees ) {
        certificatmateriels.push(value);
      }
    });
    this.findLots();
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params.id;
    });
    // Verifie que l'id est bien dans les lots
    const idLien = this.id;
    // tslint:disable-next-line:triple-equals
    if (!this.lots.find(item => item.id == idLien)){
      this.router.navigate(['/']);
    }
    // fin de vérification de l'id Route au Id Lots
    this.loading = true;
    if (window.localStorage.getItem('utilisateur')) {
      this.loading = false;
      const objLinea = localStorage.getItem('utilisateur');
      this.users = JSON.parse(objLinea) ;
      this.fournisseur = this.users.fournisseurs;
    }
  }

  // Fonction pour récupérer les lots par leurs ID
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
  generatePdf(){
    const documentDefinition = {
      content: [
        {
          columns: [
            [
              {
                text: 'BlueConfig Informatique',
                bold: true
              },
              { text: ' 2 Avenue des Fontaines' },
              { text: '64680 Ogeu-les-Bains' },
              { text: '07 82 21 89 18' }
            ],
            [
              {
                text: `Date: ${new Date().toLocaleString()}`,
                alignment: 'right'
              },
              {
                text: `Certificat n° : ${((Math.random() * 1000).toFixed(0))}`,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Certificat de destruction de données',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 50, 0, 20]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Type', 'Marque', 'Modèle', 'N° Serie', 'N° Interne', 'date'],
              ...this.certificatmateriels.map(p => [ p.type, p.marque, p.modele, p.nSerieFab, p.nInterne, p.closeAt ])
            ]
          }
        }
      ]
    };
    pdfMake.createPdf(documentDefinition).open();
  }
}
