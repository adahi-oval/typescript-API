import express from 'express';
import { Furniture, FurnituresDocumentInterface } from '../models/furnitures.js';
import { Transaction } from '../models/transaction.js';
import { Provider } from '../models/provider.js';
import { Customer } from '../models/customer.js';


export const transactionRouter = express.Router();

/**
 * @brief interfaz del body que se debe proporcionar en post para un customer
 */
interface CustomerFurnitureOrder {
  nif: string,
  furnitureList: [{
    name: string,
    quantity: number
  }]
}

/**
 * @brief interfaz del body que se debe proporcionar en post para un provider
 */
interface ProviderFurnitureOrder {
  cif: string,
  furnitureList: [{
    furniture: FurnituresDocumentInterface,
    quantity: number    
  }]
}

/**
 * @brief Busca en la base de datos para ver si existe o hay la cantidad de ese mueble
 * @param furnitures 
 * @returns 
 */
async function checkFurnitures(furnitures : [{ name: string; quantity: number; }]) : Promise<boolean> {
  for (let i = 0; i < furnitures.length; ++i) {
    const furniture = await Furniture.countDocuments({name: furnitures[i].name})
    if (furniture < furnitures[i].quantity) { // Si no existe o no hay de esa cantidad
      return false
    }
  }

  return true
}


/**
 * @brief Elimina la cantidad de muebles deseada
 * @param furnitures  
 * @returns 
 */
async function deleteFurnitures(furnitures: [{name: string; quantity: number}]) : Promise<FurnituresDocumentInterface[]> {
  const deletedFurnitures : FurnituresDocumentInterface[] = []
  for (let i = 0; i < furnitures.length; ++i) {
    const furnituresToDelete = await Furniture.find({name: furnitures[i].name}).limit(furnitures[i].quantity) // Busca por el nombre y una cantidad máxima
    deletedFurnitures.push(...furnituresToDelete) // Guarda los muebles que se van a borrar
    await Furniture.deleteMany({_id: {$in: furnituresToDelete.map(f => f._id)}}) // Borrar por los ids de los furnitures del array obtenido
  }

  return deletedFurnitures
}

/**
 * @brief Añade la cantidad de muebles deseada
 */
async function addFurnitures(furnitures: [{furniture: FurnituresDocumentInterface; quantity: number}]) : Promise<FurnituresDocumentInterface[]> {
  const addedFurnitures : FurnituresDocumentInterface[] = [];
  for (let i = 0; i < furnitures.length; ++i) {  
    for (let j = 0; j < furnitures[i].quantity; ++j) {
      const newFurniture = new Furniture(furnitures[i].furniture);
      await newFurniture.save();
      addedFurnitures.push(newFurniture) // Guarda los muebles que se van a añadir
    }
  }

  return addedFurnitures;
}


/**
 * @brief AÑADIR transacción
 */
transactionRouter.post('/transactions', async (req, res) => {
  try {

    if (!req.body.cif && !req.body.nif) { // Si no se ha introducido el NIF ni CIF
      return res.status(400).send({
        error: 'A NIF or CIF must be provided'
      })
    }

    const customer = await Customer.findOne({nif: req.body.nif})
    const provider = await Provider.findOne({cif: req.body.cif})

    if (customer) {
      // Comprobar que los furnitures existen y hay la cantidad adecuada
      const furnitureOrder : CustomerFurnitureOrder = req.body
      const exist = await checkFurnitures(furnitureOrder.furnitureList)

      if (!exist) {
        return res.status(404).send({
          error: 'Incorrect numbers of furniture(the furniture may not exist)'
        })
      }

      const furnituresDeleted = await deleteFurnitures(furnitureOrder.furnitureList)

      const transaction = new Transaction({
        entity: customer._id,
        type: "Customer",
        furnitures: furnituresDeleted
      })
    
      await transaction.save()

      return res.status(200).send({
        message: "Transaction added",
        transaction: transaction
      })

    } else if (provider) {
      
      const furnitureOrder : ProviderFurnitureOrder = req.body
      const furnituresAdded = await addFurnitures(furnitureOrder.furnitureList)

      const transaction = new Transaction({
        entity: provider._id,
        type: "Provider",
        furnitures: furnituresAdded
      })

      await transaction.save()

      return res.status(200).send({
        message: "Transaction added",
        transaction: transaction
      })
    
    } else { // El cliente o el proveedor no existe
      return res.status(404).send({
        error: 'Customer/Provider was not found'
      })
    }

  } catch (error) {
    return res.status(500).send(error)
  }
})



