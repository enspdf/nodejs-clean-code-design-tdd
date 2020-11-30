const LoginRouter = require("./login-router");
const MissingParamError = require("../helpers/missing-param-error");

describe("Login Router", () => {
  test("Should return 400 if email is not provided", () => {
    const login = new LoginRouter();

    const httpRequest = {
      body: {
        password: "any_password",
      },
    };

    const httpResponse = login.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if password is not provided", () => {
    const login = new LoginRouter();

    const httpRequest = {
      body: {
        email: "any_email@email.com",
      },
    };

    const httpResponse = login.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 500 if httpRequest is not provided", () => {
    const login = new LoginRouter();

    const httpResponse = login.route();

    expect(httpResponse.statusCode).toBe(500);
  });

  test("Should return 500 if httpRequest has no body", () => {
    const login = new LoginRouter();

    const httpResponse = login.route({});

    expect(httpResponse.statusCode).toBe(500);
  });
});
