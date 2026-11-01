package com.krishisathi.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "farmer_profile")
public class FarmerProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private List<FarmerAddress> addresses = new ArrayList<>();
}