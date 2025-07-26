const joi = require("joi");

const createMonitor = {
  body: joi.object().keys({
    name: joi.string().required(),
    portMonitor: joi
      .object({
        host: joi
          .string()
          .custom((value, helpers) => {
            const ipSchema = joi.string().ip({ version: ["ipv4", "ipv6"] });
            const hostSchema = joi.string().hostname();
            const urlSchema = joi
                  .string()
                  .uri({
                    scheme: ['http', 'https'],
                    allowRelative: true,
                    allowQuerySquareBrackets: true,
                  });
            const isUrl =  !urlSchema.validate(value).error;
            const isIp = !ipSchema.validate(value).error;
            const isHost = !hostSchema.validate(value).error;
            
            if (isIp || isHost || isUrl) {
              return value;
            }

            return helpers.error("any.invalid");
          }, "IP or Hostname validation")
          .required(),
        port: joi.number().integer().min(1).max(65535).required(),
        timeOut: joi.number().min(1).max(60)
      })
      .required(),
    interval: joi
      .number()
      .required()
      .when("intervalUnit", {
        is: "seconds",
        then: joi.number().min(20).max(59),
        otherwise: joi.number().min(1), // Diğer birimler için minimum 1 olabilir
      })
      .when("intervalUnit", {
        is: "minutes",
        then: joi.number().min(1).max(59),
      })
      .when("intervalUnit", {
        is: "hours",
        then: joi.number().min(1).max(23),
      }),
    intervalUnit: joi.string().valid("seconds", "minutes", "hours").required(),
    failCountRef: joi.number().min(1).required(),
  }),
};

const updateMonitor = {
  params: joi.object().keys({
    id: joi.string().required(),
  }),
  body: joi.object().keys({
    name: joi.string().required(),
    portMonitor: joi
      .object({
        host: joi
          .string()
          .custom((value, helpers) => {
            const ipSchema = joi.string().ip({ version: ["ipv4", "ipv6"] });
            const hostSchema = joi.string().hostname();
            const urlSchema = joi
                  .string()
                  .uri({
                    scheme: ['http', 'https'],
                    allowRelative: true,
                    allowQuerySquareBrackets: true,
                  });
            const isUrl =  !urlSchema.validate(value).error;
            const isIp = !ipSchema.validate(value).error;
            const isHost = !hostSchema.validate(value).error;

            if (isIp || isHost || isUrl) {
              return value;
            }

            return helpers.error("any.invalid");
          }, "IP or Hostname validation")
          .required(),
        port: joi.number().integer().min(1).max(65535).required(),
        timeOut: joi.number().min(1).max(60)
      })
      .required(),
    interval: joi
      .number()
      .required()
      .when("intervalUnit", {
        is: "seconds",
        then: joi.number().min(20).max(59),
        otherwise: joi.number().min(1), // Diğer birimler için minimum 1 olabilir
      })
      .when("intervalUnit", {
        is: "minutes",
        then: joi.number().min(1).max(59),
      })
      .when("intervalUnit", {
        is: "hours",
        then: joi.number().min(1).max(23),
      }),
    intervalUnit: joi.string().valid("seconds", "minutes", "hours").required(),
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
