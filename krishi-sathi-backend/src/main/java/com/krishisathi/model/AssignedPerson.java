package com.krishisathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Small snapshot of the seller / delivery boy stored inside the order. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignedPerson {
    private String id;
    private String name;
    private String phone;
}