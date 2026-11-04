import Joi from 'joi';

// Esquema de validación para los datos del comprador
const customerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'El nombre del cliente es obligatorio.',
    'string.min': 'El nombre debe tener al menos 3 caracteres.',
    'any.required': 'El nombre del cliente es obligatorio.'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'El email proporcionado no tiene un formato válido.',
    'any.required': 'El email del cliente es obligatorio.'
  }),
  phone: Joi.string().trim().min(6).max(25).required().messages({
    'any.required': 'El teléfono de contacto es obligatorio.'
  }),
  shippingAddress: Joi.string().trim().min(5).max(200).required().messages({
    'any.required': 'La dirección de entrega es obligatoria.'
  })
});

// Esquema para cada producto dentro del pedido
const itemSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    'any.required': 'El ID del producto es obligatorio.'
  }),
  saleModeId: Joi.number().integer().positive().required().messages({
    'any.required': 'El modo de venta es obligatorio.'
  }),
  productName: Joi.string().trim().min(2).max(120).required().messages({
    'any.required': 'El nombre del vino o producto es obligatorio.'
  }),
  unitPrice: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'El precio unitario debe ser mayor a cero.',
    'any.required': 'El precio unitario es obligatorio.'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'La cantidad mínima por producto es 1.',
    'any.required': 'La cantidad es obligatoria.'
  })
});

// Esquema principal del cuerpo de la petición POST /api/orders
const createOrderSchema = Joi.object({
  customer: customerSchema.required().messages({
    'any.required': 'Los datos del cliente son obligatorios.'
  }),
  items: Joi.array().items(itemSchema).min(1).required().messages({
    'array.min': 'El pedido debe incluir al menos un producto.',
    'any.required': 'La lista de productos es obligatoria.'
  })
});

// Middleware de Express que valida el cuerpo antes del controlador
export function validarCrearPedido(req, res, next) {
  const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });

  if (error) {
    // Marcamos para que errorMiddleware lo detecte como 400
    error.isJoi = true;
    return next(error);
  }

  // Reemplazamos req.body con los datos limpios y tipados por Joi
  req.body = value;
  next();
}

