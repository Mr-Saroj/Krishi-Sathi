package com.krishisathi.service.Farmer;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import com.krishisathi.dto.response.DiseasePredictionResponse;

@Service
public class DiseaseDetectionService {

    private final RestClient mlRestClient;

    public DiseaseDetectionService(RestClient mlRestClient) {
        this.mlRestClient = mlRestClient;
    }

    public DiseasePredictionResponse detectDisease(
            MultipartFile file) throws Exception {

        // Convert the uploaded image into a resource using ByteArrayResource, which is suitable for sending in a multipart/form-data request
        ByteArrayResource imageResource =
                new ByteArrayResource(file.getBytes()) {

                    @Override
                    public String getFilename() {
                        // Return the original filename of the uploaded file, or a default name if it's null
                        return file.getOriginalFilename() != null
                                ? file.getOriginalFilename()
                                : "leaf.jpg";
                    }
                };

        // Create multipart/form-data request
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(
                MediaType.parseMediaType(
                    // Use the content type of the uploaded file, or default to "application/octet-stream" if it's null
                        file.getContentType() != null
                                ? file.getContentType()
                                : "application/octet-stream"
                )
        );

        HttpEntity<ByteArrayResource> fileEntity =
                new HttpEntity<>(imageResource, fileHeaders);

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        // Must match FastAPI's parameter name: file
        body.add("file", fileEntity);

        // Send image to FastAPI and map its JSON response
        return mlRestClient.post()
                .uri("/predict") // Specify the endpoint URI
                .contentType(MediaType.MULTIPART_FORM_DATA)  //tell Spring Boot that the request body will be sent in multipart form-data format
                .body(body)       // Prepare image data
                .retrieve()       // Send request and retrieve response
                .body(DiseasePredictionResponse.class); // Read JSON into Java object
    }
}