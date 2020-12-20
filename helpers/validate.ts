

export default class validator {
static register = (must = true)=>({
    name: {
        presence: must,
        type: "string",
      },
      email: {
        presence: must,
        type: "string",
      },
      password: {
        presence: must,
        type: "string",
      },
})

static verify = (must = true)=>({
  otp:{
    presence:must,
    type:"string"
  }
})

static board = (must = true)=>({
  private:{
    presence:must,
    type:"boolean"
  },
  name:{
    presence:must,
    type:"string"
  }
})

static login = (must = true)=>({
  email:{
    presence:must,
    type:"string"
  }
})

static plan = (must = true)=>({
  name:{
    presence:must,
    type:"string"
  },
  price:{
    presence:must,
    type:"string"
  },
  boards:{
    presence:must,
    type:"number"
  },
  makePrivate:{
    presence:must,
    type:"boolean"
  }
})
}