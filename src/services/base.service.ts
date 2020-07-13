import { Model } from "mongoose";
import { generate } from "randomstring";
import { MAX_LIMIT_PAGINATION } from "../constants";
import { hash } from "bcrypt";


export class BaseService {
    model: Model<any>;

    constructor(model: any) {
        this.model = model
    }

    findOne<T>(condition: any, projection?: any, options?: any): Promise<T> {
        return this.model.findOne(condition, projection, options).exec();
    }

    findOneAndupdate<T>(condition: any, update?: any, options?: any): Promise<T> {
        return this.model.findOneAndUpdate(condition, update, options).exec();
    }

    updateOne<T>(condition: any, update?: any, options?: any): Promise<T> {
        return this.model.update(condition, update, options).exec();
    }

    find<T>(condition: any, projection?: string) {
        return this.model.find(condition, projection).exec();
    }

    protected generateOTP(): string {
        return generate({ length: 6, charset: 'numeric' });
    }

    async hashPassword(data): Promise<string> {
        try {
            return await hash(data, 5);
        } catch (err) {
            throw err;
        }

    }



    // protected create(payload) {
    //     return this.model.create(payload);
    // }



    // //this function is used for the model data pagination with the help of aggregate
    // protected async paginate(model: Model<any>, keyForData: string, pipeline?: Array<Object>, limit?: number, page?: number) {
    //     try {
    //         if (limit > MAX_LIMIT_PAGINATION) {
    //             limit = MAX_LIMIT_PAGINATION;
    //         }
    //         let skip = (limit * (page - 1));
    //         const result = await model.aggregate(this.queryBuilder(pipeline, skip, limit, page)).exec();
    //         console.log(await model.aggregate(this.queryBuilder(pipeline, skip, limit, page)).exec().explain('executionStats'));
    //         let theTotal = result[0]['metadata'] && result[0]['metadata'][0] ? result[0]['metadata'][0]["total"] : 0;
    //         return {
    //             [keyForData]: result[0]['data'],
    //             total: theTotal,
    //             limit: limit
    //         };
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    protected async paginate(model: Model<any>, keyForData: string, pipeline: any[], limit?: number, page?: number) {
        try {
            if (limit > MAX_LIMIT_PAGINATION) {
                limit = MAX_LIMIT_PAGINATION;
            }
            let skip = (limit * (page - 1));
            console.log(JSON.stringify(this.queryBuilder2(pipeline, skip, limit, page)));
            let result = await model.aggregate(this.queryBuilder2(pipeline, skip, limit, page)).exec();

            result = result[0];
            const { countData } = result;
            const [totalCount] = countData;
            const total = totalCount && totalCount['total'] ? totalCount['total'] : 0;
            return {
                [keyForData]: result['data'],
                total,
                limit: limit
            };
        } catch (err) {
            throw err;
        }
    }

    //used to generate the query function
    private queryBuilder(pipeline: Array<Object>, skip: number, limit: number, page: number): Array<Object> {
        let q = pipeline || [];
        q.push({
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                metadata: [{ $count: "total" }, { $addFields: { page: page } }]
            }
        });


        return q;
    }

    // Private optimized query

    private queryBuilder2(pipeline: Array<Object>, skip: number, limit: number, page: number) {
        const matchQuery = this.getMatchQuery(pipeline) || [];
        return [
            {
                $facet: {
                    'data': [
                        ...pipeline,
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    'countData': [
                        ...matchQuery,
                        { $count: "total" }
                    ]
                }
            }
        ];
    }

    private getMatchQuery(query: any[]): any[] {
        const index = query.findIndex((pipeline) => pipeline['$match'] ? true : false);
        if (index !== -1) {
            return [query[index]];
        } else {
            return null;
        }
    }

}


export interface paginateResult {
    data: Array<Object>;
    total: number;
    page: number;
    limit: number;
}