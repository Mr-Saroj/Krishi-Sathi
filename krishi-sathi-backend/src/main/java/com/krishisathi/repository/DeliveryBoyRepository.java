package com.krishisathi.repository;

import com.krishisathi.model.DeliveryBoy;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeliveryBoyRepository
        extends MongoRepository<DeliveryBoy, String> {

    Optional<DeliveryBoy> findByFarmerEmail(String farmerEmail);

    boolean existsByFarmerEmail(String farmerEmail);
    Optional<DeliveryBoy> findByMobileNumber(String mobileNumber);
   

   

    
}