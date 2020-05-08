const grpc = require('grpc')

const greets = require('../server/protos/greet_pb')
const service = require('../server/protos/greet_grpc_pb')

function callGreetings() {
  const address = 'localhost:50051'
  const client = new service.GreetServiceClient(
    address,
    grpc.credentials.createInsecure()
  )

  const req = new greets.GreetingRequest()
  const greeting = new greets.Greeting()
  greeting.setFirstName('Vladimir')
  greeting.setLastName('T')

  req.setGreeting(greeting)
  client.greet(req, (err, res) => {
    if (!err) {
      console.log(`Greeting response ${res.getResult()}`)
    } else {
      console.log(`Error: ${err}`)
    }
  })
}

function callGreetManyTimes() {
  const address = 'localhost:50051'
  const client = new service.GreetServiceClient(
    address,
    grpc.credentials.createInsecure()
  )

  const req = new greets.GreetManyTimesRequest()

  const greeting = new greets.Greeting()
  greeting.setFirstName('John')
  greeting.setLastName('Doe')

  req.setGreeting(greeting)

  const call = client.greetManyTimes(req, () => {})
  call.on('data', (res) => {
    console.log('Client streaming response: ' + res.getResult())
  })

  call.on('status', (status) => {
    console.log(status)
  })

  call.on('error', (err) => {
    console.log(err)
  })

  call.on('end', (err) => {
    console.log('Streaming end')
  })
}

const main = () => {
  callGreetings()
  callGreetManyTimes()
}
main()
