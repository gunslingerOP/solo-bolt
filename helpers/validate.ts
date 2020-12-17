

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

static login = (must = true)=>({
  email:{
    presence:must,
    type:"string"
  }
})
}