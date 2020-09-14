Error.stackTraceLimit = 100
setTimeout(() => {}).__proto__.unref = () => {}
console.log('starting render window:', new Date().toISOString());

const Store = require('electron-store')
global.storage = new Store()


require('./app')

process.on('uncaughtException', (e)=>{
  console.log(`e:`, e)
})
