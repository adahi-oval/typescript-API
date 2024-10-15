import mocha from 'mocha'
import { expect } from 'chai'
import request from 'supertest';
import { app } from '../src/main.js';
import { Furniture } from '../src/models/furnitures.js';

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

const mesa = {
  name: "Mesa de madera",
  color: "green",
  price: 100
}

const armario = {
  name: "Armario Rojo",
  color: "red",
  price: 100,
  desc: "Un armario de color rojo"
}

const silla = {
  name: "Silla metalica",
  desc: "Una silla de metal",
  price: 25,
  color: "black"
}

const testNoColor = {
  name: "Silla metalica",
  desc: "Una silla de metal",
  price: 25
}

const testNoName = {
  desc: "Una silla de metal",
  price: 25,
  color: "black"
}

const testNoPrice = {
  name: "Silla metalica",
  desc: "Una silla de metal",
  color: "black"
}

const testInvalidColor = {
  name: "Silla metalica",
  desc: "Una silla de metal",
  price: 25,
  color: "purple"
}

const testNegativePrice = {
  name: "Silla metalica",
  desc: "Una silla de metal",
  price: -200,
  color: "black"
}

const testNumericName = {
  name: "1234",
  desc: "Una silla de metal",
  price: 25,
  color: "black"
}

// HOOKS

beforeEach(async () => {
  await Furniture.deleteMany();
  await new Furniture(initialFurniture1).save();
  await new Furniture(initialFurniture2).save();
});

// afterEach(async () => {
//   await Furniture.deleteMany()
// })

describe('POST /furnitures', () => {
  
  it('Should create a furniture succesfully', async () => {
    const res = await request(app).post('/furnitures').send(mesa).expect(201);

    expect(res.body).to.include(mesa);

    const foundFurniture = await Furniture.findById(res.body._id);
    expect(foundFurniture).not.to.be.null;
    expect(foundFurniture!.name).to.equal(mesa.name);
  });

  it('Not inserting, not all required fields provided', async () => {
    await request(app).post('/furnitures').send(testNoColor).expect(500);
    await request(app).post('/furnitures').send(testNoName).expect(500);
    await request(app).post('/furnitures').send(testNoPrice).expect(500);
  });

  it('Should not insert, invalid color', async () => {
    await request(app).post('/furnitures').send(testInvalidColor).expect(500);
  });

  it('Should not insert, invalid price', async () => {
    await request(app).post('/furnitures').send(testNegativePrice).expect(500);
  });

  it('Should not insert, invalid name', async () => {
    await request(app).post('/furnitures').send(testNumericName).expect(500);
  });

});

describe('GET /furnitures', () => {

  it('Should succesfully get furniture by query with name', async () => {
    const resName = await request(app).get('/furnitures').query({ name: "Escritorio moderno" }).expect(200);
    expect(resName.body[0]).to.include(initialFurniture1);
  });

  it('Should succesfully get furniture by query with description', async () => {
    const resDesc = await request(app).get('/furnitures').query({ desc: "Un escritorio pa trabajar" }).expect(200);
    expect(resDesc.body[0]).to.include(initialFurniture1);
  });

  it('Should succesfully get furniture by query with price', async () => {
    const resPrice = await request(app).get('/furnitures').query({ price: 25 }).expect(200);
    expect(resPrice.body[0]).to.include(initialFurniture2);
  });

  it('Should succesfully get furniture by query with color', async () => {
    const resColor = await request(app).get('/furnitures').query({ color: "green" }).expect(200);
    expect(resColor.body[0]).to.include(initialFurniture2);
  });

  it('Should succesfully get furniture by query with all of them', async () => {
    const resAll = await request(app).get('/furnitures').query({ name: "Escritorio moderno", desc: "Un escritorio pa trabajar", price: 250, color: "black" }).expect(200);
    expect(resAll.body[0]).to.include(initialFurniture1);
  });

  it('Should fail get furniture by query with invalid parameters', async () => {
    await request(app).get('/furnitures').query({ price: "asdasd" }).expect(500);
  });

  it('Should successfully get furniture by dynamic id', async() => {
    const furniture = await request(app).get('/furnitures').query({ name: "Escritorio moderno" }).expect(200);
    await request(app).get(`/furnitures/${furniture.body[0]._id}`).expect(200);
  });

  it('Should fail get furniture by dynamic id when doesnt exist', async() => {
    await request(app).get(`/furnitures/65465465a1sd1`).expect(500);
  });

  it('Should resolve 404 when not exists', async () => {
    await request(app).get('/furnitures').query({ name: "Escritorio moderno", desc: "Un escritorio pa trabajar", price: 250, color: "green" }).expect(404);
  });

});