/**
 * @brief LECTURA: por NIF/CIF del cliente/proveedor y por fecha
 */
transactionRouter.get('/transactions', async (req, res, next) => {
    try {
      const customer = await Customer.findOne({nif: req.query.nif})
      const provider = await Provider.findOne({cif: req.query.cif})
  
      if (customer) { // Comprobar por cliente
        const transaction = await Transaction.find({entity: customer._id})
        if (!transaction || transaction.length == 0) {
          return res.status(404).send({
            error: 'NIF not found in a transaction'
          })
        }
  
        return res.status(200).send(transaction)
      
      } else if (provider) {  // Comprobar por proveedor
        const transaction = await Transaction.find({entity: provider._id})
        if (!transaction || transaction.length == 0) {
          return res.status(404).send({
            error: 'CIF not found in transaction'
          })
        }
  
        return res.status(200).send(transaction)
  
      } else if (req.query.startDate || req.query.endDate) {
        next() // Pasar al siguiente manejador

      } else {
        return res.status(400).send({
          error: 'Needs a parameter to search'
        })
      }
  
    } catch (error) {
      return res.status(500).send(error)
    }  
});


//LECTURA: por fecha 
transactionRouter.get('/transactions', async (req, res) => {
  try {
      // Comprobamos si se proporcionaron las fechas
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(400).send({
        error: "Needs both start date and end date"
      });
    }
  
    // Convertimos las cadenas de fecha en objetos Date
    const startDateString: string = req.query.startDate as string;
    const endDateString: string = req.query.endDate as string;
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
  
    // La búsqueda que se va a realizar
    const search : {date: {$gte: Date; $lte: Date}; type?: string}= {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }
  
    if (req.query.type) { // En caso de que se ponga el tipo a buscar
      search.type = req.query.type as string
    }

    const transaction = await Transaction.find(search)

    if (transaction.length == 0 || !transaction) {
        return res.status(404).send({
          error: "Transaction not found"
      })
    }
  
    return res.status(200).send(transaction)
  
  } catch (error) {
    return res.status(500).send(error)
  }
})


/**
 * @brief LECTURA: por identificador único
 */
transactionRouter.get('/transactions/:id', async (req, res) => {
  try {
    const transaction =  await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).send({
        error: "Transaction not found"
      })

    } else {
      return res.status(200).send(transaction)
    }
    
  } catch (error) {
    return res.status(500).send(error)
  }
})


/**
 * @brief MODIFICADO: por identificador único
 */
