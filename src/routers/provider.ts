import express from "express"
import { Provider } from '../models/provider.js'

export const providerRouter = express.Router()

providerRouter.post('/providers', async (req, res) => {
  const provider = new Provider(req.body)

  try {
    await provider.save()
    return res.status(201).send(provider)
  } catch (error) {
    return res.status(500).send(error)
  }

})

providerRouter.get('/providers', async (req, res) => {
  const filter = req.query.cif?{cif: req.query.cif.toString()} : {}

  try {
    const provider = await Provider.find(filter)

    if (provider.length != 0) {
      return res.send(provider)
    }
    return res.status(404).send({
      error: 'provider not found'
    })

  } catch (error) {
    return res.status(500).send(error)
  }
})

providerRouter.get('/providers/:id', async (req, res) => {
  
  try {
    const provider = await Provider.findById(req.params.id)
    if (!provider) {
      return res.status(404).send({
        error: 'provider not found'
      })
    }
    return res.send(provider)

  } catch (error) {
    return res.status(500).send(error)
  }
})

providerRouter.patch('/providers', async (req, res) => {
  try {
    if (!req.query.cif) {
      return res.status(404).send({
        error: 'CIF should be provided'
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

    const provider = await Provider.findOneAndUpdate({cif: req.query.cif?.toString()}, req.body, {new: true, runValidators: true})

    if (provider) {
      return res.send(provider)
    }

    return res.status(404).send({
      error: 'provider not found'
    })

  } catch (error) {
    return res.status(500).send(error)
  }
})

providerRouter.patch('/providers/:id', async (req, res) => {
  try {

    const allowedUpdates = ['name', 'phone', 'address']
    const actualUpdates = Object.keys(req.body)
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted'
      })
    }

    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    if (!provider) {
      return res.status(404).send({
        error: 'provider not found'
      })
    }

    return res.send(provider)

  } catch (error) {
    return res.status(500).send(error)
  }
})

providerRouter.delete('/providers', async (req, res) => {
  try {
    if (!req.query.cif) {
      return res.status(400).send({
        error: 'CIF should be provided'
      })
    }
  
    const provider = await Provider.findOneAndDelete({cif: req.query.cif.toString()})
  
    if (!provider) {
      return res.status(404).send({
        error: 'provider not found'
      })
    }
    
    return res.send(provider)

  } catch (error) {
    return res.status(500).send(error)
  }
})

providerRouter.delete('/providers/:id', async (req, res) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id)

    if (!provider) {
      return res.status(404).send({
        error: 'provider not found'
      })
    }

    return res.send(provider)

  } catch (error) {
    return res.status(500).send(error)
  }
})