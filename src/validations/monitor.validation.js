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
    interval: joi.number().required(),
    intervalUnit: joi.string().required(),
    report_time: joi.number(),
    reportTimeUnit: joi.string(),
    server_owner: joi.number(),
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
    interval: joi.number().required(),
    intervalUnit: joi.string().required(),
    report_time: joi.number(),
    reportTimeUnit: joi.string(),
    status: joi.boolean(),
    is_active_by_owner: joi.boolean(),
    allowedStatusCodes: joi.array().min(1).items(joi.string().min(3).max(3)).required(),
    is_process: joi.boolean(),
    body: joi.object(),
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
