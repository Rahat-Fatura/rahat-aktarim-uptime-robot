const { maintananceService, monitorService } = require("../../services");

const maintananceTask = async(maintanance) => {
  console.log(new Date(maintanance.startTime).getTime());
  console.log( new Date(maintanance.controlTime).getTime())
  console.log(new Date(maintanance.startTime).getTime() === new Date(maintanance.controlTime).getTime())
  console.log(new Date(maintanance.startTime) === new Date(maintanance.controlTime))
  
  if (new Date(maintanance.endTime).getTime() <= new Date().getTime()) {
    console.log("ENSON GELİP BİTEN YERİ")
    await maintananceService.updateMaintananceById(maintanance.id, {
      controlTime: maintanance.startTime,
      status: false,
    });
    await monitorService.updateMonitorById(maintanance.id, {
      status: "uncertain",
      isProcess: false,
    });
    
  } 
  else {
    if (
      maintanance.status &&
      new Date(maintanance.controlTime).getTime() == new Date(maintanance.endTime).getTime()
    ) {
      console.log("iKİNCİ GELMELEİ YERİ")
      await maintananceService.updateMaintananceById(maintanance.id, {
        controlTime: maintanance.startTime,
        status: false,
      });
      await monitorService.updateMonitorById(maintanance.id, {
        status: "uncertain",
        isProcess: false,
      });
    }
    if (
      maintanance.status &&
      new Date(maintanance.startTime).getTime() == new Date(maintanance.controlTime).getTime()
    ) {
      console.log("ilkBURYA GELDE EJ NEJN EJNEJ N")
      await maintananceService.updateMaintananceById(maintanance.id, {
        status: true,
        controlTime: maintanance.endTime,
      });
      await monitorService.updateMonitorById(maintanance.id, {
        status: "maintanance",
        isProcess: true,
      });
    }
  }
};

module.exports = {
  maintananceTask,
};
