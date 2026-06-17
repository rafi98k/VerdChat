const path = require('path');
const jwt=  require('jsonwebtoken');
const z = require('zod');
const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

const registerSchema = z.object({
	username: z.string(),
  email: z.string().email(),
	password:z.string(),
	password_confirm:z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

//Register

const Register = async(req,res)=>{
	const form = registerSchema.safeParse(req.body);
	if(!form.success)
			return res.status(400).json({Form_Error :form.error.flatten()});
	const {username,email,password,password_confirm} = form.data;
	if(password !== password_confirm)
			return res.status(400).json({Form_Error: "Passwords don't match"});
	
	//Check email and username
	const existing = await prisma.user.findFirst({
	  where: { OR: [{ email }, { username }] },
	});
	if (existing) {
	  return res.status(400).json({
	    Taken: existing.email === email ? "Email already in use" : "Username already in use",
	  });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
  const record = await prisma.user.create({
    data: {
      username : username,
      email: email,
      password: hashedPassword,
    },
  	});

  const token = jwt.sign(
  {id : record.id ,username : record.username }, 
  process.env.JWT_ACCESS_SECRET , { expiresIn: '4h' } ) ; 

  res.cookie("token", token,{
     maxAge: 4*60*60*1000, 
     httpOnly: true,
  });
  
  return res.status(201).json({success : "User created successfully"});
}






//Login 


const Login = async (req,res)=>{

	const form = loginSchema.safeParse(req.body);

	if(!form.success)
		return res.status(400).json( { "error" : form.error.flatten() } );

	const {email,password} = form.data;
	const record = await prisma.user.findUnique({where:{email}});

	if(!record)
		return res.status(401).json({message : "Invalid credentials"});

	const isMatch =await bcrypt.compare(password , record.password);

	if(!isMatch)
		return res.status(401).json({message : "Invalid credentials"});

	

		const payload = {
			id :record.id,
			username: record.username,
		};
		const token = jwt.sign(payload,process.env.JWT_ACCESS_SECRET, { expiresIn: '5h' });

		res.cookie('token',token, {
        maxAge: 5*60*60*1000, 
        httpOnly: true,
		}) ;
		
		return res.status(200).json({Message : "Logged in successfully"});

		
	};

const Logout = (req,res)=>{
	res.clearCookie("token");
	return res.json({ message: 'Logged out' });

	};
 
 const getMe = (req,res)=>{
 	const obj =  req.user ; 
 	res.json ({id:obj.id, username: obj.username});
 };

module.exports = {Register,Login , Logout , getMe};