transactionRouter.patch('/transactions/:id', async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).send({
        error: 'Transaction not found'
      })
    }

    //const filter: TransactionFilter = req.body

    const allowedUpdates = ['cif', 'nif' ,'furnitureList']
    const actualUpdates = Object.keys(req.body)
    const isValidUpdate: boolean = actualUpdates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted'
      });
    } 

    const customer = await Customer.findOne({nif: req.body.nif})
    const provider = await Provider.findOne({cif: req.body.cif})
    
    if (!customer && !provider && (req.body.nif || req.body.cif)) {
      return res.status(404).send({
        error: 'Customer/Provider not found'
      })
    }

    // Comprobar que la transacción a modificar es el mismo tipo
    if ((customer && ('Customer' != transaction.type)) || (provider && ('Provider' != transaction.type))) {
      return res.status(400).send({
        error: 'Can not modify transaction. It is not the same type(Customer or Provider)'
      })
    }

    // En el caso de que solo se cambie el NIF o CIF
    if (!req.body.furnitureList) {
      let result
      if (customer) {
        result = await Transaction.findByIdAndUpdate(transaction._id, {entity: customer._id}, {new: true, runValidators: true})        
      
      } else if (provider) {
        result = await Transaction.findByIdAndUpdate(transaction._id, {entity: provider._id}, {new: true, runValidators: true})
      }

      return res.status(200).send(result)
    }
    
    // Comprobar que los furnitures a añadir existen
    const exist = await checkFurnitures(req.body.furnitureList)
    if (!exist) {
      return res.status(404).send({
        error: 'Incorrect numbers of furniture(the furniture may not exist)'
      })
    }
    
    
    let result 
    let furnituresTransactionAdded = [];
    // se venden más muebles a los clientes
    if (transaction.type == "Customer") {
      furnituresTransactionAdded =  await deleteFurnitures(req.body.furnitureList) 

      // se compran más muebles a los vendedores
    } else {
      for (let i = 0; i < req.body.furnitureList.length; i++) {
        const newFurniture = new Furniture(({
          name: req.body.furnitureList[i].name,
          desc: req.body.furnitureList[i].desc,
          color: req.body.furnitureList[i].color,
          price: req.body.furnitureList[i].price
        }));
        await newFurniture.save();

        furnituresTransactionAdded.push(newFurniture)
        
      }
    }

    // Hacer un push de los muebles a añadir y cambiar la entity si corresponde
    if (customer) {
      result = await Transaction.findByIdAndUpdate(transaction._id, {entity: customer._id, $push: {furnitures: furnituresTransactionAdded}}, {new: true, runValidators: true})
      

    } else if (provider) {
      result = await Transaction.findByIdAndUpdate(transaction._id, {entity: provider._id, $push: {furnitures: furnituresTransactionAdded}}, {new: true, runValidators: true})

    } else {
      result = await Transaction.findByIdAndUpdate(transaction._id, {$push: {furnitures: furnituresTransactionAdded}}, {new: true, runValidators: true})
    }
        
    return res.status(200).send(result)

  } catch (error) {
    return res.status(500).send(error)
  }
});



/**
 * @brief ELIMINAR: por identificador único
 */
transactionRouter.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).send({
        error: 'Transaction not found'
      })
    }

    // Se eliminar una venta a un cliente(devolución del cliente)
    if (transaction.type == "Customer") {
      // creamos todos los muebles obtenidos por la adquisición de los nuevos productos del cliente
      for (let i = 0; i < transaction.furnitures.length; i++) {
        const newFurniture = new Furniture(({
          name: transaction.furnitures[i].name,
          desc: transaction.furnitures[i].desc,
          color: transaction.furnitures[i].color,
          price: transaction.furnitures[i].price
        }));
        await newFurniture.save();
      }
      
      // eliminamos la transacción
      await Transaction.deleteOne({_id: transaction._id});

      // enviamos la transacción eliminada
      return res.status(200).send({
        message: "Transaction deleted",
        transaction: transaction
      })
      
    // Se eliminar una compra a un proveedor(devolución al proveedor)
    } else {
      const returnedFurnitures: number[] = []
      // Buscamos todos los muebles a eliminar del stock
      for (let i = 0; i < transaction.furnitures.length; i++) {
        const furnitureId = transaction.furnitures[i]._id;
        const furniture = await Furniture.findById(furnitureId);
        if (!furniture) {  // comprobamos que el mueble a devolver existe
          return res.status(404).send({
            error: 'Furniture to be returned not in stock'
          });
        } else {
          returnedFurnitures.push(furniture._id);
        }
      }

      // eliminamos los muebles
      for (let i = 0; i < returnedFurnitures.length; ++i) {
        await Furniture.deleteMany({_id: {$in: returnedFurnitures}})
      }

      // eliminamos la transacción
      await Transaction.findByIdAndDelete(transaction._id);

      // enviamos la transacción eliminada
      return res.status(200).send({
        message: "Transaction deleted",
        transaction: transaction
      })
    }

  } catch(error) {
    return res.status(500).send(error)
  }

})