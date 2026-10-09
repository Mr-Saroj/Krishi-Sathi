package com.krishisathi.controller;

import com.krishisathi.dto.DiseasePredictionResponse;
import com.krishisathi.service.DiseaseDetectionService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/disease")
public class DiseaseController {

    private final DiseaseDetectionService diseaseService;

    public DiseaseController(
            DiseaseDetectionService diseaseService) {
        this.diseaseService = diseaseService;
    }

    @PostMapping(
            value = "/predict",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<DiseasePredictionResponse> predict(
            @RequestParam("file") MultipartFile file)
            throws Exception {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        DiseasePredictionResponse response =
                diseaseService.detectDisease(file);

        return ResponseEntity.ok(response);
    }
}