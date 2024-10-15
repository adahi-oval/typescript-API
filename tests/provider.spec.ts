import mocha from 'mocha'
import { expect } from 'chai'
import request from 'supertest';
import { app } from '../src/main.js';
import { Provider } from '../src/models/provider.js';

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

const provider1 = {
  cif: "G34567890",
  name: "Manolito",
  phone: "928777666",
  address: "Parque Santa Catalina, esquina noreste"
}

const noTransactionProvider = {
  cif: "P9154175E",
  name: 'A',
  phone: '123123123',
  address: 'NoPuede'
}

const testExistingCif = {
  cif: "A12345678",
  name: "aasd",
  phone: "922123456",
  address: "Avenida Trinidad, parking"
}

const testInvalidCif = {
  cif: "AADAASD12233",
  name: "aasd",
  phone: "922123456",
  address: "Avenida Trinidad, parking"
}

const testInvalidPhone = {
  cif: "K12345678",
  name: "aasd",
  phone: "922a123456",
  address: "Avenida Trinidad, parking"
}

// HOOKS

beforeEach(async () => {
  await Provider.deleteMany();
  await new Provider(initialProvider1).save();
  await new Provider(initialProvider2).save();
  await new Provider(noTransactionProvider).save();
});

// afterEach(async() => {
//   await Provider.deleteMany()
// })

describe('POST /providers', () => {

  it('Should succesfully create a new provider', async () => {
    const res = await request(app).post('/providers').send(provider1).expect(201);
    expect(res.body).to.include(provider1);
  });

  it('Should not insert, CIF already exists', async() => {
    await request(app).post('/providers').send(testExistingCif).expect(500);
  });

  it('Should not insert, CIF invalid', async() => {
    await request(app).post('/providers').send(testInvalidCif).expect(500);
  });

  it('Should not insert, phone invalid', async() => {
    await request(app).post('/providers').send(testInvalidPhone).expect(500);
  });

});

describe('GET /providers', () => {

  it('Should find provider by CIF in query', async () => {
    const res = await request(app).get('/providers').query({cif: "A12345678"}).expect(200);
    expect(res.body[0]).to.include(initialProvider1);
  });

  it('Should find provider by dinamic ID', async () => {
    const provider = await Provider.findOne({cif: "A12345678"});
    await request(app).get(`/providers/${provider?._id}`).expect(200);
  });

  it('Should fail, provider not found', async () => {
    await request(app).get('/providers').query({cif: "A87654321"}).expect(404);
  });

  it('Should fail, provider by id not found', async () => {
    await request(app).get(`/providers/1640dfcd345381ebdb1ac707`).query({cif: "A87654321"}).expect(404);
  });

  it('Should fail, provider by id invalid', async () => {
    await request(app).get(`/providers/10dfcd345381ebdb1ac707`).query({cif: "A87654321"}).expect(500);
  });

});

describe('PATCH /providers', () => {
  
  it('Should update provider', async () => {
    const res = await request(app).patch('/providers').query({cif: "A12345678"}).send({
      name: 'PATCHMODIFIED'
    }).expect(200)

    const provider = await Provider.findOne({cif : "A12345678"})
    expect('PATCHMODIFIED').to.be.equal(provider?.name)
  })

  it('Should modify provider by dynamic id', async () => {
    const provider = await Provider.findOne({cif: "A12345678"})
    await request(app).patch(`/providers/${provider?._id}`).send({
      name: 'MODIFIED'
    }).expect(200)

    const provider2 = await Provider.findOne({cif : "A12345678"})
    expect('MODIFIED').to.be.equal(provider2?.name)
  })

  it('Should not modify CIF', async () => {
    const res = await request(app).patch('/providers').query({cif: "B23456789"}).send({
      cif: 'C23456789'
    }).expect(400)

    expect(res.body.error).to.be.equal('Update is not permitted')
  })

  it('Should not modify, provider not found', async () => {
    const res = await request(app).patch('/providers').query({cif: "U23456789"}).send({
      name: 'APOP'
    }).expect(404)

    expect(res.body.error).to.be.equal('provider not found')
  })

});

describe('DELETE /providers', () => {

  it('Should delete provider', async () => {
    const res = await request(app).delete('/providers').query({cif: "A12345678"}).expect(200)
    expect(res.body).to.include(initialProvider1)
  })

  it('Should delete provider by dynamic id', async() => {
    const provider = await Provider.findOne({cif: "B23456789"})
    await request(app).delete(`/providers/${provider?._id}`).expect(200)
  })

  it('Should not delete provider, doesnt exists', async() => {
    const res = await request(app).delete('/providers').query({cif: "A12312312"}).expect(404)
    expect(res.body.error).to.be.equal('provider not found')
  })

});