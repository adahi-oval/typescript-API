import express from "express"
import { Customer } from '../models/customer.js'

export const customerRouter = express.Router()

customerRouter.post('/customers', async (req, res) => {
  const customer = new Customer(req.body)

  try {
    await customer.save()
    return res.status(201).send(customer)
  } catch (error) {
    return res.status(500).send(error)
  }

})

customerRouter.get('/customers', async (req, res) => {
  const filter = req.query.nif?{nif: req.query.nif.toString()} : {}

  try {
    const customer = await Customer.find(filter)

    if (customer.length != 0) {
      return res.send(customer)
    }
    return res.status(404).send({
      error: 'Customer not found'
    })

  } catch (error) {
    return res.status(500).send(error)
  }
})

customerRouter.get('/customers/:id', async (req, res) => {
  
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).send({
        error: 'Customer not found'
      })
    }
    return res.send(customer)

  } catch (error) {
    return res.status(500).send(error)
  }
})

customerRouter.patch('/customers', async (req, res) => {
  try {
    if (!req.query.nif) {
      return res.status(404).send({
        error: 'NIF should be provided'
      })
    }

    const allowedUpdates = ['name', 'phone', 'address']
    const actualUpdates = Object.keys(req.body)
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted'
      })
    }

    const customer = await Customer.findOneAndUpdate({nif: req.query.nif?.toString()}, req.body, {new: true, runValidators: true})

    if (customer) {
      return res.send(customer)
    }

    return res.status(404).send({
      error: 'Customer not found'
    })

  } catch (error) {
    return res.status(500).send(error)
  }
})

customerRouter.patch('/customers/:id', async (req, res) => {
  try {

    const allowedUpdates = ['name', 'phone', 'address']
    const actualUpdates = Object.keys(req.body)
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted'
      })
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    if (!customer) {
      return res.status(404).send({
        error: 'Customer not found'
      })
    }

    return res.send(customer)

  } catch (error) {
    return res.status(500).send(error)
  }
})

customerRouter.delete('/customers', async (req, res) => {
  try {
    if (!req.query.nif) {
      return res.status(400).send({
        error: 'NIF should be provided'
      })
    }
  
    const customer = await Customer.findOneAndDelete({nif: req.query.nif.toString()})
  
    if (!customer) {
      return res.status(404).send({
        error: 'Customer not found'
      })
    }
    
    return res.send(customer)

  } catch (error) {
    return res.status(500).send(error)
  }
})

customerRouter.delete('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)

    if (!customer) {
      return res.status(404).send({
        error: 'Customer not found'
      })
    }

    return res.send(customer)

  } catch (error) {
    return res.status(500).send(error)
  }
})