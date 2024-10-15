import mocha from 'mocha'
import { expect } from 'chai'
import request from 'supertest';
import { app } from '../src/main.js';
import { Transaction } from '../src/models/transaction.js';
import { Provider } from '../src/models/provider.js';
import { Customer } from '../src/models/customer.js';
import { Furniture } from '../src/models/furnitures.js';


// "_id": "6640f42c9f58eb6a4bff07a0",
// "entity": "6640b7c7c786baccb4ceed02",
// "type": "Provider",
// "furnitures": [
//   {
//     "name": "Mesa Roja",
//     "desc": "Una mesa roja",
//     "color": "red",
//     "price": 5,
//     "_id": "6640f42c9f58eb6a4bff079c",
//     "__v": 0
//   },
//   {
//     "name": "Mesa Roja",
//     "desc": "Una mesa roja",
//     "color": "red",
//     "price": 5,
//     "_id": "6640f42c9f58eb6a4bff079e",
//     "__v": 0
//   }
// ],
// "date": "2024-05-12T16:54:04.313Z",
// "cost": 10,
// "__v": 0

const firstCustomer = {
  nif : "95128784W",
  name: "Ramon",
  phone: "123456789",
  address: "Calle Paraiso, barrio obrero"
}

const secondCustomer = {
  nif : '60747252C',
  name: 'Raul',
  phone: '123456789',
  address: 'Calle barran, barrera'
}


const initialProvider1 = {
  cif: "A12345678",
  name: "Pepito",
  phone: "922123456",
  address: "Avenida Trinidad, paraninfo"
}

const initialProvider2 = {
  cif: "B23456789",
  name: "Juanito",
  phone: "922654321",
  address: "Calle Carrera, concepcion"
}

const initialProvider3 = {
  cif: "F0000000E",
  name: "Zimbe",
  phone: "922654321",
  address: "Calle Carrera, concebido"
}

const initialFurniture1 = {
  name: "Escritorio moderno",
  desc: "Un escritorio pa trabajar",
  price: 250,
  color: "black"
}

const initialFurniture2 = {
  name: "Sillon cheslon",
  desc: "Un sillon pal salon",
  price: 25,
  color: "green"
}

const initialFurniture3 = {
  name: "Ventana rota",
  desc: "Ventana reventada",
  price: 5,
  color: "blue"
}

const transactionCustomer1 = {
  entity : 0,
  type: "Customer",
  furnitures: [
    initialFurniture1
  ]
}

const transactionCustomer2 = {
  entity: 0,
  type: "Customer",
  furnitures: [
    initialFurniture1,
    initialFurniture2
  ]
}

const transactionProvider1 = {
  entity: 0,
  type: "Provider",
  furnitures: [
    initialFurniture1,
    initialFurniture1
  ]
}

const transactionProvider2 = {
  entity: 0,
  type: "Provider",
  furnitures: [
    initialFurniture1,
    initialFurniture2
  ]
}

const transactionProvider3 = {
  entity: 0,
  type: "Provider",
  furnitures: [
    initialFurniture3,
    initialFurniture3
  ]
}


// MÉTODOS HOOK
beforeEach(async () => {
  await Transaction.deleteMany()
  
  const customer1 = await Customer.findOne({nif: "95128784W"})
  const customer2 = await Customer.findOne({nif: "60747252C"})

  const provider1 = await Provider.findOne({cif: "A12345678"})
  const provider2 = await Provider.findOne({cif: "B23456789"})
  

  // console.log('CUSTOMER1 ID: ', customer1?._id)
  // console.log('CUSTOMER2 ID: ', customer2?._id)
  transactionCustomer1.entity = customer1?._id
  transactionCustomer2.entity = customer2?._id

  transactionProvider1.entity = provider1?._id
  transactionProvider2.entity = provider2?._id
  

  await new Transaction(transactionCustomer1).save()
  await new Transaction(transactionCustomer2).save()

  await new Transaction(transactionProvider1).save()
  await new Transaction(transactionProvider2).save()
  

})

afterEach(async () => {
  await Customer.deleteMany()
  await Provider.deleteMany()
  await Furniture.deleteMany();
  await Transaction.deleteMany()
})

