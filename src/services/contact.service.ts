import { In, Repository } from "typeorm";

import Contact from "../models/contact.model";

class ContactService {
    constructor(private contactRepository: Repository<Contact>) {
        this.contactRepository = contactRepository;
    }

    async identify(email?: string, phoneNumber?: string): Promise<any> {
        if (!email && !phoneNumber) {
            throw new Error("Either email or phone number must be provided.");
        }

        // Find all directly related contacts
        const directlyRelatedContacts = await this.contactRepository.find({
            where: [{ email: email }, { phoneNumber: phoneNumber }]
        });
        // console.log("directly related contacts", directlyRelatedContacts);

        // Find all indirectly related contacts
        const allRelatedIds = new Set(directlyRelatedContacts.map((c) => c.id));
        for (const contact of directlyRelatedContacts) {
            if (contact.linkedId) {
                allRelatedIds.add(contact.linkedId);
            }
        }

        // console.log("all related ids", allRelatedIds);

        const allRelatedContacts = await this.contactRepository.find({
            where: [
                { id: In([...allRelatedIds]) },
                { linkedId: In([...allRelatedIds]) }
            ]
        });

        // console.log("all related contacts", allRelatedContacts);

        let primaryContact: Contact;
        const secondaryContacts: Contact[] = [];

        if (allRelatedContacts.length === 0) {
            // Create a new primary contact
            primaryContact = this.contactRepository.create({
                email: email || null,
                phoneNumber: phoneNumber || null,
                linkPrecedence: "primary"
            });
            // console.log("primary contact", primaryContact);

            await this.contactRepository.save(primaryContact);
        } else {
            // Find the oldest contact to make it primary
            primaryContact = allRelatedContacts.reduce((oldest, current) =>
                oldest.createdAt < current.createdAt ? oldest : current
            );

            // console.log("primary contact", primaryContact);

            // Update all other contacts to be secondary
            for (const contact of allRelatedContacts) {
                if (contact.id !== primaryContact.id) {
                    contact.linkedId = primaryContact.id;
                    contact.linkPrecedence = "secondary";
                    await this.contactRepository.save(contact);
                    secondaryContacts.push(contact);
                }
            }

            // console.log("secondary related contact", secondaryContacts);

            // Check if we need to create a new secondary contact
            const newEmail =
                email && !allRelatedContacts.some((c) => c.email === email);
            const newPhoneNumber =
                phoneNumber &&
                !allRelatedContacts.some((c) => c.phoneNumber === phoneNumber);

            // console.log(newEmail, newPhoneNumber);

            if (newEmail || newPhoneNumber) {
                const newSecondaryContact = this.contactRepository.create({
                    email: newEmail ? email : null,
                    phoneNumber: newPhoneNumber
                        ? phoneNumber
                        : primaryContact.phoneNumber,
                    linkedId: primaryContact.id,
                    linkPrecedence: "secondary"
                });

                // console.log(
                //     "new secondary contact created",
                //     newSecondaryContact
                // );

                await this.contactRepository.save(newSecondaryContact);
                secondaryContacts.push(newSecondaryContact);
            }
        }

        // Collect all unique emails and phone numbers
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
