const bcrypt = require("bcrypt");
const Encrypter = require("./encrypter");
const MissingParamError = require("../errors/missing-param-error");

const makeSut = () => {
  return new Encrypter();
};

describe("Encrypter", () => {
  test("Should return true if bcrypt returns true", async () => {
    const sut = makeSut();
    const isValid = await sut.compare("any_value", "hashed_value");

    expect(isValid).toBeTruthy();
  });

  test("Should return false if bcrypt returns false", async () => {
    const sut = makeSut();
    bcrypt.isValid = false;
    const isValid = await sut.compare("any_value", "hashed_value");

    expect(isValid).toBeFalsy();
  });

  test("Should call bcrypt with correct values", async () => {
    const sut = makeSut();
    await sut.compare("any_value", "hashed_value");

    expect(bcrypt.value).toBe("any_value");
    expect(bcrypt.hash).toBe("hashed_value");
  });

  test("Should throw if no params are provided", async () => {
    const sut = makeSut();

    expect(sut.compare()).rejects.toThrow(new MissingParamError("value"));
    expect(sut.compare("my_value")).rejects.toThrow(
      new MissingParamError("hash")
    );
  });
});
