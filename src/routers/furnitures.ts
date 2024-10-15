import express from 'express';
import { Furniture } from '../models/furnitures.js';

interface FurnitureFilter {
  name?: string,
  desc?: string,
  color?: string,
  price?: number
}

export const furnitureRouter = express.Router();

furnitureRouter.post('/furnitures', async (req, res) => {

  const furniture = new Furniture(req.body);

  try {
    await furniture.save();
    return res.status(201).send(furniture);
  } catch (err) {
    return res.status(500).send(err);
  }

});

furnitureRouter.get('/furnitures', async (req, res) => {

  const filter: FurnitureFilter = {}

  if(req.query.name) {
    filter.name = req.query.name.toString();
  }
  if(req.query.desc) {
    filter.desc = req.query.desc.toString();
  }
  if(req.query.color) {
    filter.color = req.query.color.toString();
  }
  if(req.query.price) {
    filter.price = parseFloat(req.query.price.toString());
  }

  try {
    const furniture = await Furniture.find(filter);

    if(furniture.length != 0) {
      return res.send(furniture);
    } else {
      return res.status(404).send({
        error: 'Furniture not found'
      });
    }

  } catch (err) {
    return res.status(500).send(err);
  }

});

furnitureRouter.get('/furnitures/:id', async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);

    if(!furniture) {
      return res.status(404).send({
        error: 'Furniture not found'
      });
    } else {
      return res.send(furniture);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

furnitureRouter.patch('/furnitures', async (req, res) => {
  try {
    const filter: FurnitureFilter = {}

    if(req.query.name) {
      filter.name = req.query.name.toString();
    }
    if(req.query.desc) {
      filter.desc = req.query.desc.toString();
    }
    if(req.query.color) {
      filter.color = req.query.color.toString();
    }
    if(req.query.price) {
      filter.price = parseFloat(req.query.price.toString());
    }

    const allowedUpdates = ['name', 'desc', 'color', 'price'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate: boolean = actualUpdates.every((update) => allowedUpdates.includes(update));

    if(!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted'
      });
    } else {
      const furniture = await Furniture.findOneAndUpdate(filter, req.body, {new: true, runValidators: true});

      if (furniture) {
        return res.send(furniture);
      } else {
        return res.status(404).send({
          error: 'Furniture not found'
        });
      }
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

furnitureRouter.patch('/furnitures/:id', async (req, res) => {
  try {
    const allowedUpdates = ['name', 'desc', 'color', 'price'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate: boolean = actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Update not permitted'
      })
    }

    const furniture = await Furniture.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    if(!furniture) {
      return res.status(404).send({
        error: 'Furniture not found'
      });
    } else {
      return res.send(furniture);
    }

  } catch (err) {
    return res.status(500).send(err);
  }
});

furnitureRouter.delete('/furnitures', async (req, res) => {

  const filter: FurnitureFilter = {}

  if(req.query.name) {
    filter.name = req.query.name.toString();
  }
  if(req.query.desc) {
    filter.desc = req.query.desc.toString();
  }
  if(req.query.color) {
    filter.color = req.query.color.toString();
  }
  if(req.query.price) {
    filter.price = parseFloat(req.query.price.toString());
  }

  try {
    const furniture = await Furniture.findOneAndDelete(filter);

    if(!furniture) {
      return res.status(404).send({
        error: 'Furniture not found'
      });
    } else {
      return res.send(furniture);
    }
  } catch (err) {
    return res.status(500).send(err);
  }

});

furnitureRouter.delete('/furnitures/:id', async (req, res) => {
  try {
    const furniture = await Furniture.findByIdAndDelete(req.params.id);

    if(!furniture) {
      return res.status(404).send({
        error: 'Furniture not found'
      })
    } else {
      return res.send(furniture);
    }

  } catch (err) {
    return res.status(500).send(err);
  }
})