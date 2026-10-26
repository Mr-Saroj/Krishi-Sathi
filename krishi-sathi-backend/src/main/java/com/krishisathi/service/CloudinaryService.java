package com.krishisathi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.krishisathi.exception.ApiException;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadPrivateImage(
            MultipartFile file,
            String folder) {

        if (file == null || file.isEmpty()) {
            throw new ApiException(
                    "Both document images are required",
                    HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ApiException(
                    "Each image must be 5 MB or smaller",
                    HttpStatus.BAD_REQUEST);
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ApiException(
                    "Only JPEG, PNG, and WebP images are allowed",
                    HttpStatus.BAD_REQUEST);
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "type", "authenticated",
                            "folder", folder,
                            "public_id", UUID.randomUUID().toString(),
                            "overwrite", false));

            return result.get("secure_url").toString();

        } catch (IOException e) {
            throw new ApiException(
                    "Unable to upload document",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}