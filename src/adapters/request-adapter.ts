import { Request } from 'express';

export default class RequestAdatper {
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

        console.log('%%%%%', req.get('range'));

        return mongoFilter;
    }

    public static generateSkipLimit(req: Request): { skip: any, limit: any } {
        const range = req.get('range');
        if (range) {
            const splitItems = range.split('items=');
            if (splitItems[1]) {
                const splitNums: number[] = splitItems[1]
                    .split('-')
                    .map((numStr) => parseInt(numStr));

                if (splitNums.length > 1) {
                    const limit = splitNums[1] - splitNums[0];
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
