/*
 * EPCIS MESSAGING HUB - MASTERDATA BFF

 */

import {jest} from '@jest/globals'

/**
 * Used in testing mock api calls
 */
module.exports = {
    mockRequest: () => {
        const req: any = {}
        req.headers = jest.fn().mockReturnValue(req);
        req.params = jest.fn().mockReturnValue(req);
        req.query = jest.fn().mockReturnValue(req);
        req.body = jest.fn().mockReturnValue(req);
        return req
    },

    mockResponse: () => {
        const res: any = {}
        res.send = jest.fn().mockReturnValue(res)
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
        return res
    }
}