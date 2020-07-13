import { JOI_NUMBER, DEFALT_LIMIT_PAGINATION, MAX_LIMIT_PAGINATION, JOI_NAME } from "../constants";
import { ApiModelProperty, SwaggerDefinitionConstant, ApiModel } from "swagger-express-ts";
import { sortType } from "../utils/database.util";
import { IApiOperationArgsBaseParameters, IApiOperationArgsBaseParameter } from "swagger-express-ts/i-api-operation-args.base";


@ApiModel({
    description: "Pagination",
    name: "ReqPagination"
})
export class ReqPagination {
    @ApiModelProperty({
        description: "Page number",
        type: SwaggerDefinitionConstant.NUMBER,
        example: 1 as any
    })
    page: number;

    @ApiModelProperty({
        description: "Page Limit",
        type: SwaggerDefinitionConstant.NUMBER,
        example: 10 as any
    })
    limit: number;
}

@ApiModel({
    description: "Pagination with search",
    name: "ReqPaginationSearch"
})
export class ReqPaginationSearch extends ReqPagination {
    @ApiModelProperty({
        description: "Search",
        type: SwaggerDefinitionConstant.STRING,
        example: 'search anything' as any
    })
    search: string;
}

@ApiModel({
    description: "Pagination with search and sorting",
    name: "ReqPaginationSearchSorting"
})
export class ReqPaginationSearchSorting extends ReqPaginationSearch {
    @ApiModelProperty({
        description: "Name of field to be sorted",
        type: SwaggerDefinitionConstant.STRING,
        example: 'search anything' as any
    })
    sortKey: string;

    @ApiModelProperty({
        description: "Order of sort asc or desc",
        type: SwaggerDefinitionConstant.STRING,
        example: 'asc' as any
    })
    sortType: sortType;
}

export const paginationDoc = {
    page: {
        description: 'page number that needs to be fetched'
    },
    limit: {
        description: 'limit for the results fetched'
    }
}

export const paginationSearchDoc: { [key: string]: IApiOperationArgsBaseParameter } = {
    ...paginationDoc,
    search: {
        description: 'search the data with pagintion'
    }
}

export const paginationSearchSortingDoc: { [key: string]: IApiOperationArgsBaseParameter } = {
    ...paginationSearchDoc,
    sortKey: {
        description: 'key name on which sorting needs to be applied',
    },
    sortType: {
        description: 'sorting type asc or desc',
    }
}
export const pagination = {
    page: JOI_NUMBER.optional().default(1).positive(),
    limit: JOI_NUMBER.optional().default(DEFALT_LIMIT_PAGINATION).positive().max(MAX_LIMIT_PAGINATION)
}

export const searchPagination = {
    ...pagination,
    search: JOI_NAME
}

export const sortSchema = {
    sortKey: JOI_NAME.optional().default(''),
    sortType: JOI_NAME.optional().valid('asc', 'desc')
}