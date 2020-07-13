


export function getSortQuery(sortParams: SortParams | SortParams[]) {
    let sortObjArr = {};
    if (sortParams && Array.isArray(sortParams) && sortParams.length) {
        for (const param of sortParams) {
            sortObjArr[param.sortKey] = getSortType(param.sortType)
        }
    }
    if (!Array.isArray(sortParams)) {
        sortObjArr[sortParams.sortKey] = getSortType(sortParams.sortType)
    }

    return { $sort: sortObjArr };
}

export function getSortType(type: sortType) {
    if (type == 'desc') {
        return -1;
    } else {
        return 1;
    }
}


export interface SortParams {
    sortKey: string;
    sortType: sortType
}


export type sortType = 'asc' | 'desc';