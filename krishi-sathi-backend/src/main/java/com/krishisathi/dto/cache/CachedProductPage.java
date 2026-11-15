
package com.krishisathi.dto.cache;

import java.util.List;

import com.krishisathi.dto.response.FarmerShopProductResponse;


public record CachedProductPage(
        List<FarmerShopProductResponse> content,
        int number,
        int size,
        long totalElements
) {}
