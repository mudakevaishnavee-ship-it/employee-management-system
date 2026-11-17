package com.ems.config;

import com.ems.entity.Department;
import com.ems.entity.User;
import com.ems.enums.Role;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@ems.com").isEmpty()) {
            User admin = User.builder()
                    .email("admin@ems.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        if (departmentRepository.findByName("Engineering").isEmpty()) {
            departmentRepository.save(Department.builder().name("Engineering").description("Software Development").build());
            departmentRepository.save(Department.builder().name("Human Resources").description("HR Department").build());
            departmentRepository.save(Department.builder().name("Finance").description("Finance & Accounting").build());
            departmentRepository.save(Department.builder().name("Marketing").description("Marketing & Sales").build());
        }
    }
}
