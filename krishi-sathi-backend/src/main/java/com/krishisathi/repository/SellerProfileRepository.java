
package com.krishisathi.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.krishisathi.model.SellerProfile;

public interface SellerProfileRepository
        extends MongoRepository<SellerProfile, String> {

    Optional<SellerProfile> findByUserId(String userId);
}
