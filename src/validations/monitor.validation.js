/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const joi = require('joi');
const dayjs = require('dayjs');
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
    reportTime: joi
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
    reportTime: joi
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

const reportMonitor = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
};

const monitorMaintenance = {
  params: joi.object().keys({
    monitorId: joi.string().required(),
  }),
  body: joi.object().keys({
    startTime: joi.date()
      .min(dayjs().subtract(1, 'minute').toDate()) // Şimdiki zamandan 1 dk öncesi
      .required()
      .messages({
        'date.base': 'startTime geçerli bir tarih olmalı',
        'date.min': 'startTime, şimdiki zamandan 1 dakika öncesinden eski olamaz',
        'any.required': 'startTime zorunlu bir alan'
      }),
    endTime: joi.date()
      .min(joi.ref('startTime', {
        adjust: (value) => dayjs(value).add(1, 'minute').toDate() // startTime + 5 dk
      }))
      .required()
      .messages({
        'date.base': 'endTime geçerli bir tarih olmalı',
        'date.min': 'endTime, startTime\'dan en az 5 dakika sonra olmalı',
        'any.required': 'endTime zorunlu bir alan'
      })
  })
};

const stopMaintananceJob = {
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
  reportMonitor,
  monitorMaintenance,
  stopMaintananceJob,
};
