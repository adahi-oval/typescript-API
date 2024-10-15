[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/CaXtHsbh)

# Práctica 13 - DSIkea: API REST con Node/Express

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ULL-ESIT-INF-DSI-2324_ull-esit-inf-dsi-23-24-prct13-dsikea-api-groupo&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ULL-ESIT-INF-DSI-2324_ull-esit-inf-dsi-23-24-prct13-dsikea-api-groupo)

[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct13-dsikea-api-groupo/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct13-dsikea-api-groupo?branch=main)


## Integrantes del Grupo

- Adahi Oval Afonso ([alu0101242071@ull.edu.es](mailto:alu0101242071@ull.edu.es))
- David Ezequiel Tolosa Cabalero ([alu0101479507@ull.edu.es](mailto:alu0101479507@ull.edu.es))
- Francisco David Hernández Alayón ([alu0101469898@ull.edu.es](mailto:alu0101469898@ull.edu.es))

<br>

## Introducción
El objetivo de esta práctica es el desarrollo de una API REST para la gestión de una tienda de muebles, que permite realizar operaciones **CRUD** (*Create, Read, Update, Delete*). Para ello se han desarrollado diferentes modelos y schemas, para modelar los datos de la API y diferentes rutas para las diferentes funcionalidades de la misma. Se hace uso del módulo `mongoose` para el tratamiento con la base de datos de `MongoDB`, así como del paquete `express` para las diferentes rutas y gestión de peticiones de la API. Para permitir el modelado de datos en los schema se han utilizado funcionalidades del paquete `validator` y para el desarrollo dirigido por pruebas se ha utilizado `mocha` y `chai`. También se ha implementado la integración continua mediante `Github Actions` y el control de calidad del código se ha hecho mediante el uso de `SonarCloud` y `Coveralls`.

<br>

## Modelos
Para el desarrollo de las rutas y las funcionalidades de la API se han creado diferentes modelos de datos para los diferentes tipos de objetos que se guardarán en la base de datos de una tienda de muebles, haciendo uso de `model` y `Schema` dentro del módulo `mongoose`. Estos modelos son:

  - Customer
  - Provider
  - Furniture
  - Transaction


### Customer
Para el desarrollo se ha creado el modelo `Customer` a partir del esquema `CustomerSchema`, que a su vez ha sido creado a partir de la interfaz `CustomerDocumentInterface` que extiende la interfaz `Document` proporcionada por `mongoose`. Veamos esta última interfaz:
```typescript
export interface CustomerDocumentInterface extends Document {
  nif : string,
  name: string,
  phone: string,
  address: string
}
```

Esta interfaz define los campos que tendrá nuestro **schema**, y por tanto la información que será guardada de cada cliente. En nuestro caso son 4: el nif, el nombre, el teléfono y la dirección. Estos campos se limitan y estipulan en el **schema** de la siguiente manera:

```typescript
const CustomerSchema = new Schema<CustomerDocumentInterface>({

  nif: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => { // VER SI ESTO COMPRUEBA NIF
      if (!validator.isIdentityCard(value, 'ES')) {
        throw new Error('NIF should be a valid one(12345678A)')
      }
    }
  },

  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isAlpha(value)) {
        throw new Error('Name should contain only characters')
      }
    }
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isMobilePhone(value)) {
        throw new Error('Phone should be a valid one')
      }
    }
  },

  address: {
    type: String,
    required: true,
    trim: true
  }

})
```

El nif es de tipo string y será único(`unique: true`) en toda la base de datos ademas aprovechamos la función *validate* que comprueba si es un *identity card* de españa(`!validator.isIdentityCard(value, 'ES')`). El nombre es una string en cual quitamos los espacios innecesarios(`trim: true`) y comprobamos que solo contega carácteres alfanuméricos(`!validator.isAlpha(value)`). El teléfono es una string en el que quitamos los espacios sobrantes y comprobamos que sea un número de teléfono válido(`!validator.isMobilePhone(value)`). Por último, la dirección será una string y, al igual que los demás atributos, sera obligatoria tenerla(`required: true`).

