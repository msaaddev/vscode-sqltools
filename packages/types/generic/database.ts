import { MConnectionExplorer, ContextValue } from './connection';

export namespace NSDatabase {
  export interface IDatabase extends MConnectionExplorer.IChildItem {
    type: ContextValue.DATABASE;
  }

  export interface ISchema extends MConnectionExplorer.IChildItem {
    type: ContextValue.SCHEMA;
    iconId: 'group-by-ref-type';
  }

  export interface ITable extends MConnectionExplorer.IChildItem {
    type: ContextValue.TABLE;

    isView: boolean;
  }
  export interface IColumn extends MConnectionExplorer.IChildItem {
    type: ContextValue.COLUMN;
    size?: number;
    defaultValue?: string;
    dataType: string;
    isNullable: boolean;
    isPartitionKey?: boolean;
    isPk?: boolean;
    isFk?: boolean;
    columnKey?: string;
    extra?: string;
    table: ITable;
  }

  export interface IFunction extends MConnectionExplorer.IChildItem {
    name: string;
    schema: string;
    database: string;
    signature: string;
    args: string[];
    resultType: string;
    /**
     * This is used to build the connections explorer tree
     *
     * @type {string}
     * @memberof IColumn
     */
    tree?: string;
    source?: string;
  }

  export interface IProcedure extends IFunction {}

  export interface IStaticCompletion {
    label: string;
    filterText?: string;
    sortText?: string;
    detail: string;
    documentation: { kind: 'markdown', value: string};
  };

  export interface IResult<T extends { [key: string]: any } = any> {
    label?: string;
    connId: string;
    error?: boolean;
    rawError?: Error;
    results: (T extends { [key: string]: any } ? T : any)[];
    cols: string[];
    query: string;
    messages: string[];
    page?: number;
    total?: number;
    pageSize?: number;
    queryType?: string; // showRecords, describeTable
    queryParams?: { [k: string]: any };
  }
  export type SearchableItem = IDatabase | ISchema | ITable | IColumn | IFunction | IProcedure | MConnectionExplorer.IChildItem;
}