describe('PATCH /furnitures', () => {
  it('Should update furniture by name', async () => {
    const res = await request(app).patch('/furnitures').query({name: "Escritorio moderno"}).send({
      name: "UPDATED"
    }).expect(200);

    expect(res.body.name).to.be.equal("UPDATED");
  });

  it('Should update furniture by desc', async () => {
    const res = await request(app).patch('/furnitures').query({desc: "Un escritorio pa trabajar"}).send({
      desc: "UPDATED"
    }).expect(200);

    expect(res.body.desc).to.be.equal("UPDATED");
  });

  it('Should update furniture by price', async () => {
    const res = await request(app).patch('/furnitures').query({price: 250}).send({
      price: 400
    }).expect(200);

    expect(res.body.price).to.be.equal(400);
  });

  it('Should update furniture by color', async () => {
    const res = await request(app).patch('/furnitures').query({color: "black"}).send({
      color: "red"
    }).expect(200);

    expect(res.body.color).to.be.equal("red");
  });

  it('Should fail update furniture by not permitted update', async () => {
    await request(app).patch('/furnitures').query({color: "black"}).send({
      nif: "red"
    }).expect(400);
  });

  it('Should fail update furniture by invalid parameter', async () => {
    await request(app).patch('/furnitures').query({price: "black"}).send({
      color: "red"
    }).expect(500);
  });

  it('Should update furniture by dynamic id', async() => {
    const furniture = await Furniture.findOne({name: "Sillon cheslon"})
    await request(app).patch(`/furnitures/${furniture?._id}`).send({
      name: 'MODIFIED'
    }).expect(200)
  })

  it('Should fail update furniture by dynamic id update not permitted', async() => {
    const furniture = await Furniture.findOne({name: "Sillon cheslon"})
    await request(app).patch(`/furnitures/${furniture?._id}`).send({
      nif: 'MODIFIED'
    }).expect(400)
  })

  it('Should fail update furniture by dynamic id nof found', async() => {
    const furniture = await Furniture.findOne({name: "Sillon cheslon"})
    await request(app).delete(`/furnitures/${furniture?._id}`).expect(200);
    await request(app).patch(`/furnitures/${furniture?._id}`).send({
      name: 'MODIFIED'
    }).expect(404)
  })

  it('Should fail update furniture by dynamic id update error', async() => {
    await request(app).patch(`/furnitures/65465d4a65s4d`).send({
      name: 'MODIFIED'
    }).expect(500)
  })

  it('Should not modify, furniture not found', async() => {
    const response = await request(app).patch('/furnitures').query({name: "TEST"}).send({
      name: 'TESTANDO'
    }).expect(404);

    expect(response.body.error).to.be.equal('Furniture not found')
  })

});

describe('DELETE /furnitures', () => {

  it('Should delete furniture by name', async () => {
    const res = await request(app).delete('/furnitures').query({name: "Escritorio moderno"}).expect(200);
    expect(res.body).to.include(initialFurniture1);
    await request(app).get('/furnitures').query({name: "Escritorio moderno"}).expect(404);
    await request(app).post('/furnitures').send(initialFurniture1).expect(201);
  });

  it('Should delete furniture by desc', async () => {
    const res = await request(app).delete('/furnitures').query({desc: "Un escritorio pa trabajar"}).expect(200);
    expect(res.body).to.include(initialFurniture1);
    await request(app).get('/furnitures').query({name: "Escritorio moderno"}).expect(404);
    await request(app).post('/furnitures').send(initialFurniture1).expect(201);
  });

  it('Should delete furniture by color', async () => {
    const res = await request(app).delete('/furnitures').query({color: "black"}).expect(200);
    expect(res.body).to.include(initialFurniture1);
    await request(app).get('/furnitures').query({name: "Escritorio moderno"}).expect(404);
    await request(app).post('/furnitures').send(initialFurniture1).expect(201);
  });

  it('Should delete furniture by price', async () => {
    const res = await request(app).delete('/furnitures').query({price: 250}).expect(200);
    expect(res.body).to.include(initialFurniture1);
    await request(app).get('/furnitures').query({name: "Escritorio moderno"}).expect(404);
    await request(app).post('/furnitures').send(initialFurniture1).expect(201);
  });

  it('Should fail delete furniture by invalid price', async () => {
    await request(app).delete('/furnitures').query({price: "black"}).expect(500);
  });

  it('Should delete user by dynamic id', async() => {
    const furniture = await Furniture.findOne({name: "Sillon cheslon"})
    await request(app).delete(`/furnitures/${furniture?._id}`).expect(200);
    await request(app).get(`/furnitures/${furniture?._id}`).expect(404)
    await request(app).delete(`/furnitures/${furniture?._id}`).expect(404);
  })

  it('Should not delete user, not exists', async() => {
    const res = await request(app).delete('/furnitures').query({name: "TEST"}).expect(404);
    expect(res.body.error).to.be.equal('Furniture not found');
  })

  it('Should fail update furniture by dynamic id update error', async() => {
    await request(app).delete(`/furnitures/65465d4a65s4d`).expect(500);
  })

});