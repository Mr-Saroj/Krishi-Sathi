package com.krishisathi.service.Admin;

import com.krishisathi.dto.request.CatalogPriceUpdateRequest;
import com.krishisathi.dto.request.CatalogProductRequest;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.service.common.CloudinaryService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminCatalogService {

        private final CatalogProductRepository catalogProductRepository;

        private final CloudinaryService cloudinaryService;

        public CatalogProduct addCatalogProduct(
                        CatalogProductRequest request,
                        MultipartFile image) {

                String productId = request.id().trim();

                if (catalogProductRepository.existsById(productId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Product ID already exists");
                }

                String imageUrl = cloudinaryService.uploadPrivateImage(
                                image,
                                "krishi-sathi/catalog");

                Instant now = Instant.now();

                CatalogProduct product = CatalogProduct.builder()
                                .id(productId)
                                .category(
                                                request.category()
                                                                .trim()
                                                                .toUpperCase(Locale.ROOT)
                                                                .replace(' ', '_'))
                                .name(request.name().trim())
                                .brand(request.brand().trim())
                                .description(request.description().trim())
                                .quantity(request.quantity())
                                .quantityUnit(
                                                request.quantityUnit()
                                                                .trim()
                                                                .toUpperCase(Locale.ROOT))
                                .price(request.price())
                                .imageUrl(imageUrl)
                                .createdAt(now)
                                .updatedAt(now)
                                .build();

                return catalogProductRepository.save(product);
        }

        public List<CatalogProduct> getAllCatalogProducts() {

                return catalogProductRepository.findAll(
                                Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        public CatalogProduct updateCatalogProductPrice(
                        String productId,
                        CatalogPriceUpdateRequest request) {

                CatalogProduct product = catalogProductRepository
                                .findById(productId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Catalog product not found: " + productId));

                product.setPrice(request.price());
                product.setUpdatedAt(Instant.now());

                return catalogProductRepository.save(product);
        }
}