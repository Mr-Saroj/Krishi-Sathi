package com.krishisathi.service.common;

public record WelcomeEmailMessage(
        String recipient,
        String fullName
) {
}