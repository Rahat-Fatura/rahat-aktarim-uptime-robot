const joi = require('joi');

const createMonitor = {
  body: joi.object().keys({
    name: joi.string().required(),
    httpMonitor: joi.object({
      host: joi
      .string()
      .uri({
        scheme: ['http', 'https'],
        allowRelative: true,
        allowQuerySquareBrackets: true,
      })
      .required(),
      method: joi.string().valid("GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS").required(),
      body: joi.object(),
      headers: joi.object(),
      allowedStatusCodes: joi.array().items(joi.string().custom((value,helpers)=>{
        const num = Number(value);
        if (isNaN(num)) return helpers.error('any.invalid');
        if (num < 100 || num >= 600) return helpers.error('number.range');
        return value;
      },'Check string as number in range')),
      timeOut: joi.number().min(1).max(60)
    }).required(),
    interval: joi
      .number()
      .required()
      .when('intervalUnit', {
        is: 'seconds',
        then: joi.number().min(20).max(59),
        otherwise: joi.number().min(1), // Diğer birimler için minimum 1 olabilir
      })
      .when('intervalUnit', {
        is: 'minutes',
        then: joi.number().min(1).max(59),
      })
      .when('intervalUnit', {
        is: 'hours',
        then: joi.number().min(1).max(23),
      }).required(),
    intervalUnit: joi.string().valid('seconds', 'minutes', 'hours').required(),
    failCountRef: joi.number().min(1).required(),
  }),
};

const updateMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
  body: joi.object().keys({
    name: joi.string().required(),
    httpMonitor: joi.object({
      host: joi
      .string()
      .uri({
        scheme: ['http', 'https'],
        allowRelative: true,
        allowQuerySquareBrackets: true,
      })
      .required(),
      method: joi.string().valid("GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS").required(),
      body: joi.object(),
      headers: joi.object(),
      allowedStatusCodes: joi.array().items(joi.string().custom((value,helpers)=>{
        const num = Number(value);
        if (isNaN(num)) return helpers.error('any.invalid');
        if (num < 100 || num >= 600) return helpers.error('number.range');
        return value;
      },'Check string as number in range')),
      timeOut: joi.number().min(1).max(60)
    }).required(),
    interval: joi
      .number()
      .required()
      .when('intervalUnit', {
        is: 'seconds',
        then: joi.number().min(20).max(59),
        otherwise: joi.number().min(1), // Diğer birimler için minimum 1 olabilir
      })
      .when('intervalUnit', {
        is: 'minutes',
        then: joi.number().min(1).max(59),
      })
      .when('intervalUnit', {
        is: 'hours',
        then: joi.number().min(1).max(23),
      }).required(),
    intervalUnit: joi.string().valid('seconds', 'minutes', 'hours').required(),
    failCountRef: joi.number().min(1).required(),
  }),
};

const getMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
};

module.exports = {
  createMonitor,
  updateMonitor,
  getMonitor,
};
