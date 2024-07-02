import { NextFunction, Request, Response } from "express";

export const validateContactInput = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res
            .status(400)
            .json({ error: "Either email or phone number must be provided." });
    }
    next();
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(500).json({ error: "An unexpected error occurred" });
};
