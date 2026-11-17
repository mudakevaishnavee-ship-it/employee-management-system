package com.ems.dto;

import com.ems.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private Role role;
    private String fullName;
}
