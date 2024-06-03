import { NextFunction, RequestHandler, Request, Response } from "express";

export const loggerServer: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
    console.log(`${request.method} - ${request.url} - ${response.statusCode} - ${new Date().toISOString()}`);
    next();
}