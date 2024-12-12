class apiError extends Error {
  constructor(
    statusCode,
    massage = "Somethis went wrong !",
    errors = [],
    stack
  ) {
    super(massage);
    this.massage = massage;
    this.statusCode = statusCode;
    this.data=null
    this.success=false
    this.errors=errors

    if(stack){
      this.stack=stack
    }
    else{
      Error.captureStackTrace(this,this.consturctor)
    }
  }
}



export{apiError}