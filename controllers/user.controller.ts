export default class userController {
  static login = async (ctx: any) => {
    try {
        
      ctx.body = {
        status: "success",
        data: `It works`,
      };
      throw { message: `Bla bla bla` };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: "Failed",
        data: error,
      };
    }
  };
}
