const monitorService = require("./").monitorService
const PingMonitor = require("../utils/database").pingMonitor
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createPingMonitor = async(monitorBody,user) => {
  let pingMonitor;
  let monitor;
  const body = {
    name: monitorBody.name,
    monitorType: 'PingMonitor',
    interval: monitorBody.interval,
    intervalUnit: monitorBody.intervalUnit
  }
  pingMonitor = await PingMonitor.findFirst({
    where:{
      AND:[
        {
          host: monitorBody.pingMonitor.host,
        },
        {
          userId: user.id
        }
      ]
    }
  })
  if(pingMonitor){
    throw new ApiError(httpStatus.BAD_REQUEST, 'host adres daha önce alınmış');
  }
  monitor = await monitorService.createMonitor(body,user);
  try{
    pingMonitor = await PingMonitor.create({
        data:{
            id: monitor.id,
            host: monitorBody.pingMonitor.host,
            userId: user.id,
        }
    })
  }
  catch(error){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Ping Monitor oluşturlurken hata oluştu !');
  }
  
  return monitor;
}

const getPingMonitorById = async(id) =>{
  let monitor;
   try{
      monitor = await PingMonitor.findUnique({ where:{
      id: Number(id)
     }})
   }
   catch(error){
    console.log(error)
   }
   return monitor;
} 

const updatePingMonitorById = async(id, updateData) => {
  const pingBody = updateData.pingMonitor;
  delete updateData.pingMonitor;
  const monitorBody = updateData;
  let monitor;
  let pingMonitor = await getPingMonitorById(id);
  if(!pingMonitor){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Ping Monitor can not find !');
  }
  try{
    pingMonitor = await PingMonitor.update({ where: { id: Number(id) }, data: pingBody })
    monitor = await monitorService.updateMonitorById(id,monitorBody);
  }
  catch(error){
    console.log(error)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unsuccess update Monitor !');
  }
  return pingMonitor;
}

const getPingMonitorFullDataById = async(id) =>{
  let monitor;
   try{
      monitor = await PingMonitor.findUnique({ where:{
        id: Number(id)
      },
      select: {
        host: true,
        monitor: {
          select: {
            name: true,
            interval: true,
            intervalUnit: true,
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


module.exports={
    createPingMonitor,
    updatePingMonitorById,
    getPingMonitorById,
    getPingMonitorFullDataById
}