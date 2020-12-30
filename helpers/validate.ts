

export default class validator {
static register = (must = true)=>({
    name: {
        presence: must,
        type: "string",
      },
      email: {
        type: "string",
      },
      phone: {
        type: "string",
      }
})

static verify = (must = true)=>({
  otp:{
    presence:must,
    type:"string"
  }
})

static addEmail=(must= true)=>({
  email:{
    presence:must,
    type:"string"
  }
})

static verifyCredentials = (must = true)=>({
  otp:{
    presence:must,
    type:"string"
  },
  email:{
    type:"string"
  },
  phone:{
    type:"string"
  }
})

static changeCredentials = (must = true)=>({
  newEmail:{
    type:"string"
  },
  newPhone:{
    type:"string"
  }
})

static followBoard = (must = true)=>({
  boardId:{
    presence:must,
    type:"number"
  }
})

static url = (must = true)=>({
  url:{
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
    type:"string"
  },
  phone:{
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

static thread = (must = true)=>({

  location:{
    type:"string"
  },
  domElement:{
    type:"string"
  },
  text:{
    presence:must,
    type:"string"
  }

})

static comment = (must = true)=>({

  text:{
    presence:must,
    type:"string"
  }

})

static setComment = (must = true)=>({

  state:{
   presence:must,
    type:"string"
  }

})

static access = (must = true)=>({

  userEmail:{
    presence:must,
    type:"string"
  }
})

static accessRemove = (must = true)=>({
  action:{
    presence:must,
    type:"string"
  }
})
}