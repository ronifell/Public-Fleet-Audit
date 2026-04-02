import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-filters-and-search',
  templateUrl: './filters-and-search.component.html',
  styleUrls: ['./filters-and-search.component.css']
})
export class FiltersAndSearchComponent {

  @Input() tabTitle: string = '';
  @Input() filterList: Filter[] = [];

  @Output() eventSearch = new EventEmitter();

  search(searchTerm: string) {
    if (searchTerm.length >= 3 || searchTerm.length == 0) {
      this.eventSearch.emit(searchTerm);
    }
  }


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