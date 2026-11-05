package com.krishisathi.dto;

import com.krishisathi.model.AssignedPerson;

public record AssignmentResponse(
        AssignedPerson seller,
        AssignedPerson deliveryBoy
) {}