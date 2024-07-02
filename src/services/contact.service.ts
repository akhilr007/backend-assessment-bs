import { In, Repository } from "typeorm";

import Contact from "../models/contact.model";

class ContactService {
    constructor(private contactRepository: Repository<Contact>) {}

    async identify(email?: string, phoneNumber?: string): Promise<any> {
        const allRelatedContacts = await this.findAllRelatedContacts(
            email,
            phoneNumber
        );

        if (allRelatedContacts.length === 0) {
            return this.createNewPrimaryContact(email, phoneNumber);
        }

        const { primaryContact, secondaryContacts } =
            await this.processRelatedContacts(allRelatedContacts);

        await this.createNewSecondaryContactIfNeeded(
            email,
            phoneNumber,
            allRelatedContacts,
            primaryContact,
            secondaryContacts
        );

        return this.formatResponse(primaryContact, secondaryContacts);
    }

    private async findAllRelatedContacts(
        email?: string,
        phoneNumber?: string
    ): Promise<Contact[]> {
        const directlyRelatedContacts = await this.contactRepository.find({
            where: [{ email: email }, { phoneNumber: phoneNumber }]
        });

        const allRelatedIds = this.getAllRelatedIds(directlyRelatedContacts);

        return this.contactRepository.find({
            where: [
                { id: In([...allRelatedIds]) },
                { linkedId: In([...allRelatedIds]) }
            ]
        });
    }

    private getAllRelatedIds(contacts: Contact[]): Set<number> {
        const allRelatedIds = new Set(contacts.map((c) => c.id));
        contacts.forEach((contact) => {
            if (contact.linkedId) {
                allRelatedIds.add(contact.linkedId);
            }
        });
        return allRelatedIds;
    }

    private async createNewPrimaryContact(
        email?: string,
        phoneNumber?: string
    ): Promise<any> {
        const primaryContact = this.contactRepository.create({
            email: email || null,
            phoneNumber: phoneNumber || null,
            linkPrecedence: "primary"
        });
        await this.contactRepository.save(primaryContact);
        return this.formatResponse(primaryContact, []);
    }

    private async processRelatedContacts(
        allRelatedContacts: Contact[]
    ): Promise<{ primaryContact: Contact; secondaryContacts: Contact[] }> {
        const primaryContact = allRelatedContacts.reduce((oldest, current) =>
            oldest.createdAt < current.createdAt ? oldest : current
        );

        const secondaryContacts: Contact[] = [];
        for (const contact of allRelatedContacts) {
            if (contact.id !== primaryContact.id) {
                contact.linkedId = primaryContact.id;
                contact.linkPrecedence = "secondary";
                await this.contactRepository.save(contact);
                secondaryContacts.push(contact);
            }
        }

        return { primaryContact, secondaryContacts };
    }

    private async createNewSecondaryContactIfNeeded(
        email: string | undefined,
        phoneNumber: string | undefined,
        allRelatedContacts: Contact[],
        primaryContact: Contact,
        secondaryContacts: Contact[]
    ): Promise<void> {
        const newEmail =
            email && !allRelatedContacts.some((c) => c.email === email);
        const newPhoneNumber =
            phoneNumber &&
            !allRelatedContacts.some((c) => c.phoneNumber === phoneNumber);

        if (newEmail || newPhoneNumber) {
            const newSecondaryContact = this.contactRepository.create({
                email: newEmail ? email : null,
                phoneNumber: newPhoneNumber
                    ? phoneNumber
                    : primaryContact.phoneNumber,
                linkedId: primaryContact.id,
                linkPrecedence: "secondary"
            });
            await this.contactRepository.save(newSecondaryContact);
            secondaryContacts.push(newSecondaryContact);
        }
    }

    private formatResponse(
        primaryContact: Contact,
        secondaryContacts: Contact[]
    ): any {
        const emails = new Set(
            [
                primaryContact.email,
                ...secondaryContacts.map((c) => c.email)
            ].filter(Boolean)
        );
        const phoneNumbers = new Set(
            [
                primaryContact.phoneNumber,
                ...secondaryContacts.map((c) => c.phoneNumber)
            ].filter(Boolean)
        );

        return {
            contact: {
                primaryContactId: primaryContact.id,
                emails: Array.from(emails),
                phoneNumbers: Array.from(phoneNumbers),
                secondaryContactIds: secondaryContacts.map((c) => c.id)
            }
        };
    }
}

export default ContactService;
