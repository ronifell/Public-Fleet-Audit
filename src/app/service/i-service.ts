import { Observable } from 'rxjs';

export interface IService<T> {
    get (termoBusca?: string): Observable<T[]>;
}