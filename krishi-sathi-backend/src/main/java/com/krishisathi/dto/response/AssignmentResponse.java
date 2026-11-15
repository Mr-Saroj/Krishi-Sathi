package com.krishisathi.dto.response;

import com.krishisathi.model.AssignedPerson;

public record AssignmentResponse(
        AssignedPerson seller,
        AssignedPerson deliveryBoy
) {}