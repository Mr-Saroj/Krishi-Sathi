package com.krishisathi.repository;

import com.krishisathi.model.DeliveryBoyProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeliveryBoyProfileRepository extends MongoRepository<DeliveryBoyProfile, String> {

    Optional<DeliveryBoyProfile> findByDeliveryBoyId(String deliveryBoyId);
}