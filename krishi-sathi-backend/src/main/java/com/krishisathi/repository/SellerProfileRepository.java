package com.krishisathi.repository;

import com.krishisathi.model.SellerProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SellerProfileRepository
        extends MongoRepository<SellerProfile, String> {

    Optional<SellerProfile> findByUserId(String userId);
    List<SellerProfile> findByCityIgnoreCase(String city);
    Optional<SellerProfile> findFirstByCityIgnoreCase(String city);
}