package com.krishisathi.service;

import com.krishisathi.dto.SellerCatalogPageResponse;
import com.krishisathi.dto.SellerCatalogResponse;

import lombok.RequiredArgsConstructor;

import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerCatalogService {

        private final MongoTemplate mongoTemplate;

        public SellerCatalogPageResponse getAvailableCatalog(
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

                // Match products in the requested category.
                AggregationOperation matchCategory = context -> new Document("$match",
                                new Document("category", category));

                /*
                 * Find an inventory record for the same product
                 * and the currently logged-in seller.
                 */
                AggregationOperation lookupInventory = context -> new Document("$lookup",
                                new Document("from", "seller_inventory")
                                                .append("let",
                                                                new Document(
                                                                                "productId", "$_id"))
                                                .append("pipeline", List.of(
                                                                new Document("$match",
                                                                                new Document("$expr",
                                                                                                new Document("$and",
                                                                                                                List.of(
                                                                                                                                new Document(
                                                                                                                                                "$eq",
                                                                                                                                                List.of(
                                                                                                                                                                "$catalogProductId",
                                                                                                                                                                "$$productId")),
                                                                                                                                new Document(
                                                                                                                                                "$eq",
                                                                                                                                                List.of(
                                                                                                                                                                "$sellerId",
                                                                                                                                                                sellerId)))))),
                                                                new Document("$limit", 1)))
                                                .append("as", "existingInventory"));

                // Keep products that have no inventory record for this seller.
                AggregationOperation excludeAccepted = context -> new Document("$match",
                                new Document("existingInventory",
                                                new Document("$eq", List.of())));

                // Count the total available products.
                Aggregation countAggregation = Aggregation.newAggregation(
                                matchCategory,
                                lookupInventory,
                                excludeAccepted,
                                Aggregation.count().as("total"));

                List<Document> countResults = mongoTemplate
                                .aggregate(
                                                countAggregation,
                                                "products_catalog",
                                                Document.class)
                                .getMappedResults();

                long totalElements = countResults.isEmpty()
                                ? 0
                                : ((Number) countResults.get(0).get("total")).longValue();

                // Fetch only the requested page.
                AggregationOperation sortProducts = Aggregation.sort(Sort.Direction.ASC, "_id");

                AggregationOperation skipProducts = context -> new Document("$skip", (long) page * size);

                AggregationOperation limitProducts = context -> new Document("$limit", size);

                AggregationOperation removeLookupField = context -> new Document("$project",
                                new Document("existingInventory", 0));

                Aggregation dataAggregation = Aggregation.newAggregation(
                                matchCategory,
                                lookupInventory,
                                excludeAccepted,
                                sortProducts,
                                skipProducts,
                                limitProducts,
                                removeLookupField);

                AggregationResults<Document> results = mongoTemplate.aggregate(
                                dataAggregation,
                                "products_catalog",
                                Document.class);

                List<SellerCatalogResponse> products = results.getMappedResults()
                                .stream()
                                .map(doc -> SellerCatalogResponse.builder()
                                                .id(doc.getString("_id"))
                                                .name(doc.getString("name"))
                                                .category(doc.getString("category"))
                                                .brand(doc.getString("brand"))
                                                .quantity(doc.get("quantity") instanceof org.bson.types.Decimal128
                                                                ? ((org.bson.types.Decimal128) doc.get("quantity"))
                                                                                .bigDecimalValue()
                                                                : doc.get("quantity") instanceof Number
                                                                                ? new java.math.BigDecimal(doc
                                                                                                .get("quantity")
                                                                                                .toString())
                                                                                : null)

                                                .quantityUnit(doc.getString("quantityUnit"))

                                                .description(doc.getString("description"))
                                                .price(doc.get("price") instanceof Number
                                                                ? new java.math.BigDecimal(
                                                                                doc.get("price").toString())
                                                                : doc.get("price") instanceof org.bson.types.Decimal128
                                                                                ? ((org.bson.types.Decimal128) doc
                                                                                                .get("price"))
                                                                                                .bigDecimalValue()
                                                                                : null)
                                                .imageUrl(doc.getString("imageUrl"))
                                                .build())
                                .toList();

                int totalPages = totalElements == 0
                                ? 0
                                : (int) Math.ceil((double) totalElements / size);

                return SellerCatalogPageResponse.builder()
                                .content(products)
                                .page(page)
                                .size(size)
                                .totalElements(totalElements)
                                .totalPages(totalPages)
                                .build();
        }
}