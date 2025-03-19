const joi = require('joi');

const createMonitor = {
  body: joi.object().keys({
    name: joi.string().required(),
    method: joi.string().required(),
    host: joi.string().required(),
    port: joi.string(),
    body: joi.object(),
    headers: joi.object(),
    interval: joi.number(),
    report_time: joi.number(),
    server_owner: joi.number(),
    allowedStatusCodes: joi.array().min(1).items(joi.string().min(3)).required(),
  }),
};

const updateMonitor = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
  body: joi.object().keys({
    updated_at: joi.date().default(new Date()),
    name: joi.string(),
    method: joi.string(),
    host: joi.string(),
    port: joi.string(),
    headers: joi.object(),
    interval: joi.number(),
    report_time: joi.number(),
    status: joi.boolean(),
    is_active_by_owner: joi.boolean(),
    allowedStatusCodes: joi.array().min(1).items(joi.string().min(3)),
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