describe('GET /transactions', () => {
  it('Should provide correctly the transaction with NIF', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    const response = await request(app).get('/transactions').query({nif: "95128784W"}).expect(200)

    expect(response.body[0].entity).to.be.equal(customer?._id.toString())
    expect(response.body[0].type).to.be.equal('Customer')
    expect(response.body[0].furnitures[0].name).to.be.equal(transactionCustomer1.furnitures[0].name)
    expect(response.body[0].furnitures[0].desc).to.be.equal(transactionCustomer1.furnitures[0].desc)
    expect(response.body[0].furnitures[0].color).to.be.equal(transactionCustomer1.furnitures[0].color)
    expect(response.body[0].furnitures[0].price).to.be.equal(transactionCustomer1.furnitures[0].price)
    expect(response.body[0].cost).to.be.equal(250)
  })

  it('Should provide correctly the transaction with CIF', async() => {
    const provider = await Provider.findOne({cif: "A12345678"})
    const response = await request(app).get('/transactions').query({cif: "A12345678"}).expect(200)
    
    expect(response.body[0].entity).to.be.equal(provider?._id.toString())
    expect(response.body[0].type).to.be.equal('Provider')
    expect(response.body[0].furnitures[0].name).to.be.equal(transactionCustomer1.furnitures[0].name)
    expect(response.body[0].furnitures[0].desc).to.be.equal(transactionCustomer1.furnitures[0].desc)
    expect(response.body[0].furnitures[0].color).to.be.equal(transactionCustomer1.furnitures[0].color)
    expect(response.body[0].furnitures[0].price).to.be.equal(transactionCustomer1.furnitures[0].price)
    expect(response.body[0].cost).to.be.equal(500)
  })

  it('Should provide correctly the transation with dynamic ID', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    const transaction = await Transaction.findOne({entity: customer?._id})
    const response = await request(app).get(`/transactions/${transaction?._id}`).expect(200)

    expect(response.body.entity).to.be.equal(customer?._id.toString())
    expect(response.body.type).to.be.equal('Customer')
    expect(response.body.furnitures[0].name).to.be.equal(transactionCustomer1.furnitures[0].name)
    expect(response.body.furnitures[0].desc).to.be.equal(transactionCustomer1.furnitures[0].desc)
    expect(response.body.furnitures[0].color).to.be.equal(transactionCustomer1.furnitures[0].color)
    expect(response.body.furnitures[0].price).to.be.equal(transactionCustomer1.furnitures[0].price)
    expect(response.body.cost).to.be.equal(250)
  })

  it('Should provide correctly the transaction with startDate and endDate', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    const response = await request(app).get('/transactions').query({startDate: "2020-05-12", endDate: "2025-05-12"}).expect(200)

    expect(response.body[0].entity).to.be.equal(customer?._id.toString())
    expect(response.body[0].type).to.be.equal('Customer')
    expect(response.body[0].furnitures[0].name).to.be.equal(transactionCustomer1.furnitures[0].name)
    expect(response.body[0].furnitures[0].desc).to.be.equal(transactionCustomer1.furnitures[0].desc)
    expect(response.body[0].furnitures[0].color).to.be.equal(transactionCustomer1.furnitures[0].color)
    expect(response.body[0].furnitures[0].price).to.be.equal(transactionCustomer1.furnitures[0].price)
    expect(response.body[0].cost).to.be.equal(250)
  })

  it('Should provide correctly the transaction with startDate, endDate and type', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    const response = await request(app).get('/transactions').query({startDate: "2020-05-12", endDate: "2025-05-12", type: "Customer"}).expect(200)

    expect(response.body[0].entity).to.be.equal(customer?._id.toString())
    expect(response.body[0].type).to.be.equal('Customer')
    expect(response.body[0].furnitures[0].name).to.be.equal(transactionCustomer1.furnitures[0].name)
    expect(response.body[0].furnitures[0].desc).to.be.equal(transactionCustomer1.furnitures[0].desc)
    expect(response.body[0].furnitures[0].color).to.be.equal(transactionCustomer1.furnitures[0].color)
    expect(response.body[0].furnitures[0].price).to.be.equal(transactionCustomer1.furnitures[0].price)
    expect(response.body[0].cost).to.be.equal(250)
  })

  it('Should be an error, NIF not found in a transaction', async() => {
    const response = await request(app).get('/transactions').query({nif: "Z3634494Q"}).expect(404)
    expect(response.body.error).to.be.equal('NIF not found in a transaction')
  })

  it('Should be an error, CIF not found in a transaction', async() => {
    const response = await request(app).get('/transactions').query({cif: "P9154175E"}).expect(404)
    expect(response.body.error).to.be.equal('CIF not found in transaction')
  })

  it('Should be an error, transaction not found', async() => {
    const response = await request(app).get('/transactions').query({startDate: "2025-05-12", endDate: "2026-05-12", type: "Provider"}).expect(404)
    expect(response.body.error).to.be.equal('Transaction not found')
  })

  it('Should be an error, transaction not found in dynamic ID', async() => {
    const response = await request(app).get('/transactions/6640f464226216330cfa026b').expect(404)
    expect(response.body.error).to.be.equal('Transaction not found')
  })

  it('Should be an error, needs a parameter to search', async() => {
    const response = await request(app).get('/transactions').expect(400)
    expect(response.body.error).to.be.equal('Needs a parameter to search')
  })

  it('Should input both dates', async() => {
    const response = await request(app).get('/transactions').query({startDate: "2025-05-12"}).expect(400)
    expect(response.body.error).to.be.equal('Needs both start date and end date')
  })

})


