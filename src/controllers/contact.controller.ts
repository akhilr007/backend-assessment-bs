import { Request, Response } from "express";

import { contactRepository } from "../repositories/contact.repository";
import ContactService from "../services/contact.service";

const contactService = new ContactService(contactRepository);

// eslint-disable-next-line space-before-function-paren
export const identify = async (req: Request, res: Response) => {
    const { email, phoneNumber } = req.body;
    try {
        const result = await contactService.identify(email, phoneNumber);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error);
    }
};
