import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
  userId,
}) => {
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactsQuery = ContactsCollection.find({ userId });

  // ContactsCollection.where('userId').equals(userId);

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }
  if (typeof filter.isFavourite === 'boolean') {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(perPage)
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};
export const getContactsById = async (contactId, userId) => {
  const contacts = await ContactsCollection.findOne({ _id: contactId, userId });
  return contacts;
};
export const createContact = async (payload) => {
  return await ContactsCollection.create(payload);
};

export const deleteContact = async (contactId, userId) => {
  const result = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return result;
};

export const updateContact = async (contactId, payload, userId) => {
  const result = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true },
  );
  return result;
};
