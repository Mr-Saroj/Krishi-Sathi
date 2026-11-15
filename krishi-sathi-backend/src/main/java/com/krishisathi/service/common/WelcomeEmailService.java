
package com.krishisathi.service.common;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class WelcomeEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public WelcomeEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(WelcomeEmailMessage message)
            throws Exception {

        MimeMessage mimeMessage = mailSender.createMimeMessage();

        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage, true, "UTF-8"
        );

        helper.setFrom(fromEmail);
        helper.setTo(message.recipient());
        helper.setSubject("Welcome to Krishi Sathi AI! 🌱");

        String safeName = HtmlUtils.htmlEscape(message.fullName());

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0;
                    background-color:#f3f7f2;
                    font-family:Arial,Helvetica,sans-serif;">

                    <table width="100%%" cellpadding="0"
                        cellspacing="0" border="0"
                        style="background-color:#f3f7f2;
                        padding:30px 10px;">

                        <tr>
                            <td align="center">

                                <table width="600"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="max-width:600px;
                                    background:#ffffff;
                                    border-radius:12px;
                                    overflow:hidden;">

                                    <!-- Header -->
                                    <tr>
                                        <td align="center"
                                            style="background:#14532D;
                                            padding:30px 20px;">

                                            <img src="cid:logo"
                                                alt="Krishi Sathi AI"
                                                width="100"
                                                style="display:block;
                                                width:100px;
                                                height:auto;
                                                margin:0 auto 15px;">

                                            <h1 style="color:#ffffff;
                                                margin:0;
                                                font-size:25px;">
                                                Krishi Sathi AI
                                            </h1>

                                            <p style="color:#dcfce7;
                                                margin:8px 0 0;
                                                font-size:14px;">
                                                Smart Farming, Better Future
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding:35px 30px;">

                                            <h2 style="color:#14532D;
                                                font-size:24px;
                                                margin:0 0 20px;">
                                                Welcome Aboard! 🌱
                                            </h2>

                                            <p style="font-size:16px;
                                                color:#333333;
                                                line-height:1.7;">
                                                Hello <b>%s</b>,
                                            </p>

                                            <p style="font-size:15px;
                                                color:#555555;
                                                line-height:1.8;">
                                                Thank you for joining
                                                <b>Krishi Sathi AI</b>.
                                                We are delighted to welcome
                                                you to our farming community!
                                            </p>

                                            <p style="font-size:15px;
                                                color:#555555;
                                                line-height:1.8;">
                                                Your journey towards smarter
                                                and more informed farming
                                                starts here.
                                            </p>

                                            <!-- Features -->
                                            <table width="100%%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="background:#f0fdf4;
                                                border-radius:8px;
                                                margin:25px 0;">

                                                <tr>
                                                    <td style="padding:20px;">

                                                        <h3 style="color:#14532D;
                                                            margin:0 0 15px;
                                                            font-size:17px;">
                                                            What you can explore
                                                        </h3>

                                                        <p style="color:#444;
                                                            font-size:14px;
                                                            margin:10px 0;">
                                                            🌾 Agricultural
                                                            product marketplace
                                                        </p>

                                                        <p style="color:#444;
                                                            font-size:14px;
                                                            margin:10px 0;">
                                                            🌿 AI-powered crop
                                                            advice
                                                        </p>

                                                        <p style="color:#444;
                                                            font-size:14px;
                                                            margin:10px 0;">
                                                            📸 Crop disease
                                                            detection
                                                        </p>

                                                        <p style="color:#444;
                                                            font-size:14px;
                                                            margin:10px 0;">
                                                            🌦️ Weather updates
                                                            for farming
                                                        </p>

                                                    </td>
                                                </tr>
                                            </table>

                                            <p style="font-size:15px;
                                                color:#555555;
                                                line-height:1.8;">
                                                We are here to support you
                                                at every step of your
                                                farming journey.
                                            </p>

                                            <h3 style="color:#14532D;
                                                margin-top:25px;">
                                                Happy Farming! 🌾
                                            </h3>

                                            <p style="color:#555555;
                                                font-size:14px;">
                                                Warm regards,<br>
                                                <b>Team Krishi Sathi AI</b>
                                            </p>

                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td align="center"
                                            style="background:#14532D;
                                            padding:20px;">

                                            <p style="color:#dcfce7;
                                                font-size:12px;
                                                margin:0;">
                                                Growing Together for a
                                                Better Agricultural Future.
                                            </p>

                                            <p style="color:#bbf7d0;
                                                font-size:11px;
                                                margin:10px 0 0;">
                                                © Krishi Sathi AI
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>
                    </table>

                </body>
                </html>
                """.formatted(safeName);

        helper.setText(html, true);

        // Attach app logo directly inside the email
        helper.addInline(
                "logo",
                new ClassPathResource("images/app_logo1.png")
        );

        mailSender.send(mimeMessage);
    }
}
