
export type paginationData<T> =  {list: T[]; 
                        metadata: {count: number, hasNextPage: boolean,
                            cursor?:string
                        }}