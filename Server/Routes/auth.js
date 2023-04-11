const nodemailer = require("nodemailer");

import User from "../Models/UserModel.js";

// Khởi tạo một transporter để gửi email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mtnbeauty.site@gmail.com",
        pass: "wuktirxxbfqayeho",
    },
});

// Xử lý yêu cầu khi người dùng nhấn vào nút "Quên mật khẩu"
userRouter.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    // Tìm người dùng theo email trong cơ sở dữ liệu MongoDB
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(404)
            .json({ message: "Địa chỉ email không tồn tại." });
    }
    // Tạo mã xác nhận và lưu vào cơ sở dữ liệu MongoDB
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Mã xác nhận có hiệu lực trong 1 giờ
    await user.save();
    // Gửi email chứa link đến trang đặt lại mật khẩu
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const mailOptions = {
        from: "mtnbeauty.site@gmail.com",
        to: email,
        subject: "Xác nhận đặt lại mật khẩu",
        text:
            `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản ${email}.\n\n` +
            `Vui lòng truy cập vào đường dẫn sau để đặt lại mật khẩu:\n\n` +
            `${resetLink}\n\n` +
            `Nếu bạn không yêu cầu đặt lạị mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không bị thay đổi.`,
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Đã có lỗi xảy ra khi gửi email xác nhận." });
        }
        return res.json({
            message: "Email xác nhận đã được gửi đến địa chỉ email của bạn.",
        });
    });
});
// Xử lý yêu cầu khi người dùng truy cập vào trang đặt lại mật khẩu
userRouter.get("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    // Tìm người dùng theo mã xác nhận trong cơ sở dữ liệu MongoDB
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res.status(404).json({
            message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        });
    }
    // Cập nhật mật khẩu mới cho người dùng
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    // Gửi email thông báo đặt lại mật khẩu thành công
    const mailOptions = {
        from: "mtnbeauty.site@gmail.com",
        to: user.email,
        subject: "Đặt lại mật khẩu thành công",
        text:
            `Xin chào ${user.username},\n\n` +
            `Mật khẩu của tài khoản ${user.email} đã được thay đổi thành công.\n` +
            `Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.`,
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Đã có lỗi xảy ra khi gửi email thông báo." });
        }
        return res.json({
            message:
                "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.",
        });
    });
});
export default ForgotPassword;
