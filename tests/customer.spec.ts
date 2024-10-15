import mocha from 'mocha'
import { expect } from 'chai'
import request from 'supertest';
import { app } from '../src/main.js';
import { Customer } from '../src/models/customer.js';


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

const noTransactionCustomer = {
  nif : 'Z3634494Q',
  name: 'A',
  phone: '123123123',
  address: 'NoPuede'
}


const nifExists = {
  nif: "95128784W",
  name: 'A',
  phone: '123123123',
  address: 'NoPuede'
}

const incorrectNif = {
  nif : '123123123123A',
  name: 'A',
  phone: '123123123',
  address: 'NoPuede'
}

const incorrectPhone = {
  nif : '99580269K',
  name: 'A',
  phone: 'a123431231342',
  address: 'NoPuede'
}



// MÉTODOS HOOK
beforeEach(async () => {
  await Customer.deleteMany()
  await new Customer(firstCustomer).save()
  await new Customer(secondCustomer).save()
  await new Customer(noTransactionCustomer).save()
})

// afterEach(async () => {
//   await Customer.deleteMany()
// })

//TESTS

describe('POST /customers', () => {
  it('Should succesfully create a new user', async() => {
    const response = await request(app).post('/customers').send({
      nif: '37460184S',
      name: 'CustomerInsertado',
      phone: '123456789',
      address: 'Calle POST'
    }).expect(201)


    expect(response.body).to.include({
      nif: '37460184S',
      name: 'CustomerInsertado',
      phone: '123456789',
      address: 'Calle POST'
    })

    const foundCustomer = await Customer.findById(response.body._id)
    expect(foundCustomer).not.to.be.null
    expect(foundCustomer!.name).to.equal('CustomerInsertado')

  })


  it('Should not insert, NIF already exists', async() => {
    await request(app).post('/customers').send({nifExists}).expect(500)
  })

  it('Should not insert, NIF is not valid', async() => {
    await request(app).post('/customers').send({incorrectNif}).expect(500)
  })

  it('Should not insert, incorrect phone number', async() => {
    await request(app).post('/customers').send({incorrectPhone}).expect(500)
  })

})


describe('GET /customers', () => {
  it('Should succesfully get user by query', async() => {
    const response = await request(app).get('/customers').query({nif: '95128784W'}).expect(200)
    expect(response.body[0]).to.include(firstCustomer)
  })

  it('Should successfully get user by dynamic id', async() => {
    const customer = await Customer.findOne({nif: "95128784W"})
    await request(app).get(`/customers/${customer?._id}`).expect(200)
  })

  it('Should not get an user, not exists', async() => {
    await request(app).get('/customers').query({nif: '198323SA'}).expect(404)
  })

})


describe('PATCH /customers', () => {
  it('Should modify user', async() => {
    const response = await request(app).patch('/customers').query({nif: "95128784W"}).send({
      name: 'PATCHMODIFIED'
    }).expect(200)

    const customer = await Customer.findOne({nif : "95128784W"})
    expect(response.body.name).to.be.equal(customer?.name)
  })

  it('Should modify user by dynamic id', async() => {
    const customer = await Customer.findOne({nif: "60747252C"})
    await request(app).patch(`/customers/${customer?._id}`).send({
      name: 'MODIFIED'
    }).expect(200)
  })

  it('Should not modify NIF', async() => {
    const response = await request(app).patch('/customers').query({nif: "95128784W"}).send({
      nif: '60747252C'
    }).expect(400)

    expect(response.body.error).to.be.equal('Update is not permitted')
  })

  it('Should not modify, user not found', async() => {
    const response = await request(app).patch('/customers').query({nif: "95128784"}).send({
      name: 'APOP'
    }).expect(404)

    expect(response.body.error).to.be.equal('Customer not found')
  })

})


describe('DELETE /customers', () => {

  it('Should delete user', async() => {
    const response = await request(app).delete('/customers').query({nif: "95128784W"}).expect(200)
    expect(response.body).to.include(firstCustomer)
  })

  it('Should delete user by dynamic id', async() => {
    const customer = await Customer.findOne({nif: "60747252C"})
    await request(app).delete(`/customers/${customer?._id}`).expect(200)
  })

  it('Should not delete user, not exists', async() => {
    const response = await request(app).delete('/customers').query({nif: "123123123A"}).expect(404)
    expect(response.body.error).to.be.equal('Customer not found')
  })

})