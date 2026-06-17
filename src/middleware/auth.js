const jwt = require('jsonwebtoken');


const authenticate = (req,res,next)=>{
	const token = req.cookies.token;
	

	if(!token)
		return res.status(401).json({message : "Unauthorized - No token"});

	try{
		const decoded = jwt.verify(token , process.env.JWT_ACCESS_SECRET);
		req.user = decoded;
		next();
	}
	catch(err){
		return res.status(401).json({message : "Unauthorized - Invalid or expired token"});
	}
}



module.exports = { authenticate };



