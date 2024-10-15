import express from 'express'
import './db/mongoose.js'
import { defaultRouter } from './routers/default.js'
import { customerRouter } from './routers/customer.js';
import { providerRouter } from './routers/provider.js';
import { furnitureRouter } from './routers/furnitures.js';
import { transactionRouter } from './routers/transaction.js';

export const app = express()
app.use(express.json());
app.use(customerRouter)
app.use(providerRouter)
app.use(furnitureRouter)
app.use(transactionRouter)
app.use(defaultRouter)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})