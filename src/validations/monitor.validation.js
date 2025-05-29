const joi = require('joi');
const dayjs = require('dayjs');


const deleteMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
};

const pauseMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
};

const playMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
};

const reportMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
};

const monitorMaintenance = {
  params: joi.object().keys({
    id: joi.string().required(),
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
    id: joi.string().required(),
  }),
};

module.exports = {
  deleteMonitor,
  pauseMonitor,
  playMonitor,
  reportMonitor,
  monitorMaintenance,
  stopMaintananceJob,
};
