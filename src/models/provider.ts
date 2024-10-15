import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * @brief interfaz para representar un proveedor
 */
export interface ProviderDocumentInterface extends Document {
  cif : string,
  name: string,
  phone: string,
  address: string
}

/**
 * @brief esquema de mongodb para representar un proveedor
 */
const ProviderSchema = new Schema<ProviderDocumentInterface>({
  cif: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => {
      const cifRegex = /^[A-HJNPQRSUVW]{1}[0-9]{7}[0-9A-J]$/;

      if (!cifRegex.test(value)) {
        throw new Error('CIF not valid.');
      }
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isAlpha(value)) {
        throw new Error('Name should contain only characters')
      }
    }
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isMobilePhone(value)) {
        throw new Error('Phone should be a valid one')
      }
    }
  },

  address: {
    type: String,
    required: true,
    trim: true
  }
})


export const Provider = model<ProviderDocumentInterface>('Provider', ProviderSchema)