Tras el desarrollo del `Schema` se crea el modelo haciendo uso del mismo:

```typescript
export const Customer = model<CustomerDocumentInterface>('Customer', CustomerSchema)
```


### Provider
El *Provider* es muy parecido al customer, para esto se ha creado el modelo `Provider` a partir del esquema `ProviderSchema`, que a su vez ha sido creado a partir de la interfaz `ProviderDocumentInterface` que extiende la interfaz `Document` proporcionada por `mongoose`. Veamos esta última interfaz:
```typescript
export interface ProviderDocumentInterface extends Document {
  cif : string,
  name: string,
  phone: string,
  address: string
}
```

Esta interfaz define los campos que tendrá nuestro **schema**, y por tanto la información que será guardada de cada cliente. En nuestro caso son 4: el cif(*la única diferencia que tiene con el Customer*), el nombre, el teléfono y la dirección. Estos campos se limitan y estipulan en el **schema** de la siguiente manera:

```typescript
const ProviderSchema = new Schema<ProviderDocumentInterface>({
  cif: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => {
      const cifRegex = /^[A-HJNPQRSUVW]{1}[0-9]{7}[0-9A-J]$/;

      if (!cifRegex.test(value)) {
        throw new Error('CIF not valid.');
      }
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isAlpha(value)) {
        throw new Error('Name should contain only characters')
      }
    }
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!validator.isMobilePhone(value)) {
        throw new Error('Phone should be a valid one')
      }
    }
  },

  address: {
    type: String,
    required: true,
    trim: true
  }
})
```

Como podemos observar, sigue el mismo esquema que *Customer* salvo que el nif se sustituye por el cif, aunque siguen las mismas reglas. Tras el desarrollo del `Schema` se crea el modelo haciendo uso del mismo:

```typescript
export const Provider = model<ProviderDocumentInterface>('Provider', ProviderSchema)
```


### Furniture
Para el desarrollo se ha creado el modelo `Furniture` a partir del esquema `FurnitureSchema`, que a su vez ha sido creado a partir de la interfaz `FurnitureDocumentInterface` que extiende la interfaz `Document` proporcionada por `mongoose`. Veamos esta última interfaz:

```typescript
export interface FurnituresDocumentInterface extends Document {
  name: string,
  desc: string,
  color: 'blue' | 'red' |'green' | 'black',
  price: number
}
```

Esta interfaz define los campos que tendrá nuestro **schema**, y por tanto la información que será guardada de cada mueble. En nuestro caso son 4: el nombre, la descripción, el color (*que tiene parámetros predefinidos*) y el precio. Estos campos se limitan y estipulan en el **schema** de la siguiente manera:

```typescript
const FurnitureSchema = new Schema<FurnituresDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if(!validator.isAlpha(value.replace(/\s/g, ''))) {
        throw new Error('Name is not valid.');
      }
    }
  }, 

  desc: {
    type: String,
    trim: true,
  },

  color: {
    type: String,
    required: true,
    enum: ['blue', 'green', 'red', 'black'],
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    trim: true,
    validate: (value: number) => {
      if(!(value >= 0)) {
        throw new Error('Price must be positive');
      }
    }
  }

})
```

Como podemos observar, el nombre se estipula como un tipo string, es un parámetro requerido y se le activa la opción `trim` para eliminar los espacios innecesarios al insertarlo. También se desarrolla un validator, haciendo uso del módulo con el mismo nombre, implementando el método `validate`. En este caso se comprueba si el nombre está compuesto de caracteres alfabéticos y/o espacios, utilizando el método `isAlpha` del módulo `validator` y sustituyendo los caracteres de espacio por caracteres vacíos. Esto no compromete la integridad de los datos ya que es solo dentro del `validator`. A continuación, vemos que la descripción también es de tipo string y también se le aplica `trim` pero en este caso no es un campo requerido, ya que se considera información adicional no necesaria. En tercer lugar, vemos que el color se estipula como string y se le aplica `trim`, además de ser un campo requerido, pero también se estipula como un valor enumerado que solo puede tomar los valores estipulados en el campo `enum`. Por último, el precio es un valor de tipo number, requerido, trimeado y con un `validator` que impide que sea un número negativo ya que no tendría sentido dentro de nuestro caso.

