import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.css']
})
export class SignaturePadComponent implements AfterViewInit {
  constructor(
    private renderer: Renderer2, 
  ) {}

  signatureNeeded!: boolean;
  signaturePad!: SignaturePad;
  @ViewChild('canvas') canvasEl!: ElementRef;
  @Output() signatureFilled = new EventEmitter();
  @Input() textoAssinatura = '';
  @Input() imageText: string = "";
  @Input() imageName: string = "";
  signatureImg!: string;

  // @HostListener('window:resize', ['$event']) 
  // onResize() { 
  //   this.resizeWorks();
  // }

  // resizeWorks() {
  //   this.clearPad();
  //   let teste = this.canvasEl.nativeElement.parentNode
  //   let r = teste.getBoundingClientRect().right.toString()
  //   let x = teste.getBoundingClientRect().x.toString()
  //   this.renderer.setAttribute(this.canvasEl.nativeElement, 'width', (r - x).toString());
  // }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    this.signaturePad.fromDataURL("data:image/png;base64," + this.imageText);

    // let teste = this.canvasEl.nativeElement.parentElement
    
    // let r = teste.getBoundingClientRect().right.toString()
    // let x = teste.getBoundingClientRect().x.toString()
    // this.renderer.setAttribute(this.canvasEl.nativeElement, 'width', (r - x).toString());
  }

  savePad() {
    this.signatureNeeded = this.signaturePad.isEmpty();
    const base64Data = this.signaturePad.toDataURL().replace(/^data:image\/\w+;base64,/, '');
    if(!this.signatureNeeded){
      // this.signatureFilled.emit(this.base64ToBlob(base64Data, "image/png"));
      this.signatureFilled.emit(base64Data);
    }
  }
  clearPad() {
    this.signaturePad.clear();
  }

  base64ToBlob(base64String: string, mimeType: string): Blob | void {
    const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64WithoutPrefix);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

}
