import { Document, Schema, model } from 'mongoose';
import validator from 'validator';
import { Furniture, FurnitureSchema, FurnituresDocumentInterface } from './furnitures.js';
import { CustomerDocumentInterface } from './customer.js';
import { ProviderDocumentInterface } from './provider.js';

/**
 * @brief enum para describir el tipo de una transacción
 */
enum TypeTransaction {
  Provider = "Provider",
  Customer = "Customer"
}


/**
 * @brief interfaz para representar un mueble
 */
interface TransactionsDocumentInterface extends Document {
  entity: CustomerDocumentInterface | ProviderDocumentInterface,  // entidad de la operacion(cliente o proveedor)
  type: TypeTransaction,  // almacena si la transacción es a un proveedor o a un cliente
  furnitures: FurnituresDocumentInterface[],  // array de muebles
  date?: Date,  // fecha y hora
  cost: number  // cost total de la transacción
}

/**
 * @brief esquema de mongodb para representar un mueble
 */
const TransactionSchema = new Schema<TransactionsDocumentInterface>({
  entity: {
    type: Schema.Types.ObjectId,   
    required: true,
    ref: 'type' // tiene que ser o un proveedor o un cliente 
    
  }, 

  type: {
    type: String,
    required: true,
    enum: TypeTransaction
  },

  furnitures: {
    type: [FurnitureSchema],
    required: true
  },

  date: {
    type: Date,
    default: Date.now  // se autocalcula con la fecha de ahora
  },

  cost: {
    type: Number,
    default: function() {
      return this.furnitures.reduce((total, furniture) => total + furniture.price, 0) as number;  // Sumamos los precios de todos los muebles
    }
  }

})

export const Transaction = model<TransactionsDocumentInterface>('Transaction', TransactionSchema);



