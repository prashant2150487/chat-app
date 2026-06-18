import { transporter } from "../config/email.js"
import { ENV } from "../config/env.js";




export const sendEmail=async (to, subject, html)=>{
    return transporter.sendMail({
        from:ENV.SMTP_FROM,
        to,
        subject,
        html,
    })
}