Tras el desarrollo del `Schema` se crea el modelo haciendo uso del mismo:

```typescript
export const Furniture = model<FurnituresDocumentInterface>('Furniture', FurnitureSchema);
```


### Transaction
Hemos creado el modelo `Transaction` a partir del esquema `TransactionSchema`, que a su vez ha sido creado a partir de la interfaz `TransactionDocumentInterface` que extiende la interfaz `Document` proporcionada por `mongoose`. Veamos esta última interfaz:

```typescript
enum TypeTransaction {
  Provider = "Provider",
  Customer = "Customer"
}

interface TransactionsDocumentInterface extends Document {
  entity: CustomerDocumentInterface | ProviderDocumentInterface,  // entidad de la operacion(cliente o proveedor)
  type: TypeTransaction,  // almacena si la transacción es a un proveedor o a un cliente
  furnitures: FurnituresDocumentInterface[],  // array de muebles
  date?: Date,  // fecha y hora
  cost: number  // cost total de la transacción
}
```
Podemos ver como la entidad(`entity`) puede variar entre customer o Provider y el tipo de la transacción es un enum, que puede ser o "Provider" o "Customer" según corresponda. Además, contaremos con un array de furnitures(`FurnituresDocumentInterface[]`). Estos campos se limitan y estipulan en el **schema** de la siguiente manera:

```typescript
const TransactionSchema = new Schema<TransactionsDocumentInterface>({
  entity: {
    type: Schema.Types.ObjectId,   
    required: true,
    ref: 'type' // tiene que ser o un proveedor o un cliente 
    
  }, 

  type: {
    type: String,
    required: true,
    enum: TypeTransaction
  },

  furnitures: {
    type: [FurnitureSchema],
    required: true
  },

  date: {
    type: Date,
    default: Date.now  // se autocalcula con la fecha de ahora
  },

  cost: {
    type: Number,
    default: function() {
      return this.furnitures.reduce((total, furniture) => total + furniture.price, 0) as number;  // Sumamos los precios de todos los muebles
    }
  }

})
```
El schema resultante consta de un campo entity que referencia a la base de datos Provider o Customer según corresponda(por ello ponemos `ref: 'type'`, para que acceda al valor del campo type, que es donde se almacena el enum que contiene los dos casos), furnitures, que será un array de furnitures, y date y cost que se autocalculan con la fecha actual y la suma de los costes de todos los muebles, respectivamente.


Tras el desarrollo del `Schema` se crea el modelo haciendo uso del mismo:

```typescript
export const Transaction = model<TransactionsDocumentInterface>('Transaction', TransactionSchema);
```


<br>

## Rutas
La API tiene diferentes rutas, para gestionar los diferentes tipos de solicitudes que se le presentarán a una tienda de muebles. Las rutas implementadas son 4:
  - Clientes: `/customers`
  - Proveedores: `/providers`
  - Muebles: `/furnitures`
  - Transacciones: `/transactions`


### Clientes: `/customers`
Ruta encargada de los clientes de la tienda. Hace uso del modelo `Customer` explicado anteriormente para la gestión de los datos y la comunicación con la base de datos mediante `mongoose`. Para ello se crea el **router** de express `customerRouter`:

```typescript
export const customerRouter = express.Router()
```

A partir de él se definen las diferentes acciones bajo la ruta `/customers` con los diferentes verbos **HTTP**.

#### POST
Esta acción permite la creación de nuevos clientes, donde, si existe algún error, devuelve un código de *500*; en un caso satisfactorio devuelve *201* y el cliente incorporado a la base de datos.

