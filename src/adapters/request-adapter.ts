import { Request } from 'express';

export default class RequestAdatper {
    
    /**
     * @param  {Request} req
     * @returns any
     * @description Generates the filter for mongo queries
     */
    public static generateFilter(req: Request): any {
        const mongoFilter: any = {};

        if (req.query.match) {
            if (req.query.match.id) {
                mongoFilter._id = {
                    $in: req.query.match.id.split(',')
                };
            }

            if (req.query.match.type) {
                mongoFilter['stix.type'] = {
                    $in: req.query.match.type.split(',')
                };
            }

            // TODO figure out how to filter by version
            // if (req.query.match.version) {
            //     responseData = Helper.filterVersion(
            //         req.query.match.version,
            //         JSON.parse(JSON.stringify(data)),
            //     );
            // }
        }

        if (req.headers['x-taxii-date-added-first']) {
            const addedFirst = new Date(req.headers['x-taxii-date-added-first'] as string);
            if (!isNaN(addedFirst.getTime())) {
                mongoFilter['stix.created'] = {
                    $gte: addedFirst
                }
            }
        }

        if (req.headers['x-taxii-date-added-last']) {
            const addedLast = new Date(req.headers['x-taxii-date-added-last'] as string);
            if (!isNaN(addedLast.getTime())) {
                mongoFilter['stix.created'] = {
                    ...mongoFilter['stix.created'],
                    $lte: addedLast
                };
            }
        }

        return mongoFilter;
    }

    /**
     * @param  {Request} req
     * @returns {object}
     * @description Returns the `skip` and `limit` numbers for mongo from the request headers
     *      Usage: const { skip, limit } = generateSkipLimit(req);
     */
    public static generateSkipLimit(req: Request): { skip: any, limit: any } {
        const range = req.get('range');
        if (range) {
            const splitItems = range.split('items=');
            if (splitItems[1]) {
                const splitNums: number[] = splitItems[1]
                    .split('-')
                    .map((numStr) => parseInt(numStr));

                if (splitNums.length > 1) {
                    const limit = splitNums[1] - splitNums[0] + 1;
                    return {
                        skip: splitNums[0],
                        limit
                    };
                }
            }
        }
        return {
            skip: null,
            limit: null
        };
    }
}
