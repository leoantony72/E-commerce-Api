const {
  winston,
  createLogger,
  format,
  transports,
  config,
} = require("winston");

export const transactionLogger = {
  transports: [
    new transports.File({
      filename: "./logs/err.log",
    }),
  ],
  format: format.combine(
    format.label({
      label: `Label🏷️`,
    }),
    format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    format.printf(
      (info: any) =>
        `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  ),
};
const logger = createLogger(transactionLogger);

module.exports = {
  transactionLogger: logger,
};