#### GET
Acción que permite obtener clientes concretos, esto se puede hacer a través de la id, con una ruta dinámica(`'/customers/:id'`), o a través de un nif. Esta acción puede devolver 404(*si el cliente no se encontró*), 500(*si hay algún error*) o el cliente buscado(*en caso de éxito*).

#### PATCH 
La acción de modificación, al igual que el *GET*, permite trabajar con la ruta dinámica, con su id, o su nif. *PATCH* establece una serie de atributos que se pueden modificar(`['name', 'phone', 'address']`) y, en caso de que la modificación sea valida, devuelve el objeto modificado(*si no se encuentra el cliente, hay algún error o no se permite la modificación se devuelve 404, 500 o 400, respectivamente*).

#### DELETE
Esta acción actúa similar que el *GET* pudiendo trabajar con su id o su nif y devolviendo *404* o el cliente borrado, según corresponda.

### Proveedores: `/providers`
Ruta encargada de los proveedores de la tienda. Hace uso del modelo `Provider` explicado anteriormente para la gestión de los datos y la comunicación con la base de datos mediante `mongoose`. Para ello se crea el **router** de express `customerRouter`:

```typescript
export const providerRouter = express.Router()
```

A partir de él se definen las diferentes acciones bajo la ruta `/providers` con los diferentes verbos **HTTP**. Estas acciones se programan de la misma manera que customers, lo único que cambia es sustituir el nif por cif donde se requiera.


### Muebles: `/furnitures`
Ruta encargada de los muebles de la tienda. Hace uso del modelo `Furniture` explicado anteriormente para la gestión de los datos y la comunicación con la base de datos mediante `mongoose`. Para ello se crea el **router** de express `furnitureRouter`:

```typescript
export const furnitureRouter = express.Router();
```

A partir de él se definen las diferentes acciones bajo la ruta `/furnitures` con los diferentes verbos **HTTP**.

#### POST
Esta es la más sencilla de las operaciones bajo la ruta `/furnitures`. Se encarga de las operaciones de creación a partir de las solicitudes HTTP que recibe la API, se crea una nueva instancia del modelo a partir del cuerpo de la petición (*req.body*), de esta manera ya pasa por todos los parámetros y validadores que definimos en el modelo, tras ello mediante una estructura *try-catch* se intenta guardar en la base de datos haciendo uso del método `.save()` de `mongoose`, en caso de éxito se devuelve una respuesta con status 201 al cliente y en el cuerpo de la respuesta el documento de la base de datos recién creado. En caso de error, se devuelve una respuesta con estado 500 y el error en el cuerpo de la respuesta.


#### GET
Esta es la operación encargada de la lectura de la base de datos. Funciona de 3 maneras:

1. Si no se le pasa nada en la *query string* o la id de la base de datos como parámetro dinámico: devuelve todos los documentos de la base de datos bajo la ruta `/furnitures`
2. Si se le pasa por la *query string* el nombre, la descripción, el precio, el color o cualquier combinación de estos: devuelve los documentos de la base de datos que coincidan con los filtros impuestos
3. Si se le pasa la `_id` de la base de datos como parámetro dinámico en la dirección de la petición: devuelve el objeto que corresponde a esa `_id`.

Para conseguir el funcionamiento de los dos primeros casos se ha desarrollado la interfaz `FurnitureFilter`, que tiene como atributos opcionales: name, desc, color y price. De manera que se pueden dar todos, ninguno o cualquier combinación de ellos y todas serán opciones válidas. En el manejador de la ruta `/furnitures`, se crea un filtro `FurnitureFilter` vacío, tras ello se comprueba la *query string* para buscar `name`, `desc`, `color` o `price` en caso de encontrarlos, se asignan al parámetro del mismo nombre dentro del filtro. En caso de no encontrar ninguno se queda vacío. Este filtro se utiliza por último en el método `find` del modelo `Furniture` para buscar en la base de datos las coincidencias, en caso de encontrarlas se envían al cliente en la respuesta. En caso de que la longitud sea 0, que no se encontraran, se envía una respuesta con estado 404.

