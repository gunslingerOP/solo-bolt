var validate = require("validate.js");


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
}