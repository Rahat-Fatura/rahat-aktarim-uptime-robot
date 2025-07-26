const joi = require('joi');

const createMonitor = {
  body: joi.object().keys({
    name: joi.string().required(),
    cronJobMonitor: joi.object({
      devitionTime: joi.number().min(0).max(60).required(),
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
      }),
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
    cronJobMonitor: joi.object({
      devitionTime: joi.number().min(0).max(60).required(),
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
      }),
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
