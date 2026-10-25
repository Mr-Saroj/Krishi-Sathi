package com.krishisathi.repository;

import com.krishisathi.model.Seller;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends MongoRepository<Seller, String> {

    Optional<Seller> findByEmailIgnoreCase(String email);

    Optional<Seller> findByMobileNumber(String mobileNumber);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByMobileNumber(String mobileNumber);

    List<Seller> findByLoginAccess(
            com.krishisathi.model.SellerLoginAccess loginAccess);
}