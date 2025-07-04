const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, tokenService, emailService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const result = await userService.getUsersList();
  console.log(result);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId, req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendEmailAdmin = catchAsync(async (req, res)=>{
    const {name , email, message} = req.body;
    await emailService.sendEmail('<dovranovezberdiyev@gmail.com>','Tanatım Sayfasından Mesaj',
      `Kullanıcı adı:${name}
       Email:${email}
       Mesajı:${message}
      `
    )
    res.status(httpStatus.NO_CONTENT).send();
})

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  sendEmailAdmin,
};
