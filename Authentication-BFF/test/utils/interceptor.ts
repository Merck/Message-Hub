/*
 * EPCIS MESSAGING HUB - AUTHENTICATION BFF

 */

import {jest} from '@jest/globals'

/**
 * Used in testing mock api calls
 */
module.exports = {
    mockRequest: () => {
        const req: any = {}
        const params : any = {}
        const headers: any = {}
        req.headers = headers;
        req.params = params;
        req.body = jest.fn().mockReturnValue(req);
        return req
    },

    mockResponse: () => {
        const res: any = {}
        res.send = jest.fn().mockReturnValue(res)
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
        return res
    },
    // mockNext: () => jest.fn()
}