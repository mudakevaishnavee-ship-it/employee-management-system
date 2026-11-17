package com.ems.service;

import com.ems.config.JwtUtil;
import com.ems.dto.LoginRequest;
import com.ems.dto.LoginResponse;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.exception.BadRequestException;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        String fullName = "Admin";
        Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
        if (employee != null) {
            fullName = employee.getFirstName() + " " + employee.getLastName();
        }

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole(), fullName);
    }
}
