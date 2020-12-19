describe("Index", () => {
  test("Should call app listen", () => {
    jest.mock("./config/app", () => ({
      listen(port, callback) {
        if (callback) {
          callback();
        }
      },
    }));

    const mock = jest.requireMock("./config/app");
    const listen = jest.spyOn(mock, "listen");

    require("./index");

    expect(listen).toHaveBeenCalledTimes(1);
  });
});
