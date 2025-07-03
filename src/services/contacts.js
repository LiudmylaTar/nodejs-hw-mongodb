import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};
export const getContactsById = async (contactId) => {
  const contacts = await ContactsCollection.findById(contactId);
  return contacts;
};