// En el post de customer EJEMPLO:
// {
//   "nif": "X0943540B",
//   "furnitureList": [
//     {
//       "name": "Mesa Roja",
//       "quantity": 1
//     }
//     ]
// }

// En el post de provider EJEMPLO:
// {
//   "cif": "J48937924",
//   "furnitureList": [
//     {
//       "furniture": {
//         "name": "Mesa Roja",
//         "desc": "Una mesa roja",
//         "color": "red",
//         "price": 5
//       },
//       "quantity": 2
//     }
//     ]
// }

describe('POST /transactions', () => {
  it('Should create a transaction with customer', async() => {

    const response = await request(app).post('/transactions').send({
      nif: "95128784W",
      furnitureList: [
        {
          name: "Sillon cheslon",
          quantity: 1
        }
      ]
    }).expect(200)

    const customer = await Customer.findOne({nif: "95128784W"})
    const transaction = await Transaction.find({entity: customer?._id})

    expect(response.body.message).to.be.equal('Transaction added')
    expect(response.body.transaction.furnitures[0].name).to.be.equal(transaction[1].furnitures[0].name)
    expect(response.body.transaction.furnitures[0].desc).to.be.equal(transaction[1].furnitures[0].desc)
    expect(response.body.transaction.furnitures[0].color).to.be.equal(transaction[1].furnitures[0].color)
    expect(response.body.transaction.furnitures[0].price).to.be.equal(transaction[1].furnitures[0].price)
    expect(response.body.transaction.cost).to.be.equal(25)
  })

  it('Should create a transaction with provider', async() => {
    const response = await request(app).post('/transactions').send({
      cif: "A12345678",
      furnitureList: [
        {
          furniture: {
            name: "Escritorio moderno",
            desc: "Un escritorio pa trabajar",
            price: 250,
            color: "black"
          },
          quantity: 1
        }
      ]
    }).expect(200)

    const provider = await Provider.findOne({cif: "A12345678"})
    const transaction = await Transaction.find({entity: provider?._id})
    
    expect(response.body.message).to.be.equal('Transaction added')
    expect(response.body.transaction.furnitures[0].name).to.be.equal(transaction[1].furnitures[0].name)
    expect(response.body.transaction.furnitures[0].desc).to.be.equal(transaction[1].furnitures[0].desc)
    expect(response.body.transaction.furnitures[0].color).to.be.equal(transaction[1].furnitures[0].color)
    expect(response.body.transaction.furnitures[0].price).to.be.equal(transaction[1].furnitures[0].price)
    expect(response.body.transaction.cost).to.be.equal(250)
  })


  it('Should be an error, a NIF or CIF must be provided', async() => {
    const response = await request(app).post('/transactions').send({
      furnitureList: [
        {
          name: "Sillon cheslon",
          quantity: 1
        }
      ]
    }).expect(400)
    expect(response.body.error).to.be.equal('A NIF or CIF must be provided')
  })

  it('Should be an error, incorrect numbers of furniture or may not exist', async() => {
    const response = await request(app).post('/transactions').send({
      nif: "95128784W",
      furnitureList: [
        {
          name: "Sillon cheslon",
          quantity: 5
        }
      ]
    }).expect(404)
    expect(response.body.error).to.be.equal('Incorrect numbers of furniture(the furniture may not exist)')
  })

  it('Should be an error, Customer/Provider was not found', async() => {
    const response = await request(app).post('/transactions').send({
      nif: "95128784",
      furnitureList: [
        {
          name: "Sillon cheslon",
          quantity: 1
        }
      ]
    }).expect(404)
    expect(response.body.error).to.be.equal('Customer/Provider was not found')
  })

})


