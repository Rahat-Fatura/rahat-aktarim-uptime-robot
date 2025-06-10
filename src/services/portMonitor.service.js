const monitorService = require("./").monitorService
const PortMonitor = require("../utils/database").portMonitor
const { port } = require("../config/config");
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createPortMonitor = async(monitorBody,user) => {
  let portMonitor;
  let monitor;
  const body = {
    name: monitorBody.name,
    monitorType: 'PortMonitor',
    interval: monitorBody.interval,
    intervalUnit: monitorBody.intervalUnit
  }
  portMonitor = await PortMonitor.findFirst({
    where:{
      AND:[
        {
          host: monitorBody.portMonitor.host,
        },
        {
          userId: user.id
        },
        {
          port: monitorBody.portMonitor.port
        }
      ]
    }
  })
  if(portMonitor){
    throw new ApiError(httpStatus.BAD_REQUEST, 'host adres daha önce alınmış');
  }
  monitor = await monitorService.createMonitor(body,user);
  try{
    portMonitor = await PortMonitor.create({
        data:{
            id: monitor.id,
            host: monitorBody.portMonitor.host,
            port: monitorBody.portMonitor.port,
            timeOut: monitorBody.portMonitor.timeOut,
            userId: user.id,
        }
    })
  }
  catch(error){
    console.log(error)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Port Monitor oluşturlurken hata oluştu !');
  }
  
  return monitor;
}

const getPortMonitorById = async(id) =>{
  let monitor;
   try{
      monitor = await PortMonitor.findUnique({ where:{
      id: Number(id)
     }})
   }
   catch(error){
    console.log(error)
   }
   return monitor;
} 

const getPortMonitorFullDataById = async(id) =>{
  let monitor;
   try{
      monitor = await PortMonitor.findUnique({ where:{
        id: Number(id)
      },
      select: {
        host: true,
        port: true,
        timeOut: true,
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

const updatePortMonitorById = async(id, updateData) => {
  const portBody = updateData.portMonitor;
  delete updateData.portMonitor;
  const monitorBody = updateData;
  let monitor;
  let portMonitor = await getPortMonitorById(id);
  if(!portMonitor){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Ping Monitor can not find !');
  }
  try{
    portMonitor = await PortMonitor.update({ where: { id: Number(id) }, data: portBody })
    monitor = await monitorService.updateMonitorById(id,monitorBody);
  }
  catch(error){
    console.log(error)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unsuccess update Monitor !');
  }
  return portMonitor;
}

module.exports={
    createPortMonitor,
    updatePortMonitorById,
    getPortMonitorById,
    getPortMonitorFullDataById
}