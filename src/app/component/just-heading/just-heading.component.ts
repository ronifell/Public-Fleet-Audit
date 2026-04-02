import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-just-heading',
  templateUrl: './just-heading.component.html',
  styleUrls: ['./just-heading.component.css']
})
export class JustHeadingComponent {

  @Input() tabTitle: string = '';
  @Input() filterList: Filter[] = [];
  


  visible: boolean = false;

  clickMe(): void {
    this.visible = false;
  }

}

export class Filter {
  name: string;
  // Adicione outras propriedades do filtro aqui, se necessário

  constructor(name: string) {
    this.name = name;
  }
}