Para el último de los casos, se crea otro manejador para la ruta `/furnitures/:id`, donde `:id` es un parámetro dinámico. Este manejador hace uso del método `findById` del modelo para buscar el objeto que coincide con la `id` dada como parámetro dinámico. En caso de encontrarlo, lo devuelve en la respuesta y en caso contrario devuelve 404.


#### PATCH 
Esta es la operación encargada de la modificación de la base de datos. Funciona de manera similar a `GET`, se le puede pasar por la *query string* cualquier combinación de los atributos de un mueble o pasar la id del objeto a modificar como parámetro dinámico. Ambos métodos son válidos para encontrar el objeto a modificar. 

En el primero de los casos funciona de la misma manera que el manejador del `GET` utilizando `FurnitureFilter`, tras crear el filtro se crea el array de las modificaciones permitidas (*allowedUpdates*), y el array de las modificaciones dadas en el cuerpo de la petición (*actualUpdates*), tras ello se comparan entre sí y el resultado se guarda en el booleano *isValidUpdate*, en caso de este valor estar a **true** se busca el mueble a modificar mediante el método `findOneAndUpdate` del modelo y se le proporciona el filtro para encontrarlo, el cuerpo de la petición con las modificaciones y las opciones (en nuestro caso: `new: true` y `runValidators: true`). En caso de tener éxito se devuelve el mueble modificado en la respuesta y en caso de no encontrarse se devuelve un 404. 

Para el segundo de los casos se ejecuta de la misma manera que el caso anterior, solo que sin necesidad de crear el filtro y solo haciendo uso del parámetro dinámico `:id` dado. De esta forma se usa el método `findByIdAndUpdate` del modelo y se le pasa el id, el cuerpo de la petición y las opciones, que son las mismas que en el primer caso.

#### DELETE
Esta es la última de las operaciones desarrolladas, encargada de la eliminación de la base de datos. El manejador funciona de manera similar a los dos anteriores para buscar mediante la combinación de parámetros en la *query string* o mediante el id de la base de datos dado como parámetro dinámico. 

Para el primero de los casos se hace uso de manera similar a las anteriores de `FurnitureFilter` y luego hace uso del método `findOneAndDelete` del modelo, al que se le pasa el filtro y borra la primera coincidencia con el mismo de la base de datos. En caso de que no encuentre ninguna coincidencia (la variable donde se guarda el resultado del método es ***undefined***), se devuelve un 404. En caso de que se encuentre, se devuelve el objeto borrado en la respuesta.

Para el otro caso, se hace uso del método `findByIdAndDelete` del modelo, pasándole la id dada como parámetro dinámico y devuelve el objeto borrado en la respuesta en caso de tener éxito, y una respuesta 404 en caso contrario.



### Transactions: `/transactions`
Ruta encargada de las transacciones de la tienda. Hace uso del modelo `Transaction` explicado anteriormente para la gestión de los datos y la comunicación con la base de datos mediante `mongoose`. Para ello se crea el **router** de express `transactionRouter`:

```typescript
export const transactionRouter = express.Router();
```

A partir de él se definen las diferentes acciones bajo la ruta `/transactions` con los diferentes verbos **HTTP**.

#### POST
Permite añadir una trnasacción, que depende de los valores de nif o cif y furnitureList(que contiene nombre del mueble y cantidad), los demás valores: tipo, fecha y coste se autocalcularán. Para poder recibir los datos del usuario nos ayudamos de estas dos interfaces:

```typescript
interface CustomerFurnitureOrder {
  nif: string,
  furnitureList: [{
    name: string,
    quantity: number
  }]
}

interface ProviderFurnitureOrder {
  cif: string,
  furnitureList: [{
    furniture: FurnituresDocumentInterface,
    quantity: number    
  }]
}
```

#### GET
Permite obtener información acerca de una transacción en específico a través de la id, como ruta dinámica, o por nif, cif, tipo o fecha(introduciendo el rango de fechas entre los que se encuentra), estos últimos se introducen en la query string.

