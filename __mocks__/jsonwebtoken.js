module.exports = {
  token: "any_id",
  id: "",
  secret: "",
  sign(id, secret) {
    this.id = id;
    this.secret = secret;

    return this.token;
  },
};
