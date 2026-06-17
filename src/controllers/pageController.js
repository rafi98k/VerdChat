const path = require('path');

const showRegister = (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/register.html'));
};
const showLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/login.html'));
};

const showMain = (req,res)=>{
  res.sendFile(path.join(__dirname, '../../views/chat.html'));
};

module.exports = {showRegister,showLogin,showMain};
