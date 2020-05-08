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

function callLongGreeting() {
  const address = 'localhost:50051'
  const client = new service.GreetServiceClient(
    address,
    grpc.credentials.createInsecure()
  )

  const req = new greets.LongGreetRequest()
  const call = client.longGreet(req, (err, res) => {
    if (!err) {
      console.log('Server response: ', res.getResult())
    } else {
      console.log(err)
    }
  })
  let count = 0,
    intervalID = setInterval(() => {
      console.log('Sending message ', count)
      const res = new greets.LongGreetRequest()
      const greeting = new greets.Greeting()
      greeting.setFirstName('Paulo')
      greeting.setLastName('Brown')

      req.setGreet(greeting)
      call.write(req)

      if (++count > 3) {
        clearInterval(intervalID)
        call.end()
      }
    }, 1000)
}

const sleep = async () =>
  new Promise((resolve) => setTimeout(() => resolve(), 1000))

async function callBiDirect() {
  const address = 'localhost:50051'
  const client = new service.GreetServiceClient(
    address,
    grpc.credentials.createInsecure()
  )

  const call = client.greetEveryone(_, (err, res) => {
    console.log('Server response: ', res)
  })

  call.on('data', (res) => {
    console.log('Hello bidirect: ', res.getResult())
  })

  call.on('error', (err) => console.log(err))
  call.on('end', () => console.log('Bidirect Streams end'))

  for (let i = 0; i < 10; i++) {
    const greeting = new greets.Greeting()
    greeting.setFirstName('Steve')
    greeting.setLastName('Jobs')

    const req = new greets.GreetEveryoneRequest()
    req.setGreet(greeting)

    call.write(req)

    await sleep(1000)
  }
  call.end()
}

const main = () => {
  callGreetings()
  callGreetManyTimes()
  callLongGreeting()
  // callBiDirect()
}
main()
