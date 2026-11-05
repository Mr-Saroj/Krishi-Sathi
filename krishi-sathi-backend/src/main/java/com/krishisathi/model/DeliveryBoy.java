package com.krishisathi.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Collection: delivery_boy_list
 * Holds the lightweight, frequently-read fields plus the login password.
 * Everything else lives in delivery_boy_profile.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "delivery_boy_list")
public class DeliveryBoy {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String mobileNumber;

    @Indexed(unique = true)
    private String farmerEmail;

    private String password; // BCrypt-hashed, never return this in API responses

    // Stored in MongoDB as "isOnline"
    @Field("isOnline")
    @Builder.Default
    private boolean online = false;

    // Stored in MongoDB as "isBusy"
    @Field("isBusy")
    @Builder.Default
    private boolean busy = false;
}