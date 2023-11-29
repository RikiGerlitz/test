const jwt = require("jsonwebtoken")
const {config} = require("../config/secret")

exports.auth = async (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        return res.status(401).json({ msg: "You need to send token to this endpoint url" })
    }
    try {

        let tokenData = jwt.verify(token, "RikiSecret");
        console.log(tokenData);
        req.tokenData = tokenData

        next()
    }
    catch (err) {
        return res.status(401).json({ msg: "Token not valid or expired" })
    }

}

exports.authAdmin = async (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        return res.status(401).json({ msg: "You need to send token to this endpoint url" })
    }
    try {

        let tokenData = jwt.verify(token, config.tokenSecret);
        console.log(tokenData);
        if(tokenData.role != "admin"){
            return res.status(401).json({msg:"Token invalid or expired, code: 6A"})
          }
        req.tokenData = tokenData

        next()
    }
    catch (err) {
        return res.status(401).json({ msg: "Token not valid or expired" })
    }

}