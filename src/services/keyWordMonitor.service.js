const monitorService = require("./").monitorService
const KeyWordMonitor = require("../utils/database").keyWordMonitor
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const he = require('he');

const createKeyWordMonitor = async(monitorBody,userId) =>{
  let keyWordMonitor;
  let monitor;
  const body = {
    name: monitorBody.name,
    monitorType: 'KeywordMonitor',
    interval: monitorBody.interval,
    intervalUnit: monitorBody.intervalUnit,
    failCount: monitorBody.failCountRef,
    failCountRef: monitorBody.failCountRef,
  }
  keyWordMonitor = await KeyWordMonitor.findFirst({
    where:{
      AND:[
        {
          host: monitorBody.keyWordMonitor.host,
        },
        {
          userId: Number(userId)
        },
        {
          method: monitorBody.keyWordMonitor.method
        }
      ]
    }
  })
  if(keyWordMonitor){
    throw new ApiError(httpStatus.BAD_REQUEST, 'host adresi daha önce alınmış');
  }
  monitor = await monitorService.createMonitor(body,userId);
  try{
    keyWordMonitor = await KeyWordMonitor.create({
      data:{
        id: monitor.id,
        host: monitorBody.keyWordMonitor.host,
        method: monitorBody.keyWordMonitor.method,
        body: monitorBody.keyWordMonitor.body,
        headers: monitorBody.keyWordMonitor.headers,
        allowedStatusCodes: monitorBody.keyWordMonitor.allowedStatusCodes,
        keyWordType: monitorBody.keyWordMonitor.keyWordType,
        keyWord: monitorBody.keyWordMonitor.keyWord,
        timeOut: monitorBody.keyWordMonitor.timeOut || 30,
        slowResponseAlertStatus: monitorBody.keyWordMonitor.slowResponseAlertStatus,
        slowResponseAlertValue: monitorBody.keyWordMonitor.slowResponseAlertValue,
        userId: Number(userId),
      }
    })
  }
  catch(error){
    throw new ApiError(httpStatus.BAD_REQUEST, 'host adres daha önce alınmış');
    console.log(error)
  }
  
  return monitor;
}

const getKeyWordMonitorById = async(id) =>{
  let monitor;
   try{
      monitor = await KeyWordMonitor.findUnique({ where:{
      id: Number(id)
     }})
   }
   catch(error){
    console.log(error)
   }
   return monitor;
} 

const getKeyWordMonitorFullDataById = async(id) =>{
  let monitor;
   try{
      monitor = await KeyWordMonitor.findUnique({ where:{
        id: Number(id)
      },
      select: {
        id: true,
        host: true,
        method: true,
        body: true,
        headers: true,
        timeOut: true,
        allowedStatusCodes: true,
        keyWordType: true,
        keyWord: true,
        monitor: {
          select: {
            name: true,
            interval: true,
            intervalUnit: true,
            failCountRef: true,
            notifications: {
              select: {
                emails: true,
              }
            },
          }
        },
      }
     })
   }
   catch(error){
    console.log(error)
   }
   console.log(monitor)
   return monitor;
}

const updateKeyWordMonitorById = async(id, updateData) => {
   let keyWordBody = updateData.keyWordMonitor;
   delete updateData.keyWordMonitor;
   updateData.failCount = updateData.failCountRef;
   const monitorBody = updateData;
   let keyWordMonitor = await getKeyWordMonitorById(id);
   if(!keyWordMonitor){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Http Monitor can not find !');
    }
  try{
    keyWordMonitor = await KeyWordMonitor.update({ where: { id: Number(id) }, data: keyWordBody })
    await monitorService.updateMonitorById(id,monitorBody);
  }
  catch(error){  
    console.log(error)
   throw new ApiError(httpStatus.BAD_REQUEST, 'Unsuccess update Monitor !');
  }
  return keyWordMonitor;
}

module.exports={
    createKeyWordMonitor,
    updateKeyWordMonitorById,
    getKeyWordMonitorById,
    getKeyWordMonitorFullDataById,
}