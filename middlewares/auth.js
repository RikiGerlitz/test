const jwt = require("jsonwebtoken")

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