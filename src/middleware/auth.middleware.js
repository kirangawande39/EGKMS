const { verifyAccessToken } = require("../utils/jwt");


const authMiddleware = (req,res,next)=>{

    try {

        const token = req.cookies?.accessToken;


        if(!token){

            return res.status(401).json({

                success:false,
                message:"Authentication required. Please login."

            });

        }


        const decoded = verifyAccessToken(token);


        req.user = decoded;


        next();


    }
    catch(error){

        return res.status(401).json({

            success:false,
            message:"Invalid or expired token"

        });

    }

};


module.exports = authMiddleware;