import mocha from 'mocha'
import { expect } from 'chai'
import request from 'supertest';
import { app } from '../src/main.js';
import { Customer } from '../src/models/customer.js';
import { Provider } from '../src/models/provider.js';


// MÉTODOS HOOK
const firstCustomer = {
  nif : "12345678Z",
  name: "Ramon",
  phone: "34123456789",
  address: "Calle Paraiso, barrio obrero"
}

const firstProvider = {
  cif : "A12345678",
  name: "Paco",
  phone: "11112222999",
  address: "Calle Alta, zenyatta"
}

// beforeEach(async () => {
//   await Customer.deleteMany();
//   await Provider.deleteMany();
//   await new Customer(firstCustomer).save();
//   await new Provider(firstProvider).save();
// });

// afterEach(async () => {
//   await Customer.deleteMany()
//   await Provider.deleteMany()
// })

// TESTS
// describe('Test en ruta /uknown', () => {
//   it('Debería devolver 501', async () => {
//     await request(app).post('/uknown').send({
//       name: "Eduardo",
//     }).expect(501);
//   });
// });

