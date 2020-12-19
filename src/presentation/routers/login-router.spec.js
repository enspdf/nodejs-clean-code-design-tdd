const LoginRouter = require("./login-router");
const { UnauthorizedError, ServerError } = require("../errors");
const { InvalidParamError, MissingParamError } = require("../../utils/errors");

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase();
  const emailValidatorSpy = makeEmailValidator();

  authUseCaseSpy.accessToken = "valid_token";

  const sut = new LoginRouter({
    authUseCase: authUseCaseSpy,
    emailValidator: emailValidatorSpy,
  });

  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy,
  };
};

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid(email) {
      this.email = email;

      return this.isEmailValid;
    }
  }

  const emailValidatorSpy = new EmailValidatorSpy();
  emailValidatorSpy.isEmailValid = true;

  return emailValidatorSpy;
};

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    async isValid() {
      throw new Error();
    }
  }

  return new EmailValidatorSpy();
};

const makeAuthUseCase = () => {
  class AuthUseCase {
    async auth(email, password) {
      this.email = email;
      this.password = password;

      return this.accessToken;
    }
  }

  return new AuthUseCase();
};

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth() {
      throw new Error();
    }
  }

  return new AuthUseCaseSpy();
};

describe("Login Router", () => {
  test("Should return 400 if email is not provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if password is not provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        email: "any_email@email.com",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 500 if httpRequest is not provided", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route();

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no body", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route({});

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call AuthUseCase with correct params", async () => {
    const { sut, authUseCaseSpy } = makeSut();

    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);

    expect(authUseCaseSpy.email).toBe(httpRequest.body.email);
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password);
  });

  test("Should return 401 when invalid credentials are provided", async () => {
    const { sut, authUseCaseSpy } = makeSut();

    authUseCaseSpy.accessToken = null;

    const httpRequest = {
      body: {
        email: "invalid_email@mail.com",
        password: "invalid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual(new UnauthorizedError());
  });

  test("Should return 200 when valid credentials are provided", async () => {
    const { sut, authUseCaseSpy } = makeSut();

    const httpRequest = {
      body: {
        email: "valid_email@mail.com",
        password: "valid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken);
  });

  test("Should return 500 when the AuthUseCase is provided", async () => {
    const sut = new LoginRouter();

    const httpRequst = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequst);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return  500 if AuthUseCase has no auth method", async () => {
    const sut = new LoginRouter({});

    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return  500 if AuthUseCase throws", async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError();

    const sut = new LoginRouter({ authUseCase: authUseCaseSpy });

    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 400 if an invalid email is provided", async () => {
    const { sut, emailValidatorSpy } = makeSut();

    emailValidatorSpy.isEmailValid = false;

    const httpRequest = {
      body: {
        email: "invalid_email@mail.com",
        password: "invalid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });

  test("Should return 500 if no EmailValidator is provided", async () => {
    const authUseCaseSpy = makeAuthUseCase();
    const sut = new LoginRouter({ authUseCase: authUseCaseSpy });

    const httpRequest = {
      body: {
        email: "invalid_email@mail.com",
        password: "invalid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if EmailValidator doesnt have isInvalid method", async () => {
    const authUseCaseSpy = makeAuthUseCase();
    const sut = new LoginRouter({ authUseCase: authUseCaseSpy });

    const httpRequest = {
      body: {
        email: "invalid_email@mail.com",
        password: "invalid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return  500 if EmailValidator throws", async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError();
    const emailValidatorSpy = makeEmailValidatorWithError();

    const sut = new LoginRouter({
      authUseCase: authUseCaseSpy,
      emailValidator: emailValidatorSpy,
    });

    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
  });

  test("Should call EmailValidator with correct email", async () => {
    const { sut, emailValidatorSpy } = makeSut();

    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);

    expect(emailValidatorSpy.email).toBe(httpRequest.body.email);
  });
});
