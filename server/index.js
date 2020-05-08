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

// streaming cient API
function longGreet(call, cb) {
  call.on('data', (req) => {
    const fullname =
      req.getGreet().getFirstName() + ' ' + req.getGreet().getLastName()
    console.log('Hello ', fullname)
  })

  call.on('error', (err) => {
    console.log(err)
  })

  call.on('end', () => {
    const res = new greets.LongGreetResponse()
    res.setResult('Long Greet response end')
    cb(null, res)
  })
}

const sleep = async () =>
  new Promise((resolve) => setTimeout(() => resolve(), 1000))

// streaming bi-directional
async function greetEveryone(call, cb) {
  call.on('data', (res) => {
    const fullname =
      res.getGreet().getFirstName() + ' ' + res.getGreet().getLastName()
    console.log('bidirectional fullname is ', fullname)
  })

  call.on('error', (err) => console.log(err))
  call.on('end', () => console.log('Bi-directional streaming ends..'))

  for (let i = 0; i < 10; i++) {
    const greeting = new greets.Greeting()
    greeting.setFirstName('Drake')
    greeting.setLastName('Cool')

    const req = new greets.GreetEveryoneRequest()
    req.setGreet(greeting)

    call.write(req)
    await sleep(1000)
  }
  call.end()
}

const main = (params) => {
  const server = new grpc.Server()

  server.addService(service.GreetServiceService, {
    greet,
    greetManyTimes,
    longGreet,
    // greetEveryone,
  })

  const address = '127.0.0.1:50051'
  server.bind(address, grpc.ServerCredentials.createInsecure())
  server.start()

  console.log(`Server is running on ${address}`)
}

main()
