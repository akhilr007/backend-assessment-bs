import { Request, Response } from "express";

export const identity = (_req: Request, res: Response) => {
    return res.status(200).json({
        message: "Ping Check ok"
    });
};
