import createHttpError from 'http-errors';
import {
  getAllContacts,
  getContactsById,
  createContact,
  deleteContact,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export async function getContactsController(req, res) {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);

  const filter = parseFilterParams(req.query);
  const userId = req.user.id;
  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
}

export async function getContactController(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const contact = await getContactsById(id, userId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  // Additional verification option
  // if (contact.userId.toString() !== req.user.id.toString()) {
  //   throw new createHttpError.Forbidden('No access to this contact');
  // }
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
}

export async function createContactController(req, res) {
  const photo = req.file;

  let photoUrl = null;
  if (getEnvVar('UPLOAD_TO_CLOUDINARY') === 'true') {
    photoUrl = await saveFileToCloudinary(photo);
  } else {
    photoUrl = await saveFileToUploadDir(photo);
  }

  const result = await createContact({
    ...req.body,
    userId: req.user.id,
    photo: photoUrl,
  });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: result,
  });
}

export async function deleteContactController(req, res, next) {
  const result = await deleteContact(req.params.id, req.user.id);
  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }
  res.status(204).send();
}

export async function updateContactController(req, res, next) {
  const photo = req.file;

  let photoUrl = undefined;

  if (getEnvVar('UPLOAD_TO_CLOUDINARY') === 'true') {
    photoUrl = await saveFileToCloudinary(photo);
  } else {
    photoUrl = await saveFileToUploadDir(photo);
  }

  const updateData = {
    ...req.body,
  };
  if (photoUrl) {
    updateData.photo = photoUrl;
  }
  const result = await updateContact(req.params.id, updateData, req.user.id);
  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result,
  });
}
