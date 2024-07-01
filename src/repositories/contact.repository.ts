import { Repository } from "typeorm";

import { AppDataSource } from "../config/database.config";
import Contact from "../models/contact.model";

export const contactRepository: Repository<Contact> =
    AppDataSource.getRepository(Contact);