// En el patch poner
// nif o cif a modificar (tiene que ser del mismo tipo)
// array de los muebles a añadir(poner nombre y cantidad). DEBE existir stock al añadir


describe('PATCH /transactions', () => {
  it('Should modify a transaction with a customer', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    const transaction = await Transaction.findOne({entity: customer?._id})
    const response = await request(app).patch(`/transactions/${transaction?._id}`).send({
      nif: "95128784W",
      furnitureList: [
        {
          name: "Sillon cheslon",
          quantity: 1
        }
      ]
    }).expect(200)

    expect(response.body.furnitures.length).to.be.equal(2)
  })


  it('Should be an error, incorrect numbers of furniture or may not exist', async() => {
    const provider = await Provider.findOne({cif: "A12345678"})
    const transaction = await Transaction.findOne({entity: provider?._id})
    const response = await request(app).patch(`/transactions/${transaction?._id}`).send({
      cif: "A12345678",
      furnitureList: [
        {
          furniture: {
            name: "Escritorio moderno",
            desc: "Un escritorio pa trabajar",
            price: 250,
            color: "black"
          },
          quantity: 1
        }
      ]
    })

    expect(response.body.error).to.be.equal('Incorrect numbers of furniture(the furniture may not exist)')
  })

})


// En el DELETE poner la id dinámica:
//http://localhost:3000/transactions/6640f464226216330cfa026b
// Se debe comprobar que al borrar del customer se obtienen los muebles de la transacción
// Se debe comprobar que al borrar del provider se pierden los muebles(funciona por id del mueble)



describe('DELETE /transactions', () => {
  it('Should delete a transaction with customer', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    const transaction = await Transaction.findOne({entity: customer?._id})
    
    const response = await request(app).delete('/transactions/' + transaction?._id).expect(200)
    expect(response.body.message).to.be.equal('Transaction deleted')
  })

  it('Should delete a transaction with provider', async() => {
    // creamos la transacción para evitar problemas de que falte stock
    const provider3 = await new Provider(initialProvider3).save(); 
    await request(app).post('/transactions').send({
      cif: provider3.cif,
      furnitureList: [
        {
          furniture: initialFurniture3,
          quantity: 2
        }
      ]
   })
      
    const transaction = await Transaction.findOne({entity: provider3?._id})
    const response = await request(app).delete('/transactions/' + transaction?._id).expect(200)
    expect(response.body.message).to.be.equal('Transaction deleted')
  })

  it('404 Not found delete a transaction', async() => {
    const response = await request(app).delete('/transactions/' + '000000000000000000000000').expect(404)
  })

  
  it('Should not delete a transaction with provider with not enougth stock', async() => {
    const provider = await Provider.findOne({cif: "B23456789"})
    const transaction = await Transaction.findOne({entity: provider?._id})
    const response = await request(app).delete('/transactions/' + transaction?._id).expect(404)
    expect(response.body.error).to.be.equal('Furniture to be returned not in stock')
  })
  
})