#### PATCH 
Acción que permite la modificación de las transacciones. Las modificaciones permitidas son
* *Entity*: el cual solo podrá cambiar según el tipo ya preestablecido, es decir, no podrá cambiar entre nif o cif.
* *Furnitures*: solo podremos añadir muebles a la transacción, con sus correspondientes operaciones en cascada.

#### DELETE
Esta acción permite borrar una transacción, existen dos tipos:
* *Eliminar una venta a un cliente(devolución del cliente)*: esto nos obliga a añadir los furnitures incluidos en el body del mensaje.
* *Eliminar una compra a un proveedor(devolución al proveedor)*: esto nos obliga a eliminar los furnitures asociados a la transacción(si hay algún id de un mueble que no existe, se rechaza la trnasacción poque no se puede devolver).


#### Otras funciones
Además de todo esto, contamos con varias funciones que nos ayudan a las operaciones en cascada y comprobaciones que necesitamos hacer:

```typescript
async function checkFurnitures(furnitures : [{ name: string; quantity: number; }]) : Promise<boolean> {
  for (let i = 0; i < furnitures.length; ++i) {
    const furniture = await Furniture.countDocuments({name: furnitures[i].name})
    if (furniture < furnitures[i].quantity) { // Si no existe o no hay de esa cantidad
      return false
    }
  }

  return true
}

async function deleteFurnitures(furnitures: [{name: string; quantity: number}]) : Promise<FurnituresDocumentInterface[]> {
  const deletedFurnitures : FurnituresDocumentInterface[] = []
  for (let i = 0; i < furnitures.length; ++i) {
    const furnituresToDelete = await Furniture.find({name: furnitures[i].name}).limit(furnitures[i].quantity) // Busca por el nombre y una cantidad máxima
    deletedFurnitures.push(...furnituresToDelete) // Guarda los muebles que se van a borrar
    await Furniture.deleteMany({_id: {$in: furnituresToDelete.map(f => f._id)}}) // Borrar por los ids de los furnitures del array obtenido
  }

  return deletedFurnitures
}

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
```

<br>

## Test
1. Instalamos las dependencias necesarias 
```
npm i --save-dev mocha @types/mocha chai @types/chai
npm i --save-dev ts-node
npm i --save-dev supertest @types/supertest
```

2. Ejecución de test
  * Tener activado mongo
  ```
  wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.8.tgz
  tar xzvf mongodb-linux-x86_64-ubuntu2204-7.0.8.tgz
  rm mongodb-linux-x86_64-ubuntu2204-7.0.8.tgz 
  mv mongodb-linux-x86_64-ubuntu2204-7.0.8/ mongodb
  mkdir mongodb-data  

  sudo /home/usuario/mongodb/bin/mongod --dbpath /home/usuario/mongodb-data/ 
  ```

  * Tener diferentes entornos(para poder trabajar en las pruebas con la base de dadots de pruebas por ejemplo)
  ```
  npm i --save-dev env-cmd
  ```

  fichero config/test.env:
  ```
  PORT=3000
  MONGODB_URL=mongodb://127.0.0.1:27017/magic-apirest-test
  ```

  package.json:
  ```json
  "dev": "tsc-watch --onSuccess \"env-cmd -f ./config/dev.env node dist/main.js\"",
  "test": "env-cmd -f ./config/test.env mocha --exit",
  "coverage": "c8 npm test && c8 report --reporter=lcov"
  ```

  * Se ejecutan los test con *npm run test*

<br>

## Despliegue
LINK DEPLOY:
https://magic-card-pout.onrender.com

<br>

## Conclusión
En conclusión, has sido una práctica interesante debido al trabajo con diferentes herramientas como *Moongose atlas* o *render*, que nos han permitido desplegar nuestra API REST en un entorno más cercano al de producción de una aplicación real. Las principales dificultades fueron encontradas en el entorno de las transacciones, debido a los problemas para gestionar las operaciones en cascada y al cómo gestionar el schema de forma correcta.
