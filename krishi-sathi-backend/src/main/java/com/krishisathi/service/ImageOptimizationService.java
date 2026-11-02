package com.krishisathi.service;

import net.coobird.thumbnailator.Thumbnails;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

@Service
public class ImageOptimizationService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private static final int MAX_WIDTH = 1200;
    private static final int MAX_HEIGHT = 1200;

    private static final int MAX_ORIGINAL_DIMENSION = 10000;

    private static final float JPEG_QUALITY = 0.82f;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public byte[] optimizeImage(MultipartFile file) {

        // 1. Validate the uploaded file.
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product image is required"
            );
        }

        // 2. Validate file size.
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Image must be 5 MB or smaller"
            );
        }

        // 3. Validate the declared content type.
        String contentType = file.getContentType();

        if (contentType == null
                || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPEG, PNG, and WebP images are supported"
            );
        }

        try {
            byte[] originalBytes = file.getBytes();

            // 4. Discover installed ImageIO readers, including WebP support.
            ImageIO.scanForPlugins();

            // 5. Decode and validate the actual image data.
            BufferedImage originalImage = ImageIO.read(
                    new ByteArrayInputStream(originalBytes)
            );

            if (originalImage == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or unsupported image. Upload a valid JPEG, PNG, or WebP file."
                );
            }

            // 6. Validate image dimensions.
            int width = originalImage.getWidth();
            int height = originalImage.getHeight();

            if (width <= 0 || height <= 0
                    || width > MAX_ORIGINAL_DIMENSION
                    || height > MAX_ORIGINAL_DIMENSION) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Image dimensions must not exceed 10000 x 10000 pixels"
                );
            }

            // 7. Resize and compress the image to JPEG.
            ByteArrayOutputStream output = new ByteArrayOutputStream();

            Thumbnails.of(originalImage)
                    .size(MAX_WIDTH, MAX_HEIGHT)
                    .outputFormat("jpg")
                    .outputQuality(JPEG_QUALITY)
                    .toOutputStream(output);

            // 8. Return the optimized image bytes.
            return output.toByteArray();

        } catch (IOException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to process product image",
                    e
            );
        }
    }
}