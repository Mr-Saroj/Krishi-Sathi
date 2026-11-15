
package com.krishisathi.service.common;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(NotificationMessage notification) throws Exception {

        MimeMessage mimeMessage = mailSender.createMimeMessage();

        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                true,
                "UTF-8");

        helper.setFrom(senderEmail);
        helper.setTo(notification.recipient());
        helper.setSubject(notification.subject());

        // Build HTML email
        String html = buildOrderEmail(notification);

        helper.setText(html, true);

        // Add Krishi Sathi logo as inline image
        ClassPathResource logo = new ClassPathResource(
                "images/app_logo1.png");

        helper.addInline(
                "krishiLogo",
                logo,
                "image/png");

        // Send email
        mailSender.send(mimeMessage);
    }

    private String buildOrderEmail(NotificationMessage n) {

        // Product image
        String imageHtml = "";

        if (n.imageUrl() != null && !n.imageUrl().isBlank()) {

            imageHtml = """
                    <img src="%s"
                         alt="Product Image"
                         width="150"
                         style="width:150px;
                                height:150px;
                                object-fit:contain;
                                border-radius:8px;">
                    """.formatted(escapeHtml(n.imageUrl()));
        }

        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;
                             padding:20px;
                             font-family:Arial,sans-serif;
                             background:#f4f7f4;">

                    <div style="max-width:600px;
                                margin:auto;
                                background:white;
                                padding:25px;
                                border-radius:10px;">

                        <!-- Krishi Sathi Logo -->

                        <div style="text-align:center;
                                    margin-bottom:20px;">

                            <img src="cid:krishiLogo"
                                 alt="Krishi Sathi AI"
                                 width="120"
                                 style="width:120px;
                                        height:auto;
                                        display:block;
                                        margin:auto;">

                            <h2 style="color:#14532D;">
                                Krishi Sathi AI
                            </h2>

                        </div>

                        <hr>

                        <h3>Order placed successfully!</h3>

                        <p>
                            Thank you for shopping with Krishi Sathi.
                            Your order has been received successfully.
                        </p>

                        <p>
                            <strong>Order ID:</strong> %s
                        </p>

                        <hr>

                        <h3>Product Details</h3>

                        <table width="100%%" cellpadding="8">
                            <tr>

                                <td width="160" valign="top">
                                    %s
                                </td>

                                <td valign="top">

                                    <h3>%s</h3>

                                    <p>Brand: %s</p>

                                    <p>Package: %s</p>

                                    <p>Ordered Quantity: %s</p>

                                </td>

                            </tr>
                        </table>

                        <hr>

                        <h3>Price Details</h3>

                        <table width="100%%"
                               cellpadding="8"
                               style="border-collapse:collapse;">

                            <tr>
                                <td>Product Total</td>
                                <td align="right">₹%s</td>
                            </tr>

                            <tr>
                                <td>Platform Fee</td>
                                <td align="right">₹%s</td>
                            </tr>

                            <tr>
                                <td>Delivery Fee</td>
                                <td align="right">₹%s</td>
                            </tr>

                            <tr style="font-weight:bold;
                                       background:#e8f5e9;">

                                <td>Grand Total</td>

                                <td align="right">₹%s</td>

                            </tr>

                        </table>

                        <hr>

                        <h3>Payment Details</h3>

                        <p>
                            <strong>Payment Mode:</strong> %s
                        </p>

                        <p>
                            <strong>Payment Status:</strong> %s
                        </p>

                        <hr>

                        <p style="color:#14532D;
                                  margin-top:25px;
                                  text-align:center;">

                            Thank you for choosing Krishi Sathi AI!

                        </p>

                    </div>

                </body>
                </html>
                """.formatted(

                escapeHtml(n.orderId()),

                imageHtml,

                escapeHtml(n.productName()),

                escapeHtml(n.brand()),

                escapeHtml(n.productQuantity()),

                escapeHtml(String.valueOf(n.quantity())),

                escapeHtml(n.productTotal()),

                escapeHtml(n.platformFee()),

                escapeHtml(n.deliveryFee()),

                escapeHtml(n.totalSumFee()),

                escapeHtml(n.paymentMode()),

                escapeHtml(n.paymentStatus()));
    }

    // Prevent HTML injection
    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
