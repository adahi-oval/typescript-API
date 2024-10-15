import { Document, Schema, model } from "mongoose"
import validator from 'validator'

/**
 * @brief interfaz para representar un cliente
 */
export interface CustomerDocumentInterface extends Document {
  nif : string,
  name: string,
  phone: string,
  address: string
}


/**
 * @brief esquema de mongodb para representar un cliente
 */
const CustomerSchema = new Schema<CustomerDocumentInterface>({

  nif: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => { // VER SI ESTO COMPRUEBA NIF
      if (!validator.isIdentityCard(value, 'ES')) {
        throw new Error('NIF should be a valid one(12345678A)')
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

export const Customer = model<CustomerDocumentInterface>('Customer', CustomerSchema)