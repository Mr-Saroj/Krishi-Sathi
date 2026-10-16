
package com.krishisathi.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatStreamRequest {

    @NotBlank
    @Size(max = 2000)
    private String prompt;

    @Min(1)
    @Max(10)
    private int topK = 3;

    private String conversationId;
}
