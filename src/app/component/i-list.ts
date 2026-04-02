export interface Ilist<T> {
    registros: T[];

    get(termoBusca?: string): void;
}