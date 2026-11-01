
package com.krishisathi.service;

import com.krishisathi.dto.SellerInventoryPageResponse;
import com.krishisathi.dto.SellerInventoryRequest;
import com.krishisathi.dto.SellerInventoryResponse;
import com.krishisathi.dto.UpdateStockRequest;
import com.krishisathi.model.CatalogProduct;
import com.krishisathi.model.SellerInventory;
import com.krishisathi.repository.CatalogProductRepository;
import com.krishisathi.repository.SellerInventoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.data.mongodb.core.MongoTemplate;

@Service
public class SellerInventoryService {

    private final CatalogProductRepository catalogProductRepository;
    private final SellerInventoryRepository sellerInventoryRepository;
    private final MongoTemplate mongoTemplate;

    public SellerInventoryService(
            CatalogProductRepository catalogProductRepository,
            SellerInventoryRepository sellerInventoryRepository,
            MongoTemplate mongoTemplate) {

        this.catalogProductRepository = catalogProductRepository;
        this.sellerInventoryRepository = sellerInventoryRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // ==========================================
    // ADD PRODUCT TO SELLER INVENTORY
    // ==========================================

    public SellerInventory addProduct(
            String sellerId,
            SellerInventoryRequest request) {

        if (request.getStockQuantity() < 1) {
            throw new IllegalArgumentException(
                    "Stock quantity must be at least 1");
        }

        CatalogProduct product = catalogProductRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Catalog product not found"));

        boolean alreadyAccepted = sellerInventoryRepository
                .existsBySellerIdAndCatalogProductId(
                        sellerId,
                        product.getId());

        if (alreadyAccepted) {
            throw new IllegalArgumentException(
                    "You have already added this product to your inventory");
        }

        Instant now = Instant.now();

        SellerInventory inventory = SellerInventory.builder()
                .sellerId(sellerId)
                .catalogProductId(product.getId())
                .stockQuantity(request.getStockQuantity())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return sellerInventoryRepository.save(inventory);
    }

    // ==========================================
    // UPDATE SELLER STOCK
    // ==========================================

    public SellerInventory updateStock(
            String sellerId,
            String productId,
            UpdateStockRequest request) {

        if (request.getStockQuantity() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock quantity cannot be negative");
        }

        SellerInventory inventory = sellerInventoryRepository
                .findBySellerIdAndCatalogProductId(sellerId, productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inventory not found for this seller and product"));

        inventory.setStockQuantity(request.getStockQuantity());
        inventory.setUpdatedAt(Instant.now());

        return sellerInventoryRepository.save(inventory);
    }

    // ==========================================
    // GET SELLER INVENTORY WITH CATEGORY FILTER
    // ==========================================

    public SellerInventoryPageResponse getSellerInventory(
            String sellerId,
            String category,
            int page,
            int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page must be zero or greater");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Size must be between 1 and 100");
        }

        // Stage 1: Match logged-in seller
        AggregationOperation matchSeller = context ->
                new Document(
                        "$match",
                        new Document("sellerId", sellerId));

        // Stage 2: Join seller inventory with product catalogue
        AggregationOperation lookupCatalogProduct = context ->
                new Document(
                        "$lookup",
                        new Document("from", "products_catalog")
                                .append("localField", "catalogProductId")
                                .append("foreignField", "_id")
                                .append("as", "catalogProduct"));

        // Stage 3: Unwind catalogue product
        AggregationOperation unwindCatalogProduct = context ->
                new Document(
                        "$unwind",
                        "$catalogProduct");

        // Common aggregation stages
        List<AggregationOperation> commonStages = new ArrayList<>();

        commonStages.add(matchSeller);
        commonStages.add(lookupCatalogProduct);
        commonStages.add(unwindCatalogProduct);

        // Stage 4: Optional category filter
        if (category != null && !category.isBlank()
                && !category.equalsIgnoreCase("ALL")) {

            AggregationOperation matchCategory = context ->
                    new Document(
                            "$match",
                            new Document(
                                    "catalogProduct.category",
                                    category.trim().toUpperCase()));

            commonStages.add(matchCategory);
        }

        // ==========================================
        // COUNT PIPELINE
        // ==========================================

        List<AggregationOperation> countStages =
                new ArrayList<>(commonStages);

        countStages.add(Aggregation.count().as("total"));

        Aggregation countAggregation =
                Aggregation.newAggregation(countStages);

        List<Document> countResults = mongoTemplate
                .aggregate(
                        countAggregation,
                        "seller_inventory",
                        Document.class)
                .getMappedResults();

        long totalElements = countResults.isEmpty()
                ? 0
                : ((Number) countResults.get(0).get("total")).longValue();

        // ==========================================
        // DATA PIPELINE
        // ==========================================

        List<AggregationOperation> dataStages =
                new ArrayList<>(commonStages);

        // Sort newest inventory first
        dataStages.add(
                Aggregation.sort(
                        Sort.Direction.DESC,
                        "_id"));

        // Pagination
        dataStages.add(context ->
                new Document("$skip", (long) page * size));

        dataStages.add(context ->
                new Document("$limit", size));

        // ==========================================
        // PROJECT REQUIRED FIELDS
        // ==========================================

        dataStages.add(context ->
                new Document(
                        "$project",
                        new Document("_id", 0)

                                // Seller inventory fields
                                .append("id", "$_id")
                                .append("catalogProductId", "$catalogProductId")
                                .append("stockQuantity", "$stockQuantity")

                                // Catalogue product fields
                                .append("name", "$catalogProduct.name")
                                .append("category", "$catalogProduct.category")
                                .append("brand", "$catalogProduct.brand")
                                .append("price", "$catalogProduct.price")
                                .append("imageUrl", "$catalogProduct.imageUrl")
                                .append("quantity", "$catalogProduct.quantity")
                                .append("quantityUnit", "$catalogProduct.quantityUnit")
                                .append("description", "$catalogProduct.description")
                ));

        Aggregation dataAggregation =
                Aggregation.newAggregation(dataStages);

        AggregationResults<Document> results = mongoTemplate.aggregate(
                dataAggregation,
                "seller_inventory",
                Document.class);

        // ==========================================
        // MAP MONGODB DOCUMENT TO RESPONSE DTO
        // ==========================================

        List<SellerInventoryResponse> inventory =
                results.getMappedResults()
                        .stream()
                        .map(doc -> SellerInventoryResponse.builder()

                                .id(doc.get("id") == null
                                        ? null
                                        : doc.get("id").toString())

                                .catalogProductId(
                                        doc.get("catalogProductId") == null
                                                ? null
                                                : doc.get("catalogProductId").toString())

                                .name(doc.getString("name"))
                                .category(doc.getString("category"))
                                .brand(doc.getString("brand"))

                                .price(convertPrice(doc.get("price")))
                                .imageUrl(doc.getString("imageUrl"))

                                // Actual stock from seller_inventory
                                .stockQuantity(
                                        doc.get("stockQuantity") == null
                                                ? 0
                                                : ((Number) doc.get("stockQuantity"))
                                                        .intValue())

                                // Package information from products_catalog
                                .quantity(convertPrice(doc.get("quantity")))
                                .quantityUnit(doc.getString("quantityUnit"))
                                .description(doc.getString("description"))

                                .build())
                        .toList();

        // ==========================================
        // PAGINATION RESPONSE
        // ==========================================

        int totalPages = totalElements == 0
                ? 0
                : (int) Math.ceil((double) totalElements / size);

        return SellerInventoryPageResponse.builder()
                .content(inventory)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    // ==========================================
    // CONVERT MONGODB NUMBER TO BIGDECIMAL
    // ==========================================

    private BigDecimal convertPrice(Object value) {

        if (value instanceof Decimal128 decimal128) {
            return decimal128.bigDecimalValue();
        }

        if (value instanceof Number number) {
            return new BigDecimal(number.toString());
        }

        return null;
    }
}
