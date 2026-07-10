import { getMeService, loginService, registerUser, verifyOtpService } from "../services/authService.js";

export const register = async (req, res, next) => {
    try {
        const { user } = await registerUser(req.body);
        return res.status(201).json({
            success: true,
            data: user,
        })
    } catch (err) {
        console.error("errr", err);
        next(err)
    }
}

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const { user } = await verifyOtpService(email, otp);
        return res.status(200).json({
            success: true,
            message: "Otp verified sucessfully",
            data: user

        })

    } catch (err) {
        console.error("errr", err);
        next(err)

    }
}
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const { token, refreshToken, user } = await loginService(email, password)
        return res.status(200).json({
            success: true,
            message: "Login sucessfully",
            token,
            refreshToken,
            user
        })

    } catch (err) {
        console.error("errr", err)
        next(err)
    }
}

export const getMe = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await getMeService(id);
        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        console.error("errr", err);
        next(err);
    }
};

