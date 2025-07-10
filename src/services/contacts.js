import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};
export const getContactsById = async (contactId) => {
  const contacts = await ContactsCollection.findById(contactId);
  return contacts;
};
export const createContact = async (payload) => {
  return await ContactsCollection.create(payload);
};

export const deleteContact = async (contactId) => {
  return await ContactsCollection.findByIdAndDelete(contactId);
};

export const updateContact = async (contactId, payload) => {
  return await ContactsCollection.findByIdAndUpdate(contactId, payload, {
    new: true,
  });
};
