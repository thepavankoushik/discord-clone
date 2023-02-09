const jwt = require("jsonwebtoken");

const config = process.env;

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  // const token = socket.handshake.auth.token;

  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    socket.user = decoded;
  } catch (err) {
    const socketError = new Error("NOT_AUTHORIZED");
    return next(socketError); // this call the response middleware directly. So if the user is not validated then the error response is sent to the client
  }

  next();
};

module.exports = verifyTokenSocket;
