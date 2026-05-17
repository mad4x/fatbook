package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import spike.fatbook.backend.dto.DashboardWeeklyDTO;
import spike.fatbook.backend.service.DashboardService;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/weekly")
    public ResponseEntity<DashboardWeeklyDTO> getWeekly(
        Principal principal,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dashboardService.getWeeklyDashboard(principal.getName(), date));
    }
}
