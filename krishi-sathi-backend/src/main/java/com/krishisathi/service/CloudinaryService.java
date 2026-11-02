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

    private final ImageOptimizationService imageOptimizationService;

    public CloudinaryService(Cloudinary cloudinary, ImageOptimizationService imageOptimizationService) {
        this.cloudinary = cloudinary;
        this.imageOptimizationService = imageOptimizationService;
    }

   public String uploadPrivateImage(
        MultipartFile file,
        String folder) {

    byte[] optimizedImage =
            imageOptimizationService.optimizeImage(file);

    try {
        Map<?, ?> result = cloudinary.uploader().upload(
                optimizedImage,
                ObjectUtils.asMap(
                        "resource_type", "image",
                        "type", "authenticated",
                        "folder", folder,
                        "public_id", UUID.randomUUID().toString(),
                        "format", "jpg",
                        "overwrite", false
                )
        );

        return result.get("secure_url").toString();

    } catch (IOException e) {
        throw new ApiException(
                "Unable to upload product image",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
}