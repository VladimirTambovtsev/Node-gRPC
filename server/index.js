const grpc = require('grpc')

const greets = require('../server/protos/greet_pb')
const service = require('../server/protos/greet_grpc_pb')

// greet RPC method
function greet(call, cb) {
  const greeting = new greets.GreetingResponse()
  greeting.setResult('Hello ' + call.request.getGreeting().getFirstName())

  cb(null, greeting)
}

// streaming server API
function greetManyTimes(call, cb) {
  const firstname = call.request.getGreeting().getFirstName()

  let count = 0,
    intervalID = setInterval(() => {
      const greetManyTimesRes = new greets.GreetManyTimesResponse()
      greetManyTimesRes.setResult(firstname)

      // set streaming
      call.write(greetManyTimesRes)
      if (++count > 9) {
        clearInterval(intervalID)
        call.end()
      }
    }, 1000)
}

const main = (params) => {
  const server = new grpc.Server()

  server.addService(service.GreetServiceService, { greet, greetManyTimes })

  const address = '127.0.0.1:50051'
  server.bind(address, grpc.ServerCredentials.createInsecure())
  server.start()

  console.log(`Server is running on ${address}`)
}

main()
