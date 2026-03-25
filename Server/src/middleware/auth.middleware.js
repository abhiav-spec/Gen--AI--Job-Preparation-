const jwt = require("jsonwebtoken")
const sessionmodel = require("../models/session.model")



async function authUser(req, res, next) {

    const Acess = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await sessionmodel.findOne({
        token
    })

    if (isTokenBlacklisted.revoked==true) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}


module.exports = { authUser }