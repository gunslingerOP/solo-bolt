import validate = require("validate.js")
import validator from "../helpers/validate"
import { Plan } from "../src/entity/plan"

export default class adminController{
    static addPlan= async (ctx)=>{
        try {
            let notvalid = validate(ctx.request.body, validator.plan())
            if (notvalid) throw{message:notvalid}
            let plan
            
            plan = await Plan.create({
               ...ctx.request.body
            })

            ctx.body={
                status:`success`,
                data:plan
            }
        } catch (error) {
            ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
        }
    }
}