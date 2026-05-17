package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import spike.fatbook.backend.dto.GlobalSettingsDTO;
import spike.fatbook.backend.dto.UserSettingsDTO;
import spike.fatbook.backend.service.SettingsService;

import java.security.Principal;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/me")
    public ResponseEntity<UserSettingsDTO> getMySettings(Principal principal) {
        return ResponseEntity.ok(settingsService.getUserSettings(principal.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserSettingsDTO> updateMySettings(
        Principal principal,
        @RequestBody UserSettingsDTO dto
    ) {
        return ResponseEntity.ok(settingsService.updateUserSettings(principal.getName(), dto));
    }

    @GetMapping("/global")
    @PreAuthorize("hasRole('VICEPRESIDE')")
    public ResponseEntity<GlobalSettingsDTO> getGlobalSettings() {
        return ResponseEntity.ok(settingsService.getGlobalSettings());
    }

    @PutMapping("/global")
    @PreAuthorize("hasRole('VICEPRESIDE')")
    public ResponseEntity<GlobalSettingsDTO> updateGlobalSettings(@RequestBody GlobalSettingsDTO dto) {
        return ResponseEntity.ok(settingsService.updateGlobalSettings(dto));
    }
}
