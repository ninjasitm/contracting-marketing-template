export const createTransport = () => ({
  sendMail: () => Promise.resolve({}),
});

export default { createTransport };
