import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * @brief interfaz para representar un mueble
 */
export interface FurnituresDocumentInterface extends Document {
  name: string,
  desc: string,
  color: 'blue' | 'red' |'green' | 'black',
  price: number
}

/**
 * @brief esquema de mongodb para representar un mueble
 */
export const FurnitureSchema = new Schema<FurnituresDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if(!validator.isAlpha(value.replace(/\s/g, ''))) {
        throw new Error('Name is not valid.');
      }
    }
  }, 

  desc: {
    type: String,
    trim: true,
  },

  color: {
    type: String,
    required: true,
    enum: ['blue', 'green', 'red', 'black'],
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    trim: true,
    validate: (value: number) => {
      if(!(value >= 0)) {
        throw new Error('Price must be positive');
      }
    }
  }

})

export const Furniture = model<FurnituresDocumentInterface>('Furniture', FurnitureSchema);