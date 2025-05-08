/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const axios = require('axios');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Maintanance = require('../utils/database').maintanance;

/**
 * Create a user
 * @param {Object} monitorBody
 * @returns {Promise<User>}
 */

const createMaintanance = async (monitorId, monitorBody) => { 
  const maintananceData = Object.assign(monitorBody, { controlTime: monitorBody.startTime, monitorId: Number(monitorId), status: true });
  console.log("Create maintanance:",maintananceData);
  const maintanance = await Maintanance.create({ data: maintananceData }); 
  console.log("Maintanance created:",maintanance);
  return maintanance;
};

const getMaintananceById = async (maintanceId) => {
  let maintanance;
  try {
    maintanance = await Maintanance.findUnique({ where: { id: Number(maintanceId) } });
  }
  catch (error) {
    console.log("Error fetching maintanances:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching maintanances');
  }
  return maintanance;
}

const updateMaintananceById = async (maintananceId, updateBody) => {
  const maintanance = await getMaintananceById(maintananceId);
  if (!maintanance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bakım bulunamadı');
  }
  const newBody = updateBody;
  const maintananceData = Object.assign(newBody);
  const newMaintanance = await Maintanance.update({ where: { id: Number(maintananceId) }, data: maintananceData });
  return newMaintanance;
};

const deleteMaintananceById = async (maintananceId) => {
  const maintanance = await getMaintananceById(maintananceId);
  if (!maintanance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bakım bulunamadı');
  }
  await Maintanance.delete({ where: { id: Number(maintananceId) } });
  return maintanance;
};

const runMaintananceTask = async () => {
  let nowDate= new Date();
  nowDate.setSeconds(0);
  nowDate.setMilliseconds(0);
  const maintanance = await Maintanance.findMany({
    where:{
      controlTime: {
        lte: nowDate,
      },
      status: true,
    }
  });
  return maintanance;
}

module.exports = {
    createMaintanance,
    getMaintananceById,
    updateMaintananceById,
    deleteMaintananceById,
    runMaintananceTask,
};