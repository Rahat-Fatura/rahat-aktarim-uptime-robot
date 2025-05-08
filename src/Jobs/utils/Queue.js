const { Mutex } = require("async-mutex");
const mutex = new Mutex();
class Queue {
  constructor(array, customFunction, workerCount) {
    this.jobs = array || [];
    this.customFunction = customFunction || null;
    this.workerCount = workerCount || 1;
    this.counter =  0;
  }

  setJobs(jobs) {
    this.jobs = jobs;
    this.counter = jobs.length;
  }

  getJobs() {
    return this.jobs;
  }

  setFunction(customFunction) {
    this.customFunction = customFunction;
  }

  getFunction() {
    return this.customFunction.bind(this);
  }

  setWorkerCount(workerCount) {
    this.workerCount = workerCount;
  }

  getJobs() {
    return this.workerCount;
  }

  async addJobs(jobs) {
    if (this.jobs.length == 0) {
      this.jobs.push(...jobs);
      console.log("addJobs kiliti aldı !!!")
      this.criticalSection(jobs.length);
      console.log("Counter ",this.counter)
      console.log("addJobs kilidi bırakıyor ....");
      this.runJobs();
    } else {
      this.jobs.concat(jobs);
      console.log("addJobs kiliti aldı !!!")
      this.criticalSection(jobs.length);
      console.log("addJobs kilidi bırakıyor ....");
    }
  }

  async criticalSection(count){
    const release = await mutex.acquire();
    console.log("Kritik bölgeye girdi")
    try{
     this.counter=count
    }
    finally{
        console.log("Kritik bölgeden çıkdı")
      release();
    }

  }

  async runJobs() {
    console.log("Run Jobs çalışıyor .....")
    let worker = 0;
    if (this.jobs.length <= 0) {
      return;
    }
    if (this.jobs.length <= this.workerCount) {
      worker = this.counter;
    }
    let array = this.jobs.splice(0, worker);
    console.log("Hellloo",array.length);
    const run = Promise.allSettled(
      array.map(async (job) => {
        this.customFunction(job);
      })
    );
    console.log("RunJob Kritik bölgeye giriyor ....")
     this.criticalSection(this.jobs.length);
    console.log("RunJob Kritik bölgeden çıkyor ....")
    if (this.counter >= 1) {
      this.runJobs();
    }
  }
}

module.exports = Queue;
