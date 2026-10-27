package com.krishisathi.repository;

import com.krishisathi.model.LoginAccess;
import com.krishisathi.model.Role;
import com.krishisathi.model.User;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AdminRepository extends MongoRepository<User, String> {

    // Find the first batch of pending sellers
    List<User> findByRoleAndLoginAccess(
            Role role,
            LoginAccess loginAccess,
            Pageable pageable
    );

    // Find the next batch using the cursor
    List<User> findByRoleAndLoginAccessAndIdLessThan(
            Role role,
            LoginAccess loginAccess,
            String id,
            Pageable pageable
    );
}