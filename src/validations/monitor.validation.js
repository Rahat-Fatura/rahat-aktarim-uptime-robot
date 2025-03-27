const joi = require('joi');

const createMonitor = {
  body: joi.object().keys({
    name: joi.string().required(),
    method: joi.string().required(),
    host: joi
      .string()
      .uri({
        scheme: ['http', 'https'],
        allowRelative: false,
        allowQuerySquareBrackets: true,
      })
      .required(),
    body: joi.object(),
    headers: joi.object(),
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
    report_time: joi
      .number()
      .required()
      .when('reportTimeUnit', {
        is: 'hours',
        then: joi.number().min(1).max(23),
      })
      .when('reportTimeUnit', {
        is: 'days',
        then: joi.number().min(1).max(30),
      })
      .when('reportTimeUnit', {
        is: 'weeks',
        then: joi.number().min(1).max(4),
      })
      .when('reportTimeUnit', {
        is: 'months',
        then: joi.number().min(1).max(12),
      }),
    reportTimeUnit: joi.string().valid('hours', 'days', 'weeks', 'months'),
    allowedStatusCodes: joi.array().min(1).items(joi.string().min(3).max(3)).required(),
  }),
};

const updateMonitor = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
  body: joi.object().keys({
    name: joi.string().required(),
    method: joi.string().required(),
    host: joi
      .string()
      .uri({
        scheme: ['http', 'https'],
        allowRelative: false,
        allowQuerySquareBrackets: true,
      })
      .required(),
    headers: joi.object(),
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
    report_time: joi
      .number()
      .required()
      .when('reportTimeUnit', {
        is: 'hours',
        then: joi.number().min(1).max(23),
      })
      .when('reportTimeUnit', {
        is: 'days',
        then: joi.number().min(1).max(30),
      })
      .when('reportTimeUnit', {
        is: 'weeks',
        then: joi.number().min(1).max(4),
      })
      .when('reportTimeUnit', {
        is: 'months',
        then: joi.number().min(1).max(12),
      }),
    reportTimeUnit: joi.string().valid('hours', 'days', 'weeks', 'months'),
    allowedStatusCodes: joi.array().min(1).items(joi.string().min(3).max(3)).required(),
  }),
};

const deleteMonitor = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
};

const pauseMonitor = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
};

const playMonitor = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
};

module.exports = {
  createMonitor,
  updateMonitor,
  deleteMonitor,
  pauseMonitor,
  playMonitor,
};
