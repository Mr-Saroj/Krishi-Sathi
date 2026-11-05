package com.krishisathi.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Collection: delivery_boy_profile
 * Holds the detailed profile data, linked to delivery_boy_list by deliveryBoyId.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "delivery_boy_profile")
public class DeliveryBoyProfile {

    @Id
    private String id;

    // The _id of the matching document in delivery_boy_list
    @Indexed(unique = true)
    private String deliveryBoyId;

    private String city;
    private String address;
    private String pincode;
    private String vehicleType;

    private LocalDateTime createdAt;
}