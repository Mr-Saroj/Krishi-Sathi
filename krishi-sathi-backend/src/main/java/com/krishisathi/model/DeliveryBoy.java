package com.krishisathi.model;



import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "delivery_boy_list")
public class DeliveryBoy {

    @Id
    private String id;

    @Indexed(unique = true)
    private String farmerEmail;

    private String city;

    private String address;

    private String pincode;

    private String vehicleType;

    private String password;

    private LocalDateTime createdAt;
